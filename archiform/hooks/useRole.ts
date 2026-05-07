'use client'

import { useState, useEffect } from 'react'
import { authStore } from '@/lib/auth-store'

export function useRole() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(authStore.getRole())
  }, [])

  return {
    role,
    isOwner: role === 'OWNER',
    isAdmin: ['OWNER', 'ADMIN'].includes(role || ''),
    isMember: role === 'MEMBER',
    canManageStaff: ['OWNER', 'ADMIN'].includes(role || ''),
    canManageProjects: ['OWNER', 'ADMIN'].includes(role || ''),
    canManageInvoices: ['OWNER', 'ADMIN'].includes(role || ''),
    canManageBilling: role === 'OWNER',
    canLogTime: true, // everyone can log time
  }
}