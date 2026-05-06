'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

const customerLogos = [
  { award: '2022 AIA Gold Medal',          name: 'Brooks Scarpa' },
  { award: '2021 Award for Interior Arch', name: 'Trahan Architects' },
  { award: '2019 Architecture Firm Award', name: 'Snow Kreilich' },
  { award: '2023 Interior Design Top 100', name: 'Workshop APD' },
  { award: '2016 Lifetime Achievement',    name: 'Krueck Sexton' },
]

const hearOptions = [
  { value: 'FRIEND',       label: 'Friend or colleague' },
  { value: 'GOOGLE',       label: 'Google search' },
  { value: 'LINKEDIN',     label: 'LinkedIn' },
  { value: 'CONFERENCE',   label: 'Conference or event' },
  { value: 'PUBLICATION',  label: 'Magazine or publication' },
  { value: 'SOCIAL_MEDIA', label: 'Social media' },
  { value: 'OTHER',        label: 'Other' },
]

const industryOptions = [
  { value: 'ARCHITECTURE',    label: 'Architecture' },
  { value: 'ENGINEERING',     label: 'Engineering' },
  { value: 'INTERIOR_DESIGN', label: 'Interior Design' },
  { value: 'LANDSCAPE',       label: 'Landscape Architecture' },
  { value: 'URBAN_PLANNING',  label: 'Urban Planning' },
  { value: 'NOT_LISTED',      label: 'Not Listed' },
]

export default function GetStartedPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    howDidYouHear: '',
    companyName: '',
    numberOfEmployees: '',
    industry: '',
    location: '',
  })

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('archiform_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const isExpired = payload.exp * 1000 < Date.now()
        if (!isExpired) {
          router.replace('/dashboard')
          return
        }
      } catch {
        localStorage.clear()
      }
    }
  }, [])

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!form.email) errs.email = 'Work email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email address'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.howDidYouHear) errs.howDidYouHear = 'Please select an option'
    if (!form.companyName.trim()) errs.companyName = 'Company name is required'
    if (!form.numberOfEmployees) errs.numberOfEmployees = 'Number of employees is required'
    else if (Number(form.numberOfEmployees) < 1)
      errs.numberOfEmployees = 'Must be at least 1'
    if (!form.industry) errs.industry = 'Please select your industry'
    if (!form.location.trim()) errs.location = 'Location is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    setLoading(false)
    setStep(2)
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation {
            register(input: {
              email: "${form.email.trim()}"
              password: "TempPassword123!"
              firstName: "${form.firstName.trim()}"
              lastName: "User"
              firmName: "${form.companyName.trim()}"
              industry: ${form.industry || 'ARCHITECTURE'}
              employeeCount: ${parseInt(form.numberOfEmployees) || 1}
              location: "${form.location.trim()}"
              howDidYouHear: "${form.howDidYouHear}"
            }) {
              token
              user { id email firstName lastName }
              firm { id name plan trialEndsAt }
            }
          }`
        }),
      })

      const json = await response.json()

      if (json.errors) {
        setErrors({ email: json.errors[0]?.message || 'Registration failed' })
        setLoading(false)
        return
      }

      const { token, user, firm } = json.data.register
      localStorage.setItem('archiform_token', token)
      localStorage.setItem('archiform_user', JSON.stringify(user))
      localStorage.setItem('archiform_firm', JSON.stringify(firm))

      router.push('/dashboard')

    } catch (err) {
      setErrors({ email: 'Connection failed. Is the backend running?' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f9] flex flex-col">
      {/* Logo bar */}
      <div className="flex justify-center pt-8 pb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-navy-900 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-semibold text-navy-900"
            style={{ fontFamily: 'var(--font-display)' }}>
            Archiform
          </span>
        </Link>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-border
          shadow-card-hover p-8 md:p-12">
          <h1 className="text-3xl font-normal text-center text-navy-950 mb-2"
            style={{ fontFamily: 'var(--font-display)' }}>
            Let's get started
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Join award-winning architecture and engineering firms on Archiform.
          </p>

          {/* Customer logos row */}
          <div className="flex items-stretch justify-between gap-2 mb-10
            overflow-x-auto pb-2">
            {customerLogos.map((c, i) => (
              <React.Fragment key={c.name}>
                {i > 0 && <div className="w-px bg-border flex-shrink-0" />}
                <div className="flex flex-col items-center justify-center gap-1.5
                  px-3 min-w-[100px] text-center">
                  <p className="text-[9px] text-muted-foreground leading-tight
                    font-medium uppercase tracking-wide">
                    {c.award}
                  </p>
                  <p className="text-xs font-semibold text-navy-900">{c.name}</p>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-2 h-2 rounded-full transition-colors ${
              step === 1 ? 'bg-brand-500' : 'bg-brand-200'
            }`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${
              step === 2 ? 'bg-brand-500' : 'bg-gray-200'
            }`} />
          </div>

          {/* Step 1 — Email only */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4" noValidate>
              <Input
                label="Work email"
                type="email"
                placeholder="you@yourfirm.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                error={errors.email}
                autoFocus
              />
              <Button type="submit" className="w-full" size="lg"
                loading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get started
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login"
                  className="text-brand-500 font-medium hover:underline">
                  Log in here
                </Link>
              </p>
            </form>
          )}

          {/* Step 2 — Full profile */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-5" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Work email *"
                  type="email"
                  value={form.email}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                />
                <Input
                  label="First name *"
                  type="text"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  error={errors.firstName}
                  autoFocus
                />
              </div>

              <Select
                label="How did you hear about Archiform? *"
                options={hearOptions}
                placeholder="Select an option..."
                value={form.howDidYouHear}
                onChange={(e) => set('howDidYouHear', e.target.value)}
                error={errors.howDidYouHear}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Company name *"
                  type="text"
                  placeholder="Your Firm Name"
                  value={form.companyName}
                  onChange={(e) => set('companyName', e.target.value)}
                  error={errors.companyName}
                />
                <Input
                  label="Number of employees *"
                  type="number"
                  placeholder="10"
                  min="1"
                  value={form.numberOfEmployees}
                  onChange={(e) => set('numberOfEmployees', e.target.value)}
                  error={errors.numberOfEmployees}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Industry *"
                  options={industryOptions}
                  placeholder="Select industry..."
                  value={form.industry}
                  onChange={(e) => set('industry', e.target.value)}
                  error={errors.industry}
                />
                <Input
                  label="Location *"
                  type="text"
                  placeholder="City, Country"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  error={errors.location}
                />
              </div>

              <Button type="submit" className="w-full" size="lg"
                loading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create my account
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login"
                  className="text-brand-500 font-medium hover:underline">
                  Log in here
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}