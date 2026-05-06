'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Users, Mail, Phone, Building2 } from 'lucide-react'
import { gql } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { apolloClient } from '@/lib/apollo-client'

const GET_CONTACTS = gql`
  query {
    contacts {
      id
      name
      email
      phone
      company
      city
      country
      notes
    }
  }
`

function AddContactModal({ onClose, onAdded }: {
  onClose: () => void
  onAdded: () => void
}) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    company: '', city: '', country: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError('')
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
            createContact(input: {
              name: "${form.name.trim().replace(/"/g, '\\"')}"
              ${form.email ? `email: "${form.email.trim()}"` : ''}
              ${form.phone ? `phone: "${form.phone.trim()}"` : ''}
              ${form.company ? `company: "${form.company.trim()}"` : ''}
              ${form.city ? `city: "${form.city.trim()}"` : ''}
              ${form.country ? `country: "${form.country.trim()}"` : ''}
              ${form.notes ? `notes: "${form.notes.trim().replace(/"/g, '\\"')}"` : ''}
            }) {
              id name email phone company city country
            }
          }`
        }),
      })
      const json = await response.json()
      if (json.errors) { setError(json.errors[0]?.message || 'Failed to create contact'); return }
      await apolloClient.clearStore()
      onAdded()
      onClose()
    } catch (err) {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-navy-900">Add contact</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <Input label="Full name *" value={form.name}
            onChange={e => set('name', e.target.value)} autoFocus />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email}
              onChange={e => set('email', e.target.value)} />
            <Input label="Phone" value={form.phone}
              onChange={e => set('phone', e.target.value)} />
          </div>
          <Input label="Company" value={form.company}
            onChange={e => set('company', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={form.city}
              onChange={e => set('city', e.target.value)} />
            <Input label="Country" value={form.country}
              onChange={e => set('country', e.target.value)} />
          </div>
          <Input label="Notes" value={form.notes}
            onChange={e => set('notes', e.target.value)} />
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Add Contact</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const fetchContacts = () => {
    setLoading(true)
    apolloClient.query({ query: GET_CONTACTS, fetchPolicy: 'network-only' })
      .then(result => {
        setContacts(result.data?.contacts || [])
        setLoading(false)
      })
      .catch(err => { console.error(err); setLoading(false) })
  }

  useEffect(() => { fetchContacts() }, [])

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this contact?')) return
    try {
      const token = localStorage.getItem('archiform_token')
      await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation { deleteContact(id: "${id}") }`
        }),
      })
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch (err) { console.error(err) }
  }

  return (
    <>
      <div className="app-topbar">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold text-navy-900">Contacts</h1>
          <Button onClick={() => setShowModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}>
            Add contact
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full max-w-sm px-4 py-2 border border-border rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent
              rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center
              justify-center mb-6">
              <Users className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900 mb-2">
              {search ? 'No contacts found' : 'No contacts yet'}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              {search
                ? 'Try a different search term.'
                : 'Add clients and contacts to assign them to projects and invoices.'}
            </p>
            {!search && (
              <Button onClick={() => setShowModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}>
                Add your first contact
              </Button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(contact => (
              <div key={contact.id}
                className="bg-white rounded-xl border border-border p-5
                  hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={contact.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy-900 truncate">
                      {contact.name}
                    </h3>
                    {contact.company && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.company}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">
                    Delete
                  </button>
                </div>

                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <a href={`mailto:${contact.email}`}
                        className="text-sm text-brand-500 hover:underline truncate">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{contact.phone}</span>
                    </div>
                  )}
                  {(contact.city || contact.country) && (
                    <p className="text-xs text-muted-foreground">
                      📍 {[contact.city, contact.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {contact.notes && (
                    <p className="text-xs text-muted-foreground italic line-clamp-2">
                      {contact.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddContactModal
          onClose={() => setShowModal(false)}
          onAdded={fetchContacts}
        />
      )}
    </>
  )
}