'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, FolderOpen, Users, Clock, DollarSign,
  BarChart2, BookUser, Search, Timer, Gift,
  Settings, ChevronDown, Play, Square, X, LogOut
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { icon: Home,       label: 'Home',      href: '/dashboard' },
  { icon: FolderOpen, label: 'Projects',  href: '/projects' },
  { icon: Users,      label: 'Staff',     href: '/staff' },
  { icon: Clock,      label: 'Time',      href: '/time' },
  { icon: DollarSign, label: 'Money',     href: '/money' },
  { icon: BarChart2,  label: 'Analytics', href: '/analytics' },
  { icon: BookUser,   label: 'Contacts',  href: '/contacts' },
  { icon: Search,     label: 'Search',    href: '/search' },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  // Firm + user state
  const [firmName, setFirmName] = useState('Your Firm')
  const [firmPlan, setFirmPlan] = useState('trial')
  const [userInitials, setUserInitials] = useState('U')
  const [userName, setUserName] = useState('')

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [showTimerPanel, setShowTimerPanel] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startRef = useRef<number>(0)

  // Load firm/user from localStorage
  useEffect(() => {
    try {
      const firm = JSON.parse(localStorage.getItem('archiform_firm') || '{}')
      const user = JSON.parse(localStorage.getItem('archiform_user') || '{}')
      if (firm.name) setFirmName(firm.name)
      if (firm.plan) setFirmPlan(firm.plan.toLowerCase())
      if (user.firstName) {
        setUserName(user.firstName)
        setUserInitials(
          `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase()
        )
      }
    } catch {}
  }, [])

  // Load projects and staff for timer
  useEffect(() => {
    if (!showTimerPanel) return
    const token = localStorage.getItem('archiform_token')
    if (!token) return
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: `{
          projects { id name status }
          staff { id user { firstName lastName } }
        }`
      }),
    })
    .then(r => r.json())
    .then(d => {
      const projs = d.data?.projects || []
      const stf = d.data?.staff || []
      setProjects(projs)
      setStaff(stf)
      if (projs[0] && !selectedProject) setSelectedProject(projs[0].id)
      if (stf[0] && !selectedStaff) setSelectedStaff(stf[0].id)
    })
    .catch(console.error)
  }, [showTimerPanel])

  // Timer interval
  useEffect(() => {
    if (timerRunning) {
      startRef.current = Date.now() - timerSeconds * 1000
      intervalRef.current = setInterval(() => {
        setTimerSeconds(Math.floor((Date.now() - startRef.current) / 1000))
      }, 100)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerRunning])

  // Persist timer in localStorage
  useEffect(() => {
    if (timerRunning) {
      localStorage.setItem('archiform_timer', JSON.stringify({
        running: true,
        startedAt: Date.now() - timerSeconds * 1000,
        projectId: selectedProject,
        staffId: selectedStaff,
        description,
      }))
    } else {
      localStorage.removeItem('archiform_timer')
    }
  }, [timerRunning, timerSeconds, selectedProject, selectedStaff, description])

  // Restore timer on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('archiform_timer') || 'null')
      if (saved?.running) {
        const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000)
        setTimerSeconds(elapsed)
        setSelectedProject(saved.projectId || '')
        setSelectedStaff(saved.staffId || '')
        setDescription(saved.description || '')
        setShowTimerPanel(true)
        setTimerRunning(true)
      }
    } catch {}
  }, [])

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleStart = () => {
    setShowTimerPanel(true)
    setTimerRunning(true)
  }

  const handleStop = async () => {
    setTimerRunning(false)
    localStorage.removeItem('archiform_timer')
    if (timerSeconds < 60 || !selectedProject || !selectedStaff) {
      setTimerSeconds(0)
      setShowTimerPanel(false)
      return
    }
    setSaving(true)
    const hours = Math.max(0.25, Math.round(timerSeconds / 3600 * 4) / 4)
    const today = new Date().toISOString().split('T')[0]
    try {
      const token = localStorage.getItem('archiform_token')
      const res = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `mutation {
            logTime(input: {
              staffId: "${selectedStaff}"
              projectId: "${selectedProject}"
              entryDate: "${today}"
              hours: ${hours}
              description: "${(description || 'Timer entry').replace(/"/g, '\\"')}"
              isBillable: true
            }) { id hours }
          }`
        }),
      })
      const json = await res.json()
      if (!json.errors) {
        setSaved(true)
        setTimeout(() => {
          setSaved(false)
          setShowTimerPanel(false)
          setTimerSeconds(0)
          setDescription('')
        }, 2000)
      }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleDiscard = () => {
    setTimerRunning(false)
    setTimerSeconds(0)
    setDescription('')
    setShowTimerPanel(false)
    localStorage.removeItem('archiform_timer')
  }

  return (
    <aside className="app-sidebar">
      {/* Firm selector */}
      <div className="px-3 py-4 border-b border-white/10">
        <button className="w-full flex items-center gap-2.5 p-2.5 rounded-lg
          hover:bg-white/10 transition-colors group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center
            justify-center flex-shrink-0 text-white font-bold text-sm">
            {firmName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-white text-xs font-semibold truncate">{firmName}</p>
            <p className="text-white/40 text-[10px] capitalize">{firmPlan} plan</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-white/40
            group-hover:text-white/60 flex-shrink-0" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={cn('sidebar-item', isActive && 'active')}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Timer Panel */}
      {showTimerPanel && (
        <div className="mx-2 mb-2 bg-white/10 rounded-xl p-3 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <span className={cn(
              'text-lg font-mono font-bold',
              timerRunning ? 'text-green-400' : 'text-white/60'
            )}>
              {formatTimer(timerSeconds)}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                  timerRunning
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-green-500 hover:bg-green-600'
                )}>
                {timerRunning
                  ? <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                  : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
              </button>
              <button onClick={handleStop} disabled={saving}
                className="w-7 h-7 rounded-full bg-brand-500 hover:bg-brand-600
                  flex items-center justify-center transition-all">
                <Square className="w-3 h-3 text-white" />
              </button>
              <button onClick={handleDiscard}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20
                  flex items-center justify-center transition-all">
                <X className="w-3 h-3 text-white/60" />
              </button>
            </div>
          </div>

          {saved && (
            <p className="text-xs text-green-400 font-medium mb-2">✅ Saved!</p>
          )}

          <input value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="w-full px-2.5 py-1.5 bg-white/10 border border-white/20
              rounded-lg text-xs text-white placeholder-white/30
              focus:outline-none focus:ring-1 focus:ring-brand-400 mb-2" />

          <select value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white/10 border border-white/20
              rounded-lg text-xs text-white focus:outline-none
              focus:ring-1 focus:ring-brand-400 mb-2">
            <option value="" className="text-black">Select project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} className="text-black">{p.name}</option>
            ))}
          </select>

          <select value={selectedStaff}
            onChange={e => setSelectedStaff(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white/10 border border-white/20
              rounded-lg text-xs text-white focus:outline-none
              focus:ring-1 focus:ring-brand-400">
            <option value="" className="text-black">Select staff</option>
            {staff.map(s => (
              <option key={s.id} value={s.id} className="text-black">
                {s.user.firstName} {s.user.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bottom actions */}
      <div className="px-2 pb-4 border-t border-white/10 pt-3 space-y-0.5">
        {/* Timer trigger */}
        <button
          onClick={showTimerPanel ? handleDiscard : handleStart}
          className={cn(
            'sidebar-item w-full relative',
            timerRunning && 'text-green-400 bg-green-400/10'
          )}>
          {timerRunning && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full
              bg-green-400 animate-pulse" />
          )}
          <Timer className="w-5 h-5" />
          <span>{timerRunning ? formatTimer(timerSeconds) : 'Timer'}</span>
        </button>

        {/* Rewards */}
        <button className="sidebar-item w-full">
          <Gift className="w-5 h-5" />
          <span>Rewards</span>
        </button>

        {/* User row */}
        <div className="flex items-center justify-between px-2 py-2 mt-1">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar name={userInitials} size="sm" />
            {userName && (
              <p className="text-white text-xs font-medium truncate">{userName}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link href="/settings" title="Settings">
              <Settings className="w-4 h-4 text-white/40 hover:text-white/70
                transition-colors" />
            </Link>
            <button onClick={logout} title="Log out"
              className="p-1 rounded hover:bg-white/10 transition-colors group">
              <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-400
                transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}