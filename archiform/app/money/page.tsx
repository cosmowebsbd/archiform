'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, FileText, Download } from 'lucide-react'
import { gql } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apolloClient } from '@/lib/apollo-client'
import { cn, formatCurrency } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'
import { SkeletonTable } from '@/components/ui/skeleton'
import { useRole } from '@/hooks/useRole'
import ConfirmModal from '@/components/ui/confirm-modal'

const GET_INVOICES = gql`
  query {
    invoices {
      id
      invoiceNumber
      status
      issueDate
      dueDate
      subtotal
      taxAmount
      total
      project { id name }
      contact { id name }
      lineItems {
        id
        description
        quantity
        unitPrice
        amount
      }
    }
    projects { id name }
    contacts { id name }
  }
`

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'Draft',     color: 'text-gray-500',   bg: 'bg-gray-100' },
  SENT:      { label: 'Sent',      color: 'text-blue-700',   bg: 'bg-blue-100' },
  VIEWED:    { label: 'Viewed',    color: 'text-purple-700', bg: 'bg-purple-100' },
  PAID:      { label: 'Paid',      color: 'text-green-700',  bg: 'bg-green-100' },
  OVERDUE:   { label: 'Overdue',   color: 'text-red-700',    bg: 'bg-red-100' },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-400',   bg: 'bg-gray-50' },
}

