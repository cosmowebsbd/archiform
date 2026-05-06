'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    stat: '+2.3x faster billing process',
    problem: 'Scattered tools driving you nuts?',
    solution:
      'Tired of jumping between spreadsheets and apps to get things done? Archiform consolidates all your project management needs — budgets, timesheets, invoicing, and reporting — into one powerful platform.',
    visual: (
      <div className="bg-white rounded-xl border border-border shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-navy-900">Active Projects</span>
          <span className="text-xs text-brand-500 font-medium">3 projects</span>
        </div>
        {[
          { name: 'Riverside HQ', budget: '$480K', used: '72%', color: 'bg-brand-500' },
          { name: 'Halcyon Tower', budget: '$1.2M', used: '45%', color: 'bg-orange-400' },
          { name: 'West Pavilion', budget: '$320K', used: '88%', color: 'bg-green-500' },
        ].map((p) => (
          <div key={p.name} className="p-3 rounded-lg bg-gray-50 border border-border/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-navy-900">{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.budget} budget</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${p.color}`} style={{ width: p.used }} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{p.used} used</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    stat: '+44% decrease in budget overages',
    problem: 'Sick of budget and finance mysteries?',
    solution:
      "Budgets shouldn't be a guessing game. Archiform brings all your financials into clear view with real-time data. Easily see if you're over or under budget at a glance, at every phase level.",
    visual: (
      <div className="bg-white rounded-xl border border-border shadow-sm p-5">
        <div className="mb-4">
          <span className="text-sm font-semibold text-navy-900">Budget vs Actual</span>
        </div>
        <div className="space-y-4">
          {[
            { phase: 'Schematic Design', budget: 96000, actual: 93000 },
            { phase: 'Design Development', budget: 144000, actual: 126000 },
            { phase: 'Construction Docs', budget: 240000, actual: 0 },
          ].map((p) => (
            <div key={p.phase}>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>{p.phase}</span>
                <span>${(p.actual / 1000).toFixed(0)}K / ${(p.budget / 1000).toFixed(0)}K</span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full">
                <div
                  className="absolute inset-y-0 left-0 bg-brand-500 rounded-full"
                  style={{ width: `${(p.actual / p.budget) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
          <p className="text-xs font-medium text-green-700">✓ Under budget by $21K on Design Development</p>
        </div>
      </div>
    ),
  },
  {
    stat: '+67% faster completing business tasks',
    problem: 'Tired of slow and manual processes?',
    solution:
      "Stop letting inefficiencies slow you down. Archiform's AI-powered automations help you optimize every part of your business, from single project tasks to firm-wide financial reporting.",
    visual: (
      <div className="bg-white rounded-xl border border-border shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-navy-900">Automation Center</span>
          <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-medium">AI Powered</span>
        </div>
        {[
          { label: 'Auto-generate invoice from timesheet',  status: 'Active',   color: 'text-green-600' },
          { label: 'Alert when phase exceeds 80% budget',   status: 'Active',   color: 'text-green-600' },
          { label: 'Weekly utilization report to owners',   status: 'Active',   color: 'text-green-600' },
          { label: 'Auto-assign new projects to templates', status: 'Paused',   color: 'text-yellow-600' },
        ].map((a) => (
          <div key={a.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-border/50">
            <span className="text-xs text-gray-700">{a.label}</span>
            <span className={`text-xs font-medium ${a.color}`}>{a.status}</span>
          </div>
        ))}
      </div>
    ),
  },
]

export default function FeaturesSection() {
  const [active, setActive] = useState(0)
  const f = features[active]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest text-brand-500 uppercase mb-3">
            Tailor-Made for A&amp;E Firms
          </p>
          <h2 className="heading-lg text-navy-950">
            The world's fastest and easiest
            <br />
            project management software
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-12">
          {features.map((f, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                i === active
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Feature {i + 1}
            </button>
          ))}
        </div>

        {/* Feature content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="inline-block px-3 py-1 bg-brand-50 text-brand-600 text-xs font-semibold rounded-full mb-4">
              {f.stat}
            </div>
            <h3 className="heading-md text-navy-950 mb-4">{f.problem}</h3>
            <p className="text-gray-500 leading-relaxed mb-8">{f.solution}</p>
            <Link href="/auth/get-started" className="inline-flex items-center gap-2 text-brand-500 font-medium hover:gap-3 transition-all">
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div key={active} className="animate-fade-in">
            {f.visual}
          </div>
        </div>
      </div>
    </section>
  )
}
