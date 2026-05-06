'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const [firm, setFirm] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('archiform_token')
    const userStr = localStorage.getItem('archiform_user')
    const firmStr = localStorage.getItem('archiform_firm')

    if (!token) {
      setIsAuthenticated(false)
      router.replace('/auth/login')
      return
    }

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const isExpired = payload.exp * 1000 < Date.now()
      if (isExpired) {
        localStorage.clear()
        setIsAuthenticated(false)
        router.replace('/auth/login')
        return
      }
    } catch {
      localStorage.clear()
      setIsAuthenticated(false)
      router.replace('/auth/login')
      return
    }

    try {
      if (userStr) setUser(JSON.parse(userStr))
      if (firmStr) setFirm(JSON.parse(firmStr))
    } catch {}

    setIsAuthenticated(true)
  }, [])

  const logout = () => {
    localStorage.removeItem('archiform_token')
    localStorage.removeItem('archiform_user')
    localStorage.removeItem('archiform_firm')
    localStorage.removeItem('archiform_timer')
    router.replace('/auth/login')
  }

  return { isAuthenticated, user, firm, logout }
}