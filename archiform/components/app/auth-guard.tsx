'use client'

import { useAuth } from '@/hooks/useAuth'
import MobileHeader from '@/components/app/mobile-header'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f4f5f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent
            rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <>
      <MobileHeader />
      {children}
    </>
  )
}