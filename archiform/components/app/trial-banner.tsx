'use client'

import React, { useState } from 'react'
import { Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { mockFirm } from '@/lib/mock-data'

export default function TrialBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || mockFirm.plan !== 'TRIAL') return null

  const trialEnd = mockFirm.trialEndsAt ? new Date(mockFirm.trialEndsAt) : new Date()
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="fixed bottom-0 left-[220px] right-0 z-30 bg-navy-950 text-white border-t border-white/10">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Watch demo */}
        <button className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
          <span className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
            <Play className="w-3 h-3 text-white ml-0.5" />
          </span>
          WATCH DEMO
        </button>

        {/* Trial notice */}
        <p className="text-sm text-white/80">
          Your Archiform trial expires in{' '}
          <strong className="text-white">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>.
        </p>

        {/* Upgrade */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            Upgrade now
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
