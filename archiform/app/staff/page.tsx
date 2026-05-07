'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Mail, Briefcase } from 'lucide-react'
import { gql } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { apolloClient } from '@/lib/apollo-client'
import { cn, formatCurrency } from '@/lib/utils'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useRole } from '@/hooks/useRole'

const GET_STAFF = gql`
  query {
    staff {
      id
      title
      department
      hourlyRate
      targetUtilization
      isActive
      user {
        id
        firstName
        lastName
        email
        avatarUrl
      }
    }
  }
`

const ADD_STAFF = gql`
  mutation AddStaff($input: AddStaffInput!) {
    addStaffMember(input: $input) {
      id
      title
      department
      hourlyRate
      targetUtilization
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`

function AddStaffModal({ onClose, onAdded }: {
  onClose: () => void
  onAdded: () => void
}) {
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    title: '', department: '', hourlyRate: '', targetUtilization: '80',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.firstName || !form.lastName) {
      setError('Email, first name and last name are required')
      return
    }
    if (!form.hourlyRate || Number(form.hourlyRate) <= 0) {
      setError('Hourly rate must be greater than 0')
      return
    }
    setLoading(true)
    setError('')
    try {
      await apolloClient.mutate({
        mutation: ADD_STAFF,
        variables: {
          input: {
            email: form.email.toLowerCase().trim(),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            title: form.title.trim() || null,
            department: form.department.trim() || null,
            hourlyRate: parseFloat(form.hourlyRate),
            targetUtilization: parseInt(form.targetUtilization) || 80,
            role: 'MEMBER',
          },
        },
      })
      await apolloClient.clearStore()
      onAdded()
      onClose()
    } catch (err: any) {
      setError(err?.graphQLErrors?.[0]?.message || 'Failed to add staff member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-navy-900">Add staff member</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name *" value={form.firstName}
              onChange={e => set('firstName', e.target.value)} autoFocus />
            <Input label="Last name *" value={form.lastName}
              onChange={e => set('lastName', e.target.value)} />
          </div>
          <Input label="Work email *" type="email" value={form.email}
            onChange={e => set('email', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Title" placeholder="e.g. Senior Designer"
              value={form.title} onChange={e => set('title', e.target.value)} />
            <Input label="Department" placeholder="e.g. Design"
              value={form.department}
              onChange={e => set('department', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hourly rate ($) *" type="number" placeholder="e.g. 125"
              value={form.hourlyRate}
              onChange={e => set('hourlyRate', e.target.value)} />
            <Input label="Target utilization (%)" type="number"
              placeholder="80" value={form.targetUtilization}
              onChange={e => set('targetUtilization', e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Add Staff Member</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InviteModal({ onClose, onInvited }: {
  onClose: () => void
  onInvited: () => void
}) {
  const [form, setForm] = useState({
    email: '', firstName: '', role: 'MEMBER'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim()) { setError('Email is required'); return }
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('archiform_token')
      const res = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation {
            sendInvitation(
              email: "${form.email.trim()}"
              ${form.firstName ? `firstName: "${form.firstName.trim()}"` : ''}
              role: ${form.role}
            ) { id email status }
          }`
        }),
      })
      const json = await res.json()
      if (json.errors) {
        setError(json.errors[0]?.message || 'Failed to send invitation')
        return
      }
      setSuccess(true)
      setTimeout(() => { onInvited(); onClose() }, 2000)
    } catch {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-navy-900">
            Invite team member
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center
              justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">
              Invitation sent!
            </h3>
            <p className="text-sm text-muted-foreground">
              An email has been sent to <strong>{form.email}</strong> with
              instructions to join your firm.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
            <Input label="Email address *" type="email"
              placeholder="colleague@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              autoFocus />
            <Input label="First name (optional)"
              placeholder="Jane"
              value={form.firstName}
              onChange={e => setForm(f => ({
                ...f, firstName: e.target.value
              }))} />
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Role
              </label>
              <select value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                They'll receive an email with a link to set their password
                and join your firm. The link expires in 7 days.
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Send Invitation
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const { canManageStaff } = useRole()

  const fetchStaff = () => {
    setLoading(true)
    apolloClient.clearStore().then(() => {
      apolloClient.query({
        query: GET_STAFF,
        fetchPolicy: 'network-only'
      })
      .then(result => {
        setStaff(result.data?.staff || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
    })
  }

  useEffect(() => { fetchStaff() }, [])

  return (
    <>
      <div className="app-topbar">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold text-navy-900">Staff</h1>
          <div className="flex items-center gap-2">
            {canManageStaff && (
              <Button
                variant="outline"
                onClick={() => setShowInviteModal(true)}
                leftIcon={<Mail className="w-4 h-4" />}
              >
                Invite
              </Button>
            )}
            {canManageStaff && (
              <Button
                onClick={() => setShowModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add staff member
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && staff.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center
              justify-center mb-6"
            >
              <Briefcase className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900 mb-2">
              Build your team
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              Add staff members to assign them to projects, track time, and
              monitor utilization.
            </p>
            {canManageStaff && (
              <Button
                onClick={() => setShowModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add your first staff member
              </Button>
            )}
          </div>
        )}

        {!loading && staff.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-border p-5
                  hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Avatar
                    name={`${member.user.firstName} ${member.user.lastName}`}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy-900">
                      {member.user.firstName} {member.user.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {member.title || "No title"}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground truncate">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Hourly Rate</p>
                    <p className="text-sm font-semibold text-navy-900 mt-0.5">
                      {formatCurrency(member.hourlyRate)}/hr
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-semibold text-navy-900 mt-0.5">
                      {member.department || "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <div
                    className="flex justify-between text-xs
                    text-muted-foreground mb-1.5"
                  >
                    <span>Target utilization</span>
                    <span>{member.targetUtilization}%</span>
                  </div>
                  <Progress
                    value={member.targetUtilization}
                    max={100}
                    size="sm"
                    variant={
                      member.targetUtilization >= 90 ? "warning" : "success"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddStaffModal
          onClose={() => setShowModal(false)}
          onAdded={fetchStaff}
        />
      )}

      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInvited={fetchStaff}
        />
      )}
    </>
  );
}