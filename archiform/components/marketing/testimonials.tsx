'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    quote: 'I love it because I can see where we can {become more efficient}, properly manage staff, and allocate their time more effectively.',
    author: 'Jeffery Huber, FAIA',
    firm: 'Brooks Scarpa',
    title: 'Principal Architect',
    stats: [
      { value: '+25%', label: 'Profit growth' },
      { value: '+50%', label: 'Efficiency gain' },
      { value: '+4x', label: 'Confidence boost' },
    ],
  },
  {
    quote: 'Managers have taken ownership of the invoice creation process and {reduced time and mistakes} that were previously easy to overlook.',
    author: 'Teresa Telander',
    firm: 'Woodhull',
    title: 'Operations Manager',
    stats: [
      { value: '+2x', label: 'Faster tasks' },
      { value: '+50%', label: 'Faster billing' },
      { value: '+8x', label: 'Faster scheduling' },
    ],
  },
  {
    quote: 'Architects are visual people. Archiform puts project data at our fingertips {in a beautiful way}. Everything is clean and intuitive.',
    author: 'Sal Tranchina',
    firm: 'Garrison Architects',
    title: 'Design Principal',
    stats: [
      { value: '+50%', label: 'Cost savings' },
      { value: '+2x', label: 'Faster billing' },
      { value: '+2.6x', label: 'Faster payments' },
    ],
  },
  {
    quote: 'Project management {in one place}. Love the visuals. Easy to make changes. Our workflow has improved dramatically across the firm.',
    author: 'Emerson Chapelle',
    firm: 'Dynamic Engineering',
    title: 'Senior Engineer',
    stats: [
      { value: '+25%', label: 'Profit growth' },
      { value: '+2x', label: 'Efficiency gain' },
      { value: '+2x', label: 'Confidence boost' },
    ],
  },
  {
    quote: 'The {customer service is amazing}. We feel like we have a direct help line, and if there are new tools we\'d like to see, our voice is heard.',
    author: 'Jamileh Cannon',
    firm: 'Workbench Studio',
    title: 'Principal',
    stats: [
      { value: '+75%', label: 'Less unbilled fees' },
      { value: '+8x', label: 'Faster staffing' },
      { value: '+4x', label: 'Faster billing' },
    ],
  },
]

function renderQuote(text: string) {
  return text.split(/\{(.+?)\}/).map((part, i) =>
    i % 2 === 0 ? (
      <span key={i}>{part}</span>
    ) : (
      <strong key={i} className="text-navy-900 font-semibold">
        {part}
      </strong>
    )
  )
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0)

  const prev = () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length)
  const next = () => setActive((a) => (a + 1) % testimonials.length)

  const t = testimonials[active]

  return (
    <section className="bg-[#f8f9fc] py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest text-brand-500 uppercase mb-3">
            Join Good Company
          </p>
          <h2 className="heading-lg text-navy-950 mb-4">
            13,500+ architects & engineers
            <br />
            work smarter with Archiform
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Real results from real firms — not marketing fluff.
          </p>
        </div>

        {/* Main testimonial card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-border shadow-card-hover p-8 md:p-12">
            {/* Quote mark */}
            <div className="text-6xl font-serif text-brand-100 leading-none mb-4 select-none">&ldquo;</div>

            {/* Quote text */}
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8 font-light" style={{ fontFamily: 'var(--font-display)' }}>
              {renderQuote(t.quote)}
            </p>

            {/* Author */}
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                <Avatar name={t.author} size="lg" />
                <div>
                  <p className="font-semibold text-navy-900">{t.author}</p>
                  <p className="text-sm text-muted-foreground">{t.title}, {t.firm}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                {t.stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-normal text-brand-500" style={{ fontFamily: 'var(--font-display)' }}>
                      {s.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border bg-white hover:bg-brand-50 hover:border-brand-200 flex items-center justify-center transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === active
                      ? 'w-6 h-2.5 bg-brand-500'
                      : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border bg-white hover:bg-brand-50 hover:border-brand-200 flex items-center justify-center transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
