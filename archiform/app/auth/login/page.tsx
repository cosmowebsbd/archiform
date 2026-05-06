'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authStore } from '@/lib/auth-store'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        // Invalid token — clear it
        localStorage.clear()
      }
    }
  }, [])

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Email and password are required')
      return
    }
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation {
            login(input: {
              email: "${form.email.trim()}"
              password: "${form.password}"
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
        setError(json.errors[0]?.message || 'Invalid email or password')
        return
      }

      const { token, user, firm } = json.data.login
      authStore.setToken(token)
      localStorage.setItem('archiform_user', JSON.stringify(user))
      localStorage.setItem('archiform_firm', JSON.stringify(firm))

      router.push('/dashboard')

    } catch (err: any) {
      setError('Connection failed. Is the backend running on port 8080?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f9] flex flex-col">
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

      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md bg-white rounded-2xl border border-border
          shadow-card-hover p-8 md:p-10">
          <h1 className="text-2xl font-normal text-center text-navy-950 mb-2"
            style={{ fontFamily: 'var(--font-display)' }}>
            Welcome back
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Log in to your Archiform account
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg
              text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="you@yourfirm.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoFocus
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              rightElement={
                <button type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-foreground transition-colors">
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <div className="text-right">
              <Link href="#" className="text-sm text-brand-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg"
              loading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}>
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/get-started"
              className="text-brand-500 font-medium hover:underline">
              Get started free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}