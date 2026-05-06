'use client'

import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'What is Archiform?',
    a: 'Archiform is a project management platform designed exclusively for architecture and engineering firms. It helps you manage projects, track budgets, improve finances, and gain valuable insights — all in one place. On average, users complete business tasks 67% faster.',
  },
  {
    q: 'How do I get started?',
    a: 'Getting started is easy. Click "Get started" on any page, fill out a short form with your firm details, and create your account with a password. You\'ll be up and running in under 5 minutes with a free 10-day trial.',
  },
  {
    q: 'Is training available for new users?',
    a: 'Yes, we provide free onboarding and training for all new users. Our customer success team will walk you through setup and ensure your entire firm gets up to speed quickly — at no extra cost.',
  },
  {
    q: 'Is Archiform suitable for any A&E firm?',
    a: 'Archiform scales with you. Most customers are US-based firms between 3 and 30 employees, but we support firms ranging from solo practitioners to 100+ person organizations. The best way to find out is to try it free.',
  },
  {
    q: 'Can Archiform integrate with other tools?',
    a: 'Yes. Archiform integrates with QuickBooks Online for full project accounting capabilities. Additional integrations including Stripe for payments and calendar apps are available on higher plans.',
  },
  {
    q: 'How much does Archiform cost?',
    a: 'Plans start at $25/user/month. Most firms see a significant increase in revenue within their first year — making Archiform one of the highest-ROI investments a firm can make. Visit our pricing page to calculate your potential ROI.',
  },
  {
    q: 'What reports does Archiform provide?',
    a: "Archiform includes one-click reports for utilization rate, realization rate, profit and loss, revenue forecasting, budget vs. actuals, and more. Every report is designed in the language of A&E leaders so insights are immediately actionable.",
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. Archiform uses bank-level AES-256 encryption, is hosted on AWS with SOC 2 compliance, and performs daily backups. Your firm\'s data is never shared or sold.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-24 bg-[#f8f9fc]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest text-brand-500 uppercase mb-3">FAQ</p>
          <h2 className="heading-lg text-navy-950">Frequently asked questions</h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={cn(
                'bg-white rounded-xl border overflow-hidden transition-all duration-200',
                open === i ? 'border-brand-200 shadow-glow-sm' : 'border-border'
              )}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-navy-900 pr-4">{faq.q}</span>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  open === i ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  {open === i
                    ? <Minus className="w-4 h-4" />
                    : <Plus className="w-4 h-4" />
                  }
                </div>
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  open === i ? 'max-h-96' : 'max-h-0'
                )}
              >
                <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
