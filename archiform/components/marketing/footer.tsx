import React from 'react'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

const footerLinks = {
  Benefits: [
    'Build Budgets', 'Assign Staff', 'Track Projects',
    'Project Accounting', 'Forecast Performance',
    'Leverage Reports', 'Generate Revenue', 'Automate Work',
  ],
  'Use Cases': [
    'Architecture Firms', 'Engineering Firms',
    'Principals & Owners', 'Project Managers',
    'CFOs & Accountants', 'Operations Leaders',
  ],
  Features: [
    'Invoices & Payments', 'Time Tracking',
    'Project Planner', 'Project Management',
    "What's New?",
  ],
  Resources: [
    'Blog', 'Customers', 'Webinars',
    'Templates', 'Support Center',
    'Monograph Method', 'Podcast',
  ],
  Comparisons: [
    'vs QuickBooks', 'vs Harvest',
    'vs BQE Core', 'vs Deltek Ajera',
  ],
  More: [
    'Careers', 'Testimonials', 'Pricing',
    'Terms of Service', 'Privacy Policy',
  ],
}

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Archiform</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Archiform provides A&amp;E firms with clarity into budgets, projects, time, and clients so their team can make smarter decisions.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-white/55 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">© 2019–2026 Archiform Inc. All rights reserved.</p>
          <div className="flex gap-6">
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((l) => (
              <Link key={l} href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
