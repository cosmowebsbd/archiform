'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { apolloClient } from '@/lib/apollo-client'
import { gql } from '@apollo/client'
import { formatCurrency } from '@/lib/utils'

const GET_TIME_DATA = gql`
  query {
    timeEntries(from: "2024-01-01", to: "2027-01-01") {
      id
      hours
      description
      entryDate
      isBillable
      staff { id user { firstName lastName } }
      project { id name }
    }
    projects { id name status }
    staff { id user { firstName lastName } }
  }
`

function LogTimeModal({ onClose, onLogged, projects, staff }: {
  onClose: () => void
  onLogged: () => void
  projects: any[]
  staff: any[]
}) {
  const [form, setForm] = useState({
    staffId: staff[0]?.id || '',
    projectId: projects[0]?.id || '',
    hours: '',
    description: '',
    entryDate: new Date().toISOString().split('T')[0],
    isBillable: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: any) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.staffId) { setError('Select a staff member'); return }
    if (!form.projectId) { setError('Select a project'); return }
    if (!form.hours || Number(form.hours) <= 0) { setError('Hours must be greater than 0'); return }

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
            logTime(input: {
              staffId: "${form.staffId}"
              projectId: "${form.projectId}"
              entryDate: "${form.entryDate}"
              hours: ${parseFloat(form.hours)}
              description: "${form.description.replace(/"/g, '\\"')}"
              isBillable: ${form.isBillable}
            }) {
              id hours entryDate description isBillable
              staff { user { firstName lastName } }
              project { name }
            }
          }`
        }),
      })
      const json = await response.json()
      if (json.errors) { setError(json.errors[0]?.message || 'Failed to log time'); return }
      onLogged()
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
          <h2 className="text-lg font-semibold text-navy-900">Log time</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Staff member *
            </label>
            <select
              value={form.staffId}
              onChange={e => set('staffId', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select staff member</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.user.firstName} {s.user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Project *
            </label>
            <select
              value={form.projectId}
              onChange={e => set('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              value={form.entryDate}
              onChange={e => set('entryDate', e.target.value)}
            />
            <Input
              label="Hours *"
              type="number"
              step="0.5"
              placeholder="e.g. 2.5"
              value={form.hours}
              onChange={e => set('hours', e.target.value)}
            />
          </div>

          <Input
            label="Description"
            placeholder="What did you work on?"
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="billable"
              checked={form.isBillable}
              onChange={e => set('isBillable', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-500"
            />
            <label htmlFor="billable" className="text-sm text-navy-900">
              Billable time
            </label>
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Log Time</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TimePage() {
  const [entries, setEntries] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchData = () => {
    setLoading(true)
    apolloClient.query({ query: GET_TIME_DATA, fetchPolicy: 'network-only' })
      .then(result => {
        setEntries(result.data?.timeEntries || [])
        setProjects(result.data?.projects || [])
        setStaff(result.data?.staff || [])
        setLoading(false)
      })
      .catch(err => { console.error(err); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0)
  const billableHours = entries.filter(e => e.isBillable).reduce((sum, e) => sum + e.hours, 0)

  return (
    <>
      <div className="app-topbar">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold text-navy-900">Time</h1>
          <Button
            onClick={() => setShowModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            disabled={projects.length === 0 || staff.length === 0}
          >
            Log time
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Total Hours
            </p>
            <p className="text-2xl font-semibold text-navy-900">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Billable Hours
            </p>
            <p className="text-2xl font-semibold text-navy-900">{billableHours.toFixed(1)}h</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Entries
            </p>
            <p className="text-2xl font-semibold text-navy-900">{entries.length}</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent
              rounded-full animate-spin" />
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center
              justify-center mb-6">
              <Clock className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900 mb-2">
              No time entries yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              {projects.length === 0 || staff.length === 0
                ? 'Add projects and staff members first before logging time.'
                : 'Start tracking time against your projects.'}
            </p>
            {projects.length > 0 && staff.length > 0 && (
              <Button
                onClick={() => setShowModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Log your first time entry
              </Button>
            )}
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left text-xs font-semibold text-muted-foreground
                    uppercase tracking-wide px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground
                    uppercase tracking-wide px-4 py-3">Staff</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground
                    uppercase tracking-wide px-4 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground
                    uppercase tracking-wide px-4 py-3">Description</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground
                    uppercase tracking-wide px-4 py-3">Hours</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground
                    uppercase tracking-wide px-4 py-3">Billable</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.id}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 text-sm text-navy-900">{entry.entryDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={`${entry.staff.user.firstName} ${entry.staff.user.lastName}`}
                          size="xs"
                        />
                        <span className="text-sm text-navy-900">
                          {entry.staff.user.firstName} {entry.staff.user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-navy-900">{entry.project.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {entry.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-navy-900 text-right">
                      {entry.hours}h
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        entry.isBillable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {entry.isBillable ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <LogTimeModal
          onClose={() => setShowModal(false)}
          onLogged={fetchData}
          projects={projects}
          staff={staff}
        />
      )}
    </>
  )
}