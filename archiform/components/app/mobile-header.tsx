'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from '@/hooks/useSidebar'

export default function MobileHeader() {
  const { open } = useSidebar()

  return (
    <button
      onClick={open}
      className="lg:hidden fixed top-3 left-3 z-30 w-10 h-10
        bg-navy-900 hover:bg-navy-800 rounded-xl flex items-center
        justify-center transition-colors shadow-lg"
      aria-label="Open menu">
      <Menu className="w-5 h-5 text-white" />
    </button>
  )
}