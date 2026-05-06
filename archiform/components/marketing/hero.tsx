'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// Animated number counter hook
function useCounter(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

const stats = [
  { prefix: '+', value: 67, suffix: '%', label: 'Faster completing\nbusiness tasks' },
  { prefix: '+', value: 2.3, suffix: 'x', label: 'Faster billing &\ninvoicing process', isDecimal: true },
  { prefix: '+', value: 44, suffix: '%', label: 'Less budget\noverage' },
]

const bullets = [
  'Reduce admin time by 67% on average',
  'Accelerate billing with 2.3x faster invoicing',
  'Stay on budget with real-time project tracking',
]

const projectData = [
  { name: 'Riverside HQ', phase: 'Design Development', pct: 72, color: 'bg-brand-500' },
  { name: 'Halcyon Tower', phase: 'Construction Docs', pct: 45, color: 'bg-orange-400' },
  { name: 'West Pavilion', phase: 'Schematic Design', pct: 88, color: 'bg-green-500' },
]

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const c1 = useCounter(67, 1800, inView)
  const c3 = useCounter(44, 1800, inView)

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white pt-16 pb-24"
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 section-grid-bg opacity-60 pointer-events-none" />
      {/* Gradient mesh */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — Copy */}
          <div className="animate-fade-in">
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Firm Management Software for A&amp;E Firms
            </div>

            {/* Headline */}
            <h1 className="heading-xl mb-6 text-navy-950">
              Get more revenue,
              <br />
              in{' '}
              <em className="text-brand-500 not-italic" style={{ fontFamily: 'var(--font-display)' }}>
                less time,
              </em>
              <br />
              without the stress
            </h1>

            {/* Subtext */}
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              Architects and Engineers deserve a tailor-made way to save time,
              manage projects, and take full control of their business.
            </p>

            {/* Bullets */}
            <ul className="space-y-3 mb-10">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/get-started">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Get a demo
                </Button>
              </Link>
              <button className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group">
                <span className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                  <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                </span>
                Watch a tour
              </button>
            </div>
          </div>

          {/* Right — Dashboard Card */}
          <div className="animate-fade-in animate-delay-200">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-brand-500/10 rounded-2xl blur-2xl" />

              {/* Main card */}
              <div className="relative bg-white rounded-2xl border border-border shadow-card-hover overflow-hidden">
                {/* Card header */}
                <div className="bg-navy-950 px-5 py-3.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="ml-2 text-white/50 text-xs font-medium">Project Overview — Q3 2025</span>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-4">
                  {projectData.map((p) => (
                    <div key={p.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-navy-900">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.phase}</p>
                        </div>
                        <span className="text-sm font-bold text-navy-900">{p.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${p.color}`}
                          style={{ width: inView ? `${p.pct}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-3 pt-3 mt-2 border-t border-border">
                    {[
                      { label: 'Budget Used', value: '$1.17M', sub: 'of $2.0M' },
                      { label: 'Team Hours', value: '1,340', sub: 'this month' },
                      { label: 'Invoiced', value: '$207K', sub: 'outstanding' },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-base font-bold text-navy-900" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-brand-500 text-white rounded-xl px-4 py-2.5 shadow-glow-md">
                <p className="text-xs font-medium opacity-80">Avg. first year result</p>
                <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>+21% Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="mt-20 pt-12 border-t border-border">
          <p className="text-center text-sm text-muted-foreground mb-10 font-medium">
            On average, Archiform customers achieve:
          </p>
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`text-center animate-counter-up animate-delay-${(i + 1) * 100}`}
              >
                <div className="text-5xl font-normal text-navy-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className="text-brand-500">{s.prefix}</span>
                  {i === 1 ? (inView ? '2.3' : '0') : i === 0 ? c1 : c3}
                  <span className="text-brand-500">{s.suffix}</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            *Results based on averages from customer-reported improvements
          </p>
        </div>
      </div>
    </section>
  )
}
