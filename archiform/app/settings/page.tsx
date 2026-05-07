'use client'

import React, { useState, useEffect } from 'react'
import { Building2, User, Lock, Bell, CreditCard, ChevronRight, Save, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { gql } from '@apollo/client'
import { apolloClient } from '@/lib/apollo-client'

const GET_SETTINGS = gql`
  query {
    me { id email firstName lastName avatarUrl }
    firm { id name industry employeeCount location plan trialEndsAt }
  }
`

const tabs = [
  { id: 'firm',     label: 'Firm',     icon: Building2 },
  { id: 'profile',  label: 'Profile',  icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'billing',  label: 'Billing',  icon: CreditCard },
]

const industries = [
  'ARCHITECTURE', 'ENGINEERING', 'INTERIOR_DESIGN',
  'LANDSCAPE', 'URBAN_PLANNING', 'NOT_LISTED'
]

const industryLabels: Record<string, string> = {
  ARCHITECTURE: 'Architecture',
  ENGINEERING: 'Engineering',
  INTERIOR_DESIGN: 'Interior Design',
  LANDSCAPE: 'Landscape Architecture',
  URBAN_PLANNING: 'Urban Planning',
  NOT_LISTED: 'Other',
}

const planConfig: Record<string, { label: string; color: string; bg: string; features: string[] }> = {
  TRIAL: {
    label: 'Trial Plan',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    features: ['Up to 3 projects', '2 staff members', 'Basic invoicing', '14-day trial'],
  },
  STARTER: {
    label: 'Starter Plan',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    features: ['Up to 10 projects', '5 staff members', 'Full invoicing', 'Analytics'],
  },
  PROFESSIONAL: {
    label: 'Professional Plan',
    color: 'text-brand-700',
    bg: 'bg-brand-50',
    features: ['Unlimited projects', 'Unlimited staff', 'PDF invoices', 'API access', 'Priority support'],
  },
  ENTERPRISE: {
    label: 'Enterprise Plan',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
  },
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('firm')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [firm, setFirm] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  const [firmForm, setFirmForm] = useState({
    name: '', industry: '', employeeCount: '', location: '',
  })
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', email: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })

  useEffect(() => {
    apolloClient.query({ query: GET_SETTINGS, fetchPolicy: 'network-only' })
      .then(r => {
        const f = r.data?.firm
        const u = r.data?.me
        setFirm(f)
        setUser(u)
        setFirmForm({
          name: f?.name || '',
          industry: f?.industry || 'ARCHITECTURE',
          employeeCount: String(f?.employeeCount || ''),
          location: f?.location || '',
        })
        setProfileForm({
          firstName: u?.firstName || '',
          lastName: u?.lastName || '',
          email: u?.email || '',
        })
        setLoading(false)
      })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  const handleSaveFirm = async () => {
  setSaving(true)
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
          updateFirm(input: {
            name: "${firmForm.name.replace(/"/g, '\\"')}"
            industry: ${firmForm.industry}
            employeeCount: ${parseInt(firmForm.employeeCount) || 1}
            location: "${firmForm.location.replace(/"/g, '\\"')}"
          }) { id name industry employeeCount location }
        }`
      }),
    })
    const json = await res.json()
    if (!json.errors) {
      const updatedFirm = { ...firm, ...json.data?.updateFirm }
      localStorage.setItem('archiform_firm', JSON.stringify(updatedFirm))

      // Notify sidebar to update
      window.dispatchEvent(new CustomEvent('archiform:firm-updated', {
        detail: updatedFirm
      }))

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  } catch (e) { console.error(e) }
  finally { setSaving(false) }
}

  const handleSaveProfile = async () => {
  setSaving(true)
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
          updateProfile(input: {
            firstName: "${profileForm.firstName.replace(/"/g, '\\"')}"
            lastName: "${profileForm.lastName.replace(/"/g, '\\"')}"
          }) { id firstName lastName email }
        }`
      }),
    })
    const json = await res.json()
    if (!json.errors) {
      const updatedUser = { ...user, ...json.data?.updateProfile }
      localStorage.setItem('archiform_user', JSON.stringify(updatedUser))

      // Notify sidebar to update
      window.dispatchEvent(new CustomEvent('archiform:user-updated', {
        detail: updatedUser
      }))

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  } catch (e) { console.error(e) }
  finally { setSaving(false) }
}

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }
    setSaving(true)
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
            changePassword(input: {
              currentPassword: "${passwordForm.currentPassword}"
              newPassword: "${passwordForm.newPassword}"
            })
          }`
        }),
      })
      const json = await res.json()
      if (!json.errors) {
        setSaved(true)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert(json.errors[0]?.message || 'Failed to change password')
      }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div>
      <div className="app-topbar">
        <h1 className="text-lg font-semibold text-navy-900">Settings</h1>
      </div>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  const plan = planConfig[firm?.plan] || planConfig.TRIAL
  const daysLeft = firm?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(firm.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div>
      <div className="app-topbar">
        <h1 className="text-lg font-semibold text-navy-900">Settings</h1>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Stack on mobile, side by side on desktop */}
               <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar nav */}
               <div className="w-full md:w-52 md:flex-shrink-0">
            <nav className="space-y-1 flex md:flex-col gap-1 overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm',
                    'font-medium transition-colors text-left',
                    activeTab === tab.id
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-muted-foreground hover:bg-gray-100 hover:text-navy-900'
                  )}>
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 w-full">
            {saved && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg
                text-sm text-green-700 font-medium">
                ✅ Changes saved successfully!
              </div>
            )}

            {/* Firm Settings */}
            {activeTab === 'firm' && (
              <div className="bg-white rounded-xl border border-border p-6 space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-navy-900">Firm Information</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Update your firm's details and preferences.
                  </p>
                </div>

                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-navy-900 rounded-xl flex items-center
                    justify-center text-white font-bold text-xl">
                    {firmForm.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-900">Firm Logo</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Upload a square logo (PNG or JPG, max 2MB)
                    </p>
                    <button className="text-xs text-brand-500 hover:underline font-medium
                      flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Upload logo
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-5 space-y-4">
                  <Input label="Firm name *" value={firmForm.name}
                    onChange={e => setFirmForm(f => ({ ...f, name: e.target.value }))} />

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">
                      Industry *
                    </label>
                    <select value={firmForm.industry}
                      onChange={e => setFirmForm(f => ({ ...f, industry: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm
                        focus:outline-none focus:ring-2 focus:ring-brand-500">
                      {industries.map(i => (
                        <option key={i} value={i}>{industryLabels[i]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Number of employees" type="number"
                      value={firmForm.employeeCount}
                      onChange={e => setFirmForm(f => ({ ...f, employeeCount: e.target.value }))} />
                    <Input label="Location" placeholder="e.g. Dhaka, Bangladesh"
                      value={firmForm.location}
                      onChange={e => setFirmForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveFirm} loading={saving}
                    leftIcon={<Save className="w-4 h-4" />}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-border p-6 space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-navy-900">Your Profile</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your personal account details.
                  </p>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar
                      name={`${profileForm.firstName} ${profileForm.lastName}`}
                      size="lg"
                    />
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500
                      rounded-full flex items-center justify-center border-2 border-white">
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-900">
                      {profileForm.firstName} {profileForm.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{profileForm.email}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="First name *" value={profileForm.firstName}
                      onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} />
                    <Input label="Last name *" value={profileForm.lastName}
                      onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} />
                  </div>
                  <Input label="Email address" type="email" value={profileForm.email}
                    disabled
                    onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} />
                  <p className="text-xs text-muted-foreground -mt-2">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveProfile} loading={saving}
                    leftIcon={<Save className="w-4 h-4" />}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Password Settings */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-xl border border-border p-6 space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-navy-900">Change Password</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Keep your account secure with a strong password.
                  </p>
                </div>

                <div className="space-y-4">
                  <Input label="Current password" type="password"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} />
                  <Input label="New password" type="password"
                    placeholder="At least 8 characters"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} />
                  <Input label="Confirm new password" type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-navy-900 mb-1">Password requirements:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    <li className={passwordForm.newPassword.length >= 8 ? 'text-green-600' : ''}>
                      {passwordForm.newPassword.length >= 8 ? '✓' : '·'} At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                      {/[A-Z]/.test(passwordForm.newPassword) ? '✓' : '·'} One uppercase letter
                    </li>
                    <li className={/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                      {/[0-9]/.test(passwordForm.newPassword) ? '✓' : '·'} One number
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleChangePassword} loading={saving}
                    disabled={!passwordForm.currentPassword || !passwordForm.newPassword}
                    leftIcon={<Lock className="w-4 h-4" />}>
                    Change Password
                  </Button>
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="space-y-4">
                {/* Current plan */}
                <div className="bg-white rounded-xl border border-border p-6">
                  <h2 className="text-base font-semibold text-navy-900 mb-4">Current Plan</h2>
                  <div className={cn('rounded-xl p-4 mb-4', plan.bg)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn('font-semibold', plan.color)}>{plan.label}</p>
                        {daysLeft !== null && firm?.plan === 'TRIAL' && (
                          <p className="text-sm text-orange-600 mt-0.5">
                            {daysLeft} days remaining in trial
                          </p>
                        )}
                      </div>
                      <button className="text-sm text-brand-500 hover:underline font-medium">
                        Upgrade →
                      </button>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {plan.features.map(f => (
                        <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span className="text-green-500">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Upgrade plans */}
                <div className="bg-white rounded-xl border border-border p-6">
                  <h2 className="text-base font-semibold text-navy-900 mb-4">
                    Available Plans
                  </h2>
                  <div className="grid md:grid-cols-3 gap-3">
                    {(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const).map(planKey => {
                      const p = planConfig[planKey]
                      const isCurrent = firm?.plan === planKey
                      return (
                        <div key={planKey}
                          className={cn(
                            'rounded-xl border p-4',
                            planKey === 'PROFESSIONAL'
                              ? 'border-brand-300 bg-brand-50'
                              : 'border-border'
                          )}>
                          {planKey === 'PROFESSIONAL' && (
                            <span className="text-[10px] font-bold text-brand-600
                              bg-brand-100 px-2 py-0.5 rounded-full mb-2 inline-block">
                              MOST POPULAR
                            </span>
                          )}
                          <p className={cn('font-semibold text-sm', p.color)}>{p.label}</p>
                          <ul className="mt-2 space-y-1 mb-4">
                            {p.features.map(f => (
                              <li key={f} className="text-xs text-gray-600 flex items-center gap-1">
                                <span className="text-green-500">✓</span> {f}
                              </li>
                            ))}
                          </ul>
                          <button
                            disabled={isCurrent}
                            className={cn(
                              'w-full py-2 rounded-lg text-xs font-semibold transition-colors',
                              isCurrent
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : planKey === 'PROFESSIONAL'
                                  ? 'bg-brand-500 hover:bg-brand-600 text-white'
                                  : 'border border-border hover:bg-gray-50 text-navy-900'
                            )}>
                            {isCurrent ? 'Current Plan' : 'Upgrade'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}