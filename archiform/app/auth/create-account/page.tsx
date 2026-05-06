'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const testimonial = {
  image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  name: 'Eric H.',
  title: 'Principal at Abacus Architects',
  size: '30+ Employees',
  quote:
    "To date, we've used Archiform on over 220 projects across all four offices and every employee is able to use the software for timesheets. The program is a great asset for project managers and the owners of the firm given that they can provide real-time feedback to their associates on the progress of a project.",
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'flex-1 h-1.5 rounded-full transition-all duration-300',
              i <= score ? colors[score] : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      {password && (
        <p className={cn('text-xs font-medium', score <= 1 ? 'text-red-500' : score === 2 ? 'text-yellow-600' : score === 3 ? 'text-blue-600' : 'text-green-600')}>
          {labels[score]} password
        </p>
      )}
    </div>
  )
}

function CreateAccountForm() {
  const router = useRouter()
  const params = useSearchParams()

  const prefillFirstName = params.get('firstName') || ''
  const prefillEmail = params.get('email') || ''

  const [form, setForm] = useState({
    firstName: prefillFirstName,
    lastName: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Form */}
      <div className="flex flex-col justify-center px-8 md:px-16 py-12 bg-white">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-navy-900" style={{ fontFamily: 'var(--font-display)' }}>
            Archiform
          </span>
        </Link>

        {/* Progress steps */}
        <div className="flex items-center gap-0 mb-10">
          <div className="w-4 h-4 rounded-full bg-brand-500 border-2 border-brand-500 flex-shrink-0" />
          <div className="flex-1 h-0.5 bg-brand-500 max-w-[80px]" />
          <div className="w-4 h-4 rounded-full border-2 border-brand-300 bg-white flex-shrink-0" />
        </div>

        <h1 className="text-2xl font-normal text-navy-950 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Create a password to start your
        </h1>
        <h1 className="text-2xl font-normal text-navy-950 mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          free trial with Archiform.
        </h1>

        {prefillEmail && (
          <div className="mb-6 px-3 py-2 bg-brand-50 rounded-lg text-sm text-brand-700 font-medium">
            Setting up account for: {prefillEmail}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="First name"
            type="text"
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Last name"
            type="text"
            placeholder="Last"
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            error={errors.lastName}
          />
          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              error={errors.password}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            {form.password && <PasswordStrength password={form.password} />}
          </div>
          <Input
            label="Confirm password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            rightElement={
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="hover:text-foreground transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            loading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create account
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By creating an account you agree to our{' '}
            <Link href="#" className="text-brand-500 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="text-brand-500 hover:underline">Privacy Policy</Link>.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-500 font-medium hover:underline">
            Log in here
          </Link>
        </p>
      </div>

      {/* Right — Testimonial */}
      <div className="hidden lg:flex flex-col bg-navy-950 relative overflow-hidden">
        {/* Building image */}
        <div className="flex-1 relative">
          <img
            src={testimonial.image}
            alt="Architecture"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/20 to-navy-950/80" />
        </div>

        {/* Testimonial card */}
        <div className="bg-white mx-6 mb-8 rounded-xl p-6 -mt-20 relative z-10 shadow-card-hover">
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={testimonial.name} size="lg" />
            <div>
              <p className="font-semibold text-navy-900">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.title}</p>
              <p className="text-xs text-muted-foreground">{testimonial.size}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{testimonial.quote}</p>
        </div>
      </div>
    </div>
  )
}

export default function CreateAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CreateAccountForm />
    </Suspense>
  )
}
