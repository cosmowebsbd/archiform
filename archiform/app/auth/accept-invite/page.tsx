'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [inviteInfo, setInviteInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link.')
      setLoading(false)
      return
    }

    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query {
          invitationByToken(token: "${token}") {
            token email firstName firmName inviterName
            isExpired isAccepted
          }
        }`
      }),
    })
    .then(r => r.json())
    .then(d => {
      if (d.errors) {
        setError(d.errors[0]?.message || 'Invalid invitation.')
        return
      }
      const info = d.data?.invitationByToken
      if (info.isExpired) {
        setError('This invitation has expired. Please ask to be re-invited.')
        return
      }
      if (info.isAccepted) {
        setError('This invitation has already been accepted. Please log in.')
        return
      }
      setInviteInfo(info)
      if (info.firstName) setForm(f => ({ ...f, firstName: info.firstName }))
    })
    .catch(() => setError('Failed to load invitation.'))
    .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim()) { setError('First name is required'); return }
    if (!form.lastName.trim()) { setError('Last name is required'); return }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters'); return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation {
            acceptInvitation(
              token: "${token}"
              password: "${form.password}"
              firstName: "${form.firstName.trim()}"
              lastName: "${form.lastName.trim()}"
            ) {
              token
              user { id email firstName lastName }
              firm { id name plan trialEndsAt }
            }
          }`
        }),
      })

      const json = await response.json()
      if (json.errors) {
        setError(json.errors[0]?.message || 'Failed to accept invitation.')
        return
      }

      const { token: authToken, user, firm } = json.data.acceptInvitation
      localStorage.setItem('archiform_token', authToken)
      localStorage.setItem('archiform_user', JSON.stringify(user))
      localStorage.setItem('archiform_firm', JSON.stringify(firm))

      router.push('/dashboard')
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f9] flex flex-col">
      <div className="flex justify-center pt-8 pb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-navy-900 rounded-xl flex items-center
            justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-semibold text-navy-900"
            style={{ fontFamily: 'var(--font-display)' }}>
            Archiform
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md bg-white rounded-2xl border border-border
          shadow-card-hover p-8">

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent
                rounded-full animate-spin" />
            </div>
          )}

          {!loading && error && !inviteInfo && (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center
                justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-navy-900 mb-2">
                Invalid Invitation
              </h2>
              <p className="text-sm text-muted-foreground mb-6">{error}</p>
              <Link href="/auth/login"
                className="text-brand-500 font-medium hover:underline text-sm">
                Go to login →
              </Link>
            </div>
          )}

          {!loading && inviteInfo && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center
                  justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-brand-500" />
                </div>
                <h1 className="text-2xl font-semibold text-navy-900 mb-2">
                  You're invited!
                </h1>
                <p className="text-sm text-muted-foreground">
                  <strong>{inviteInfo.inviterName}</strong> invited you to join
                </p>
                <p className="text-lg font-bold text-navy-900 mt-1">
                  {inviteInfo.firmName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {inviteInfo.email}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200
                  rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First name *"
                    value={form.firstName}
                    onChange={e => setForm(f => ({
                      ...f, firstName: e.target.value
                    }))}
                    autoFocus />
                  <Input label="Last name *"
                    value={form.lastName}
                    onChange={e => setForm(f => ({
                      ...f, lastName: e.target.value
                    }))} />
                </div>

                <Input
                  label="Create password *"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({
                    ...f, password: e.target.value
                  }))}
                  rightElement={
                    <button type="button"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <Input
                  label="Confirm password *"
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({
                    ...f, confirmPassword: e.target.value
                  }))} />

                <Button type="submit" className="w-full" size="lg"
                  loading={submitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Join {inviteInfo.firmName}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login"
                    className="text-brand-500 hover:underline">
                    Log in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f4f5f9] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent
          rounded-full animate-spin" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  )
}