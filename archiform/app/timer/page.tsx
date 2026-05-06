'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Clock } from 'lucide-react'
import { gql } from '@apollo/client'
import { apolloClient } from '@/lib/apollo-client'
import { cn } from '@/lib/utils'

const GET_TIMER_DATA = gql`
  query {
    projects { id name status }
    staff { id user { firstName lastName } }
  }
`

export default function TimerPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [description, setDescription] = useState('')
  const [isBillable, setIsBillable] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [entries, setEntries] = useState<any[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    apolloClient.query({ query: GET_TIMER_DATA, fetchPolicy: 'network-only' })
      .then(r => {
        setProjects(r.data?.projects?.filter((p: any) => p.status === 'ACTIVE') || [])
        setStaff(r.data?.staff || [])
        if (r.data?.staff?.[0]) setSelectedStaff(r.data.staff[0].id)
        if (r.data?.projects?.[0]) setSelectedProject(r.data.projects[0].id)
      })
  }, [])

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - seconds * 1000
      intervalRef.current = setInterval(() => {
        setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 100)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleStop = async () => {
    setRunning(false)
    if (seconds < 60) { setSeconds(0); return }
    if (!selectedProject || !selectedStaff) { setSeconds(0); return }

    setSaving(true)
    const hours = Math.max(0.25, Math.round(seconds / 3600 * 4) / 4)

    try {
      const token = localStorage.getItem('archiform_token')
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation {
            logTime(input: {
              staffId: "${selectedStaff}"
              projectId: "${selectedProject}"
              entryDate: "${today}"
              hours: ${hours}
              description: "${description.replace(/"/g, '\\"') || 'Timer entry'}"
              isBillable: ${isBillable}
            }) { id hours entryDate }
          }`
        }),
      })
      const json = await response.json()
      if (!json.errors) {
        const proj = projects.find(p => p.id === selectedProject)
        const member = staff.find(s => s.id === selectedStaff)
        setEntries(prev => [{
          id: Date.now(),
          hours,
          description: description || 'Timer entry',
          project: proj?.name || '',
          staff: member ? `${member.user.firstName} ${member.user.lastName}` : '',
          time: new Date().toLocaleTimeString(),
        }, ...prev])
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) { console.error(err) }
    finally { setSaving(false); setSeconds(0); setDescription('') }
  }

  const handleDiscard = () => {
    setRunning(false)
    setSeconds(0)
    setDescription('')
  }

  return (
    <div>
      <div className="app-topbar">
        <h1 className="text-lg font-semibold text-navy-900">Timer</h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Timer display */}
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <div className={cn(
            'text-7xl font-mono font-bold mb-8 transition-colors',
            running ? 'text-brand-600' : 'text-navy-900'
          )}>
            {formatTime(seconds)}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setRunning(!running)}
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg',
                running
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-brand-500 hover:bg-brand-600 text-white'
              )}
            >
              {running
                ? <Pause className="w-7 h-7" />
                : <Play className="w-7 h-7 ml-1" />}
            </button>

            {(running || seconds > 0) && (
              <>
                <button
                  onClick={handleStop}
                  disabled={saving}
                  className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600
                    text-white flex items-center justify-center transition-all shadow-md"
                >
                  <Square className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDiscard}
                  className="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200
                    text-red-600 flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </>
            )}
          </div>

          {saved && (
            <div className="mb-4 py-2 px-4 bg-green-50 border border-green-200
              rounded-lg text-sm text-green-700 font-medium">
              ✅ Time entry saved successfully!
            </div>
          )}

          {/* Form */}
          <div className="space-y-3 text-left">
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select staff</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.user.firstName} {s.user.lastName}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isBillable}
                onChange={e => setIsBillable(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-500" />
              <span className="text-sm text-navy-900">Billable time</span>
            </label>
          </div>
        </div>

        {/* Today's entries */}
        {entries.length > 0 && (
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Today's entries
            </h3>
            <div className="space-y-3">
              {entries.map(entry => (
                <div key={entry.id}
                  className="flex items-center justify-between py-2
                    border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-navy-900">
                      {entry.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.project} · {entry.staff} · {entry.time}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-navy-900">
                    {entry.hours}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            Add projects and staff members before using the timer.
          </div>
        )}
      </div>
    </div>
  )
}