'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus, X, ChevronLeft, ChevronRight,
  Clock, List, LayoutGrid
} from 'lucide-react'
import { gql } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { apolloClient } from '@/lib/apollo-client'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'
import { SkeletonTable } from '@/components/ui/skeleton'

const GET_TIME_DATA = gql`
  query GetTimeData($weekStart: String!) {
    timeEntries {
      id
      entryDate
      hours
      description
      isBillable
      project { id name }
      staff { id user { firstName lastName } }
    }
    weeklyTimesheet(weekStart: $weekStart) {
      staff { id user { firstName lastName } }
      totalHours
      days {
        date
        hours
        entries {
          id
          hours
          description
          isBillable
          project { id name }
        }
      }
    }
    projects { id name status }
    staff { id user { firstName lastName } }
  }
`

function LogTimeModal({ onClose, onLogged, projects, staff }: {
  onClose: () => void
  onLogged: () => void
  projects: any[]
  staff: any[]
}) {
  const [form, setForm] = useState({
    staffId: staff[0]?.id || '',
    projectId: projects[0]?.id || '',
    entryDate: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    isBillable: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string, value: any) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.staffId) { setError('Select a staff member'); return }
    if (!form.projectId) { setError('Select a project'); return }
    if (!form.hours || Number(form.hours) <= 0) {
      setError('Hours must be greater than 0'); return
    }
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('archiform_token')
      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation {
            logTime(input: {
              staffId: "${form.staffId}"
              projectId: "${form.projectId}"
              entryDate: "${form.entryDate}"
              hours: ${parseFloat(form.hours)}
              description: "${(form.description || '').replace(/"/g, '\\"')}"
              isBillable: ${form.isBillable}
            }) { id hours entryDate }
          }`
        }),
      })
      const json = await response.json()
      if (json.errors) {
        setError(json.errors[0]?.message || 'Failed to log time')
        return
      }
      await apolloClient.clearStore()
      onLogged()
      onClose()
    } catch (err) {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-navy-900">Log time</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Staff member *
              </label>
              <select value={form.staffId}
                onChange={e => set('staffId', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select staff</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.user.firstName} {s.user.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Project *
              </label>
              <select value={form.projectId}
                onChange={e => set('projectId', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg
                  text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date *" type="date" value={form.entryDate}
              onChange={e => set('entryDate', e.target.value)} />
            <Input label="Hours *" type="number" placeholder="e.g. 8"
              step="0.25" min="0.25" max="24"
              value={form.hours}
              onChange={e => set('hours', e.target.value)} />
          </div>
          <Input label="Description" placeholder="What did you work on?"
            value={form.description}
            onChange={e => set('description', e.target.value)} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isBillable}
              onChange={e => set('isBillable', e.target.checked)}
              className="w-4 h-4 rounded border-border text-brand-500" />
            <span className="text-sm text-navy-900">Billable</span>
          </label>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Log Time</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TimePage() {
  const [view, setView] = useState<'list' | 'weekly'>('weekly')
  const [entries, setEntries] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(() => getWeekStart(new Date()))
  const [expandedCell, setExpandedCell] = useState<string | null>(null)

  const weekStartStr = currentWeek.toISOString().split('T')[0]

  const fetchData = () => {
    setLoading(true)
    apolloClient.query({
      query: GET_TIME_DATA,
      variables: { weekStart: weekStartStr },
      fetchPolicy: 'network-only',
    })
    .then(result => {
      setEntries(result.data?.timeEntries || [])
      setWeeklyData(result.data?.weeklyTimesheet || [])
      setProjects(result.data?.projects || [])
      setStaff(result.data?.staff || [])
      setLoading(false)
    })
    .catch(err => { console.error(err); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [weekStartStr])

  const prevWeek = () => {
    const d = new Date(currentWeek)
    d.setDate(d.getDate() - 7)
    setCurrentWeek(d)
  }

  const nextWeek = () => {
    const d = new Date(currentWeek)
    d.setDate(d.getDate() + 7)
    setCurrentWeek(d)
  }

  const goToCurrentWeek = () => setCurrentWeek(getWeekStart(new Date()))

  const weekEnd = new Date(currentWeek)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const weekLabel = `${currentWeek.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })} – ${weekEnd.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })}`

  const isCurrentWeek =
    getWeekStart(new Date()).getTime() === currentWeek.getTime()

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeek)
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const totalWeekHours = weeklyData.reduce(
    (sum, row) => sum + row.totalHours, 0
  )

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <>
      <div className="app-topbar">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold text-navy-900">Time</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('weekly')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs',
                  'font-medium transition-colors',
                  view === 'weekly'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-muted-foreground hover:text-navy-900'
                )}>
                <LayoutGrid className="w-3.5 h-3.5" />
                Weekly
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs',
                  'font-medium transition-colors',
                  view === 'list'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-muted-foreground hover:text-navy-900'
                )}>
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div>
            <Button onClick={() => setShowModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}>
              Log time
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">

        {/* ── Weekly view ── */}
        {view === 'weekly' && (
          <>
            {/* Week navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center
              justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <button onClick={prevWeek}
                  className="p-2 rounded-lg border border-border
                    hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className="text-center">
                  <p className="text-sm font-semibold text-navy-900">
                    {weekLabel}
                  </p>
                  {isCurrentWeek && (
                    <p className="text-xs text-brand-500 font-medium">
                      Current week
                    </p>
                  )}
                </div>
                <button onClick={nextWeek}
                  className="p-2 rounded-lg border border-border
                    hover:bg-gray-50 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Total this week
                  </p>
                  <p className="text-lg font-bold text-navy-900">
                    {totalWeekHours.toFixed(1)}h
                  </p>
                </div>
                {!isCurrentWeek && (
                  <button onClick={goToCurrentWeek}
                    className="text-xs text-brand-500 hover:underline
                      font-medium">
                    Today
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <SkeletonTable rows={3} cols={9} />
            ) : weeklyData.length === 0 ? (
              <div className="bg-white rounded-xl border border-border
                p-12 text-center">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex
                  items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="font-semibold text-navy-900 mb-2">
                  No staff members yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add staff members to start tracking time.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-white">
                <div
                  className="overflow-x-auto rounded-xl"
                  style={{ WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ minWidth: '800px', width: '100%' }}>
                    <thead>
                      <tr className="border-b border-border bg-gray-50">
                        {/* Team member column */}
                        <th
                          className="text-left text-xs font-semibold
                            text-muted-foreground uppercase tracking-wide
                            px-3 py-3"
                          style={{ minWidth: '130px', width: '130px' }}>
                          Team Member
                        </th>

                        {/* Day columns */}
                        {weekDates.map((dateStr, i) => {
                          const isToday = dateStr === todayStr
                          return (
                            <th key={dateStr}
                              className={cn(
                                'text-center text-xs font-semibold',
                                'uppercase tracking-wide px-1 py-3',
                                isToday
                                  ? 'text-brand-600 bg-brand-50'
                                  : 'text-muted-foreground'
                              )}
                              style={{ minWidth: '70px' }}>
                              <div>{DAYS[i]}</div>
                              <div className={cn(
                                'text-[10px] font-normal mt-0.5',
                                isToday
                                  ? 'text-brand-500'
                                  : 'text-muted-foreground'
                              )}>
                                {formatShortDate(dateStr)}
                              </div>
                            </th>
                          )
                        })}

                        {/* Total column */}
                        <th
                          className="text-center text-xs font-semibold
                            text-muted-foreground uppercase tracking-wide
                            px-2 py-3"
                          style={{ minWidth: '55px' }}>
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {weeklyData.map((row, rowIndex) => (
                        <tr key={row.staff.id}
                          className={cn(
                            'border-b border-border last:border-0',
                            rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          )}>

                          {/* Staff member */}
                          <td className="px-3 py-3"
                            style={{ minWidth: '130px', width: '130px' }}>
                            <div className="flex items-center gap-1.5">
                              <Avatar
                                name={`${row.staff.user.firstName} ${row.staff.user.lastName}`}
                                size="sm"
                              />
                              <span
                                className="text-xs font-medium text-navy-900"
                                style={{
                                  maxWidth: '80px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block'
                                }}>
                                {row.staff.user.firstName}{' '}
                                {row.staff.user.lastName}
                              </span>
                            </div>
                          </td>

                          {/* Day cells */}
                          {row.days.map((day: any) => {
                            const cellKey = `${row.staff.id}-${day.date}`
                            const hasHours = day.hours > 0
                            const isToday = day.date === todayStr
                            const isExpanded = expandedCell === cellKey

                            return (
                              <td key={day.date}
                                className={cn(
                                  'px-1 py-3 text-center relative',
                                  isToday && 'bg-brand-50/50'
                                )}
                                style={{ minWidth: '70px' }}>
                                <button
                                  onClick={() => hasHours
                                    ? setExpandedCell(
                                        isExpanded ? null : cellKey
                                      )
                                    : undefined
                                  }
                                  className={cn(
                                    'w-full py-1.5 px-1 rounded-lg text-xs',
                                    'font-semibold transition-colors',
                                    hasHours
                                      ? 'bg-brand-100 text-brand-700 hover:bg-brand-200 cursor-pointer'
                                      : 'text-gray-300 cursor-default'
                                  )}>
                                  {hasHours
                                    ? `${day.hours.toFixed(1)}h`
                                    : '—'}
                                </button>

                                {/* Expanded tooltip */}
                                {isExpanded && hasHours && (
                                  <>
                                    <div className="fixed inset-0 z-10"
                                      onClick={() => setExpandedCell(null)} />
                                    <div className="absolute top-full left-1/2
                                      -translate-x-1/2 mt-1 z-20 bg-white
                                      rounded-xl border border-border
                                      shadow-xl p-3 w-52 text-left">
                                      <p className="text-xs font-semibold
                                        text-navy-900 mb-2">
                                        {formatDate(day.date)}
                                      </p>
                                      <div className="space-y-2">
                                        {day.entries.map((entry: any) => (
                                          <div key={entry.id}
                                            className="text-xs border-b
                                              border-border pb-2 last:border-0
                                              last:pb-0">
                                            <div className="flex justify-between
                                              items-center">
                                              <span className="font-medium
                                                text-navy-900">
                                                {entry.hours}h
                                              </span>
                                              {entry.isBillable && (
                                                <span className="text-[10px]
                                                  bg-green-100 text-green-700
                                                  px-1.5 py-0.5 rounded-full
                                                  font-medium">
                                                  Billable
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-muted-foreground mt-0.5">
                                              {entry.project?.name || 'No project'}
                                            </p>
                                            {entry.description && (
                                              <p className="text-muted-foreground
                                                italic mt-0.5 line-clamp-2">
                                                {entry.description}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </td>
                            )
                          })}

                          {/* Row total */}
                          <td className="px-2 py-3 text-center"
                            style={{ minWidth: '55px' }}>
                            <span className={cn(
                              'text-sm font-bold',
                              row.totalHours > 0
                                ? 'text-navy-900'
                                : 'text-gray-300'
                            )}>
                              {row.totalHours > 0
                                ? `${row.totalHours.toFixed(1)}h`
                                : '—'}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Totals row */}
                      <tr className="bg-gray-50 border-t-2 border-border">
                        <td className="px-3 py-3 text-xs font-bold
                          text-muted-foreground uppercase tracking-wide">
                          Total
                        </td>
                        {weekDates.map(dateStr => {
                          const dayTotal = weeklyData.reduce((sum, row) => {
                            const day = row.days.find(
                              (d: any) => d.date === dateStr
                            )
                            return sum + (day?.hours || 0)
                          }, 0)
                          const isToday = dateStr === todayStr
                          return (
                            <td key={dateStr}
                              className={cn(
                                'px-1 py-3 text-center text-xs font-bold',
                                isToday ? 'text-brand-600' : 'text-navy-900'
                              )}
                              style={{ minWidth: '70px' }}>
                              {dayTotal > 0
                                ? `${dayTotal.toFixed(1)}h`
                                : '—'}
                            </td>
                          )
                        })}
                        <td className="px-2 py-3 text-center text-sm
                          font-bold text-navy-900"
                          style={{ minWidth: '55px' }}>
                          {totalWeekHours.toFixed(1)}h
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── List view ── */}
        {view === 'list' && (
          <>
            {loading && <SkeletonTable rows={5} cols={6} />}

            {!loading && entries.length === 0 && (
              <div className="flex flex-col items-center justify-center
                py-24 text-center">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex
                  items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">
                  No time entries yet
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-8">
                  Start logging time against projects to track your team's work.
                </p>
                <Button onClick={() => setShowModal(true)}
                  leftIcon={<Plus className="w-4 h-4" />}>
                  Log your first entry
                </Button>
              </div>
            )}

            {!loading && entries.length > 0 && (
              <div className="rounded-xl border border-border bg-white">
                <div className="overflow-x-auto rounded-xl"
                  style={{ WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ minWidth: '600px', width: '100%' }}>
                    <thead>
                      <tr className="border-b border-border bg-gray-50">
                        {['Date', 'Staff', 'Project', 'Hours',
                          'Description', 'Billable'].map(h => (
                          <th key={h}
                            className="text-left text-xs font-semibold
                              text-muted-foreground uppercase tracking-wide
                              px-4 py-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, i) => (
                        <tr key={entry.id}
                          className={cn(
                            'border-b border-border last:border-0',
                            i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          )}>
                          <td className="px-4 py-3 text-sm text-navy-900">
                            {formatDate(entry.entryDate)}
                          </td>
                          <td className="px-4 py-3 text-sm text-navy-900">
                            {entry.staff?.user?.firstName}{' '}
                            {entry.staff?.user?.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm
                            text-muted-foreground">
                            {entry.project?.name || '—'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold
                            text-navy-900">
                            {entry.hours}h
                          </td>
                          <td className="px-4 py-3 text-sm
                            text-muted-foreground"
                            style={{
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                            {entry.description || '—'}
                          </td>
                          <td className="px-4 py-3">
                            {entry.isBillable ? (
                              <span className="text-xs bg-green-100
                                text-green-700 px-2 py-0.5 rounded-full
                                font-medium">
                                Billable
                              </span>
                            ) : (
                              <span className="text-xs bg-gray-100
                                text-gray-500 px-2 py-0.5 rounded-full
                                font-medium">
                                Non-billable
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <LogTimeModal
          onClose={() => setShowModal(false)}
          onLogged={fetchData}
          projects={projects}
          staff={staff}
        />
      )}
    </>
  )
}