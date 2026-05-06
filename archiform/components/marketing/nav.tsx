'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X, Building2, Users, BarChart3, Clock, FileText, TrendingUp, Bot, HandshakeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const benefitItems = [
  { icon: BarChart3,      label: 'Build Budgets',           desc: 'Trackable phase budgets',          href: '#' },
  { icon: Users,          label: 'Assign Staff',             desc: 'Balance workloads easily',         href: '#' },
  { icon: TrendingUp,     label: 'Track Projects',           desc: 'Real-time project visibility',     href: '#' },
  { icon: FileText,       label: 'Project Accounting',       desc: 'Billing & QuickBooks sync',        href: '#' },
  { icon: BarChart3,      label: 'Forecast Performance',     desc: 'See future revenue & staffing',    href: '#' },
  { icon: BarChart3,      label: 'Leverage Reports',         desc: 'Design-centric insights',          href: '#' },
  { icon: HandshakeIcon,  label: 'Consultant Collaboration', desc: 'Manage timelines & billing',       href: '#' },
  { icon: TrendingUp,     label: 'Generate Revenue',         desc: 'Smart billing & payments',         href: '#' },
  { icon: Bot,            label: 'Automate Your Work',       desc: 'AI-powered workflows',             href: '#' },
]

const useCasesByFirm = [
  { label: 'Architecture',  desc: 'Control your business design',         href: '#' },
  { label: 'Engineering',   desc: 'Optimize time and finances',           href: '#' },
]

const useCasesByRole = [
  { label: 'Principals & Owners',  desc: 'Maximize business health',          href: '#' },
  { label: 'Project Managers',     desc: 'Meet deadlines without burnout',     href: '#' },
  { label: 'Operations Leaders',   desc: 'Monitor and optimize performance',   href: '#' },
  { label: 'CFOs & Accountants',   desc: 'Consolidate timesheets & invoices',  href: '#' },
]

const resourceItems = [
  { label: 'Blog',           desc: 'Step-by-step tactics',               href: '#' },
  { label: 'Templates',      desc: 'Free customizable templates',         href: '#' },
  { label: 'Webinars',       desc: 'Strategies from industry leaders',    href: '#' },
  { label: 'Support Center', desc: 'Help docs & best practices',          href: '#' },
  { label: "What's New?",    desc: 'Latest features & updates',           href: '#' },
]

type ActiveMenu = 'benefits' | 'useCases' | 'resources' | null

export default function MarketingNav() {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-nav]')) setActiveMenu(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const toggle = (menu: ActiveMenu) =>
    setActiveMenu((prev) => (prev === menu ? null : menu))

  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-navy-900 text-white text-center py-2.5 px-4 text-sm font-medium">
        🎉 New 2025 Salary & Business Benchmarks for Architects & Engineers —{' '}
        <Link href="#" className="underline underline-offset-2 hover:text-brand-300 transition-colors">
          Get free access
        </Link>
      </div>

      {/* Main Nav */}
      <header
        data-nav
        className={cn(
          'sticky top-0 z-50 border-b transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-border shadow-sm'
            : 'bg-white border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-navy-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Archiform
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Benefits */}
            <button
              onClick={() => toggle('benefits')}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeMenu === 'benefits'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              Benefits
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', activeMenu === 'benefits' && 'rotate-180')} />
            </button>

            {/* Use Cases */}
            <button
              onClick={() => toggle('useCases')}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeMenu === 'useCases'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              Use Cases
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', activeMenu === 'useCases' && 'rotate-180')} />
            </button>

            <Link href="#pricing" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              Pricing
            </Link>
            <Link href="#customers" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              Customers
            </Link>

            {/* Resources */}
            <button
              onClick={() => toggle('resources')}
              className={cn(
                'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeMenu === 'resources'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              Resources
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', activeMenu === 'resources' && 'rotate-180')} />
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/auth/get-started">
              <Button size="sm">Get started</Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Mega Dropdown: Benefits ── */}
        {activeMenu === 'benefits' && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg animate-fade-in">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="grid grid-cols-3 gap-3">
                {benefitItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors group"
                    onClick={() => setActiveMenu(null)}
                  >
                    <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500 transition-colors">
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Mega Dropdown: Use Cases ── */}
        {activeMenu === 'useCases' && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg animate-fade-in">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Firm</p>
                  <div className="space-y-1">
                    {useCasesByFirm.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex flex-col p-3 rounded-lg hover:bg-brand-50 transition-colors"
                        onClick={() => setActiveMenu(null)}
                      >
                        <span className="text-sm font-medium text-navy-900">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">By Role</p>
                  <div className="space-y-1">
                    {useCasesByRole.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex flex-col p-3 rounded-lg hover:bg-brand-50 transition-colors"
                        onClick={() => setActiveMenu(null)}
                      >
                        <span className="text-sm font-medium text-navy-900">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Mega Dropdown: Resources ── */}
        {activeMenu === 'resources' && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg animate-fade-in">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="grid grid-cols-5 gap-2">
                {resourceItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col p-3 rounded-lg hover:bg-brand-50 transition-colors"
                    onClick={() => setActiveMenu(null)}
                  >
                    <span className="text-sm font-medium text-navy-900">{item.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">{item.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-border px-6 py-4 space-y-4 animate-fade-in">
            {['Benefits', 'Use Cases', 'Pricing', 'Customers', 'Resources'].map((item) => (
              <Link
                key={item}
                href="#"
                className="block text-sm font-medium text-gray-700 py-2"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link href="/auth/get-started" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Get started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