function CreateInvoiceModal({ onClose, onCreated, projects, contacts }: {
  onClose: () => void
  onCreated: () => void
  projects: any[]
  contacts: any[]
}) {
  const [form, setForm] = useState({
    projectId: projects[0]?.id || '',
    contactId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: '0',
    notes: '',
  })
  const [lineItems, setLineItems] = useState([
    { description: '', quantity: '1', unitPrice: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  const setLineItem = (index: number, field: string, value: string) => {
    setLineItems(prev => prev.map((li, i) =>
      i === index ? { ...li, [field]: value } : li
    ))
  }

  const addLineItem = () =>
    setLineItems(prev => [...prev, { description: '', quantity: '1', unitPrice: '' }])

  const removeLineItem = (index: number) =>
    setLineItems(prev => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectId) { setError('Select a project'); return }
    const validItems = lineItems.filter(li => li.description && li.unitPrice)
    if (validItems.length === 0) { setError('Add at least one line item'); return }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('archiform_token')
      const lineItemsGql = validItems.map(li =>
        `{ description: "${li.description.replace(/"/g, '\\"')}" quantity: ${parseFloat(li.quantity) || 1} unitPrice: ${parseFloat(li.unitPrice)} isBillable: true }`
      ).join(' ')

      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation {
            createInvoice(input: {
              projectId: "${form.projectId}"
              ${form.contactId ? `contactId: "${form.contactId}"` : ''}
              issueDate: "${form.issueDate}"
              dueDate: "${form.dueDate}"
              taxRate: ${parseFloat(form.taxRate) / 100 || 0}
              ${form.notes ? `notes: "${form.notes.replace(/"/g, '\\"')}"` : ''}
              lineItems: [${lineItemsGql}]
            }) {
              id invoiceNumber status total
            }
          }`
        }),
      })
      const json = await response.json()
      if (json.errors) {
        setError(json.errors[0]?.message || 'Failed to create invoice')
        return
      }
      await apolloClient.clearStore()
      onCreated()
      onClose()
    } catch (err) {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = lineItems.reduce((sum, li) => {
    const qty = parseFloat(li.quantity) || 0
    const price = parseFloat(li.unitPrice) || 0
    return sum + qty * price
  }, 0)
  const tax = subtotal * (parseFloat(form.taxRate) / 100 || 0)
  const total = subtotal + tax

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl
        max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border
          sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-navy-900">Create invoice</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Project *
              </label>
              <select value={form.projectId}
                onChange={e => setField('projectId', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Client
              </label>
              <select value={form.contactId}
                onChange={e => setField('contactId', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">No client</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Issue date *" type="date" value={form.issueDate}
              onChange={e => setField('issueDate', e.target.value)} />
            <Input label="Due date *" type="date" value={form.dueDate}
              onChange={e => setField('dueDate', e.target.value)} />
            <Input label="Tax rate (%)" type="number" placeholder="0"
              value={form.taxRate}
              onChange={e => setField('taxRate', e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-navy-900">Line items</h3>
              <button type="button" onClick={addLineItem}
                className="text-xs text-brand-500 hover:underline font-medium">
                + Add line
              </button>
            </div>
            <div className="space-y-2">
              {lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <input value={li.description}
                      onChange={e => setLineItem(i, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-2 border border-border rounded-lg
                        text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div className="col-span-2">
                    <input value={li.quantity} type="number"
                      onChange={e => setLineItem(i, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full px-3 py-2 border border-border rounded-lg
                        text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div className="col-span-3">
                    <input value={li.unitPrice} type="number"
                      onChange={e => setLineItem(i, 'unitPrice', e.target.value)}
                      placeholder="Unit price"
                      className="w-full px-3 py-2 border border-border rounded-lg
                        text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {lineItems.length > 1 && (
                      <button type="button" onClick={() => removeLineItem(i)}
                        className="text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({form.taxRate}%)</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold
              border-t border-border pt-2">
              <span className="text-navy-900">Total</span>
              <span className="text-navy-900">{formatCurrency(total)}</span>
            </div>
          </div>

          <Input label="Notes" placeholder="Payment terms, bank details, etc."
            value={form.notes}
            onChange={e => setField('notes', e.target.value)} />

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Invoice</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MoneyPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string; number: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { canManageInvoices } = useRole()

  const fetchData = () => {
    setLoading(true)
    apolloClient.query({ query: GET_INVOICES, fetchPolicy: 'network-only' })
      .then(result => {
        setInvoices(result.data?.invoices || [])
        setProjects(result.data?.projects || [])
        setContacts(result.data?.contacts || [])
        setLoading(false)
      })
      .catch(err => { console.error(err); setLoading(false) })
  }

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const token = localStorage.getItem('archiform_token')
      const response = await fetch(
        `http://localhost:8080/api/invoices/${invoiceId}/pdf`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: 'application/pdf' })
      )
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', `${invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download failed:', err)
      alert('Failed to download PDF. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const token = localStorage.getItem('archiform_token')
      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation { deleteInvoice(id: "${confirmDelete.id}") }`
        }),
      })
      const json = await response.json()
      if (!json.errors) {
        setInvoices(prev => prev.filter(i => i.id !== confirmDelete.id))
        setConfirmDelete(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const totalRevenue = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.total, 0)
  const outstanding = invoices
    .filter(i => ['SENT', 'VIEWED', 'OVERDUE'].includes(i.status))
    .reduce((sum, i) => sum + i.total, 0)
  const draft = invoices
    .filter(i => i.status === 'DRAFT')
    .reduce((sum, i) => sum + i.total, 0)

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('archiform_token')
      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation {
            updateInvoiceStatus(id: "${id}", status: ${status}) { id status }
          }`
        }),
      })
      const json = await response.json()
      if (!json.errors) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className="app-topbar">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold text-navy-900">Money</h1>
          {canManageInvoices && (
            <Button onClick={() => setShowModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              disabled={projects.length === 0}>
              New invoice
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Total Collected
            </p>
            <p className="text-2xl font-semibold text-green-600">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Outstanding
            </p>
            <p className="text-2xl font-semibold text-orange-600">
              {formatCurrency(outstanding)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Draft
            </p>
            <p className="text-2xl font-semibold text-navy-900">
              {formatCurrency(draft)}
            </p>
          </div>
        </div>

        {loading && <SkeletonTable rows={4} cols={8} />}

        {!loading && invoices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center
              justify-center mb-6">
              <FileText className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900 mb-2">
              No invoices yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              {projects.length === 0
                ? 'Create a project first before creating invoices.'
                : 'Create your first invoice to start billing clients.'}
            </p>
            {projects.length > 0 && canManageInvoices && (
              <Button onClick={() => setShowModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}>
                Create your first invoice
              </Button>
            )}
          </div>
        )}

        {!loading && invoices.length > 0 && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  {['Invoice #', 'Project', 'Client', 'Issue Date',
                    'Due Date', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold
                      text-muted-foreground uppercase tracking-wide px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, i) => {
                  const cfg = statusConfig[invoice.status] || statusConfig.DRAFT
                  return (
                    <tr key={invoice.id}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-3 text-sm font-medium text-navy-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-navy-900">
                        {invoice.project?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {invoice.contact?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-navy-900">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          cfg.bg, cfg.color
                        )}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {canManageInvoices && invoice.status === 'DRAFT' && (
                            <button
                              onClick={() => updateStatus(invoice.id, 'SENT')}
                              className="text-xs text-brand-500 hover:underline
                                font-medium">
                              Send
                            </button>
                          )}
                          {canManageInvoices && invoice.status === 'SENT' && (
                            <button
                              onClick={() => updateStatus(invoice.id, 'PAID')}
                              className="text-xs text-green-600 hover:underline
                                font-medium">
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPdf(
                              invoice.id, invoice.invoiceNumber
                            )}
                            className="text-xs text-brand-500 hover:text-brand-600
                              font-medium flex items-center gap-1"
                            title="Download PDF">
                            <Download className="w-3 h-3" />
                            PDF
                          </button>
                          {canManageInvoices && invoice.status === 'DRAFT' && (
                            <button
                              onClick={() => setConfirmDelete({
                                id: invoice.id,
                                number: invoice.invoiceNumber
                              })}
                              className="text-xs text-red-400 hover:text-red-600
                                font-medium">
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CreateInvoiceModal
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
          projects={projects}
          contacts={contacts}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete invoice?"
          message={`Are you sure you want to delete invoice "${confirmDelete.number}"? Only draft invoices can be deleted. This action cannot be undone.`}
          confirmLabel="Delete invoice"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}