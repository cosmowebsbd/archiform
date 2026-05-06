'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, X, Edit2, Trash2,
  Calendar, DollarSign, Clock, CheckCircle2,
  Circle, PlayCircle, ChevronDown
} from 'lucide-react'
import { gql } from '@apollo/client'
import { apolloClient } from '@/lib/apollo-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id name description status category
      totalBudget spentAmount startDate endDate
      contact { id name email }
      phases {
        id name description status sortOrder
        budgetHours loggedHours budgetAmount spentAmount
        startDate endDate
      }
      createdAt updatedAt
    }
  }
`

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  DRAFT:       { label: 'Draft',       color: 'text-gray-500',   bg: 'bg-gray-100',   icon: Circle },
  ACTIVE:      { label: 'Active',      color: 'text-green-700',  bg: 'bg-green-100',  icon: PlayCircle },
  ON_HOLD:     { label: 'On Hold',     color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Circle },
  COMPLETED:   { label: 'Completed',   color: 'text-blue-700',   bg: 'bg-blue-100',   icon: CheckCircle2 },
  ARCHIVED:    { label: 'Archived',    color: 'text-gray-400',   bg: 'bg-gray-50',    icon: Circle },
}

const phaseStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  NOT_STARTED: { label: 'Not Started', color: 'text-gray-500',  bg: 'bg-gray-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-700',  bg: 'bg-blue-100' },
  COMPLETED:   { label: 'Completed',   color: 'text-green-700', bg: 'bg-green-100' },
}

function AddPhaseModal({ projectId, onClose, onAdded }: {
  projectId: string
  onClose: () => void
  onAdded: () => void
}) {
  const [form, setForm] = useState({
    name: '', description: '',
    budgetHours: '', budgetAmount: '',
    startDate: '', endDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Phase name is required'); return }
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('archiform_token')
      const res = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation {
            addPhase(projectId: "${projectId}", input: {
              name: "${form.name.trim().replace(/"/g, '\\"')}"
              ${form.description ? `description: "${form.description.replace(/"/g, '\\"')}"` : ''}
              budgetHours: ${parseFloat(form.budgetHours) || 0}
              budgetAmount: ${parseFloat(form.budgetAmount) || 0}
              ${form.startDate ? `startDate: "${form.startDate}"` : ''}
              ${form.endDate ? `endDate: "${form.endDate}"` : ''}
            }) {
              id name status budgetHours budgetAmount sortOrder
            }
          }`
        }),
      })
      const json = await res.json()
      if (json.errors) { setError(json.errors[0]?.message || 'Failed to add phase'); return }
      onAdded()
      onClose()
    } catch (err) { setError('Connection failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-navy-900">Add Phase</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <Input label="Phase name *" placeholder="e.g. Schematic Design"
            value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          <Input label="Description" placeholder="What does this phase cover?"
            value={form.description} onChange={e => set('description', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Budget hours" type="number" placeholder="e.g. 80"
              value={form.budgetHours} onChange={e => set('budgetHours', e.target.value)} />
            <Input label="Budget amount ($)" type="number" placeholder="e.g. 12000"
              value={form.budgetAmount} onChange={e => set('budgetAmount', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="date"
              value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            <Input label="End date" type="date"
              value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Add Phase</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddPhase, setShowAddPhase] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const fetchProject = () => {
    setLoading(true)
    apolloClient.query({
      query: GET_PROJECT,
      variables: { id },
      fetchPolicy: 'network-only',
    })
    .then(r => { setProject(r.data?.project); setLoading(false) })
    .catch(err => { console.error(err); setLoading(false) })
  }

  useEffect(() => { fetchProject() }, [id])

  const handleUpdateStatus = async (status: string) => {
    setUpdatingStatus(true)
    setShowStatusMenu(false)
    try {
      const token = localStorage.getItem('archiform_token')
      await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation {
            updateProject(id: "${id}", input: { status: ${status} }) {
              id status
            }
          }`
        }),
      })
      fetchProject()
    } catch (e) { console.error(e) }
    finally { setUpdatingStatus(false) }
  }

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm('Delete this phase?')) return
    // Phase deletion not in schema yet — show coming soon
    alert('Phase deletion coming soon')
  }

  if (loading) return (
    <div>
      <div className="app-topbar">
        <Link href="/projects" className="flex items-center gap-2 text-muted-foreground
          hover:text-navy-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Projects
        </Link>
      </div>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent
          rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!project) return (
    <div>
      <div className="app-topbar">
        <Link href="/projects" className="flex items-center gap-2 text-muted-foreground
          hover:text-navy-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Projects
        </Link>
      </div>
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          Project not found.
        </div>
      </div>
    </div>
  )

  const cfg = statusConfig[project.status] || statusConfig.DRAFT
  const budgetPct = project.totalBudget > 0
    ? Math.round((project.spentAmount / project.totalBudget) * 100) : 0
  const totalPhaseBudget = project.phases?.reduce(
    (s: number, p: any) => s + p.budgetAmount, 0) || 0
  const totalPhaseHours = project.phases?.reduce(
    (s: number, p: any) => s + p.budgetHours, 0) || 0
  const totalLoggedHours = project.phases?.reduce(
    (s: number, p: any) => s + p.loggedHours, 0) || 0

  return (
    <>
      <div className="app-topbar">
        <div className="flex items-center gap-4 w-full">
          <Link href="/projects"
            className="flex items-center gap-2 text-muted-foreground
              hover:text-navy-900 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Projects
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-navy-900 truncate">{project.name}</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm"
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
              Edit
            </Button>
            <Button size="sm" onClick={() => setShowAddPhase(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Phase
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Header */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-semibold text-navy-900">{project.name}</h1>

                {/* Status badge with dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className={cn(
                      'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5',
                      'rounded-full transition-colors cursor-pointer',
                      cfg.bg, cfg.color
                    )}>
                    <cfg.icon className="w-3 h-3" />
                    {cfg.label}
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>
                  {showStatusMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl
                      border border-border shadow-lg z-10 py-1 min-w-[140px]">
                      {Object.entries(statusConfig).map(([key, val]) => (
                        <button key={key} onClick={() => handleUpdateStatus(key)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-xs',
                            'hover:bg-gray-50 transition-colors',
                            project.status === key ? 'font-bold' : ''
                          )}>
                          <span className={cn(
                            'w-2 h-2 rounded-full',
                            key === 'ACTIVE' ? 'bg-green-500' :
                            key === 'ON_HOLD' ? 'bg-yellow-500' :
                            key === 'COMPLETED' ? 'bg-blue-500' :
                            'bg-gray-400'
                          )} />
                          {val.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {project.category && (
                  <span className="text-xs text-muted-foreground bg-gray-100
                    px-2 py-1 rounded-full">
                    {project.category}
                  </span>
                )}
              </div>

              {project.description && (
                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                {project.contact && (
                  <span className="flex items-center gap-1">
                    👤 {project.contact.name}
                  </span>
                )}
                {project.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.startDate)}
                    {project.endDate && ` → ${formatDate(project.endDate)}`}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  📋 Created {formatDate(project.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Budget overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6
            border-t border-border">
            {[
              {
                label: 'Total Budget',
                value: formatCurrency(project.totalBudget),
                icon: DollarSign,
                color: 'text-brand-500',
              },
              {
                label: 'Spent',
                value: formatCurrency(project.spentAmount),
                sub: `${budgetPct}% used`,
                icon: DollarSign,
                color: budgetPct >= 90 ? 'text-red-500' :
                       budgetPct >= 75 ? 'text-orange-500' : 'text-green-500',
              },
              {
                label: 'Phase Hours',
                value: `${totalLoggedHours.toFixed(1)}h logged`,
                sub: `of ${totalPhaseHours.toFixed(0)}h budgeted`,
                icon: Clock,
                color: 'text-blue-500',
              },
              {
                label: 'Phases',
                value: project.phases?.length || 0,
                sub: `${project.phases?.filter((p: any) => p.status === 'COMPLETED').length || 0} completed`,
                icon: CheckCircle2,
                color: 'text-purple-500',
              },
            ].map(stat => (
              <div key={stat.label}
                className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <p className="text-lg font-semibold text-navy-900">{stat.value}</p>
                {stat.sub && (
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                )}
              </div>
            ))}
          </div>

          {/* Budget progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Budget utilization</span>
              <span>{budgetPct}%</span>
            </div>
            <Progress value={budgetPct} size="md"
              variant={budgetPct >= 90 ? 'danger' : budgetPct >= 75 ? 'warning' : 'success'} />
          </div>
        </div>

        {/* Phases */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-navy-900">
              Phases
              {project.phases?.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({project.phases.length})
                </span>
              )}
            </h2>
            <Button size="sm" variant="outline"
              onClick={() => setShowAddPhase(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Phase
            </Button>
          </div>

          {project.phases?.length === 0 ? (
            <div className="bg-white rounded-xl border border-border p-8 text-center">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center
                justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="font-semibold text-navy-900 mb-1">No phases yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Break your project into phases like Schematic Design,
                Design Development, and Construction Documents.
              </p>
              <Button size="sm" onClick={() => setShowAddPhase(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add your first phase
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {project.phases.map((phase: any, index: number) => {
                const phaseCfg = phaseStatusConfig[phase.status] || phaseStatusConfig.NOT_STARTED
                const phasePct = phase.budgetAmount > 0
                  ? Math.round((phase.spentAmount / phase.budgetAmount) * 100) : 0
                const hoursPct = phase.budgetHours > 0
                  ? Math.round((phase.loggedHours / phase.budgetHours) * 100) : 0

                return (
                  <div key={phase.id}
                    className="bg-white rounded-xl border border-border p-5
                      hover:shadow-sm transition-all">
                    <div className="flex items-start gap-4">
                      {/* Phase number */}
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center
                        justify-center flex-shrink-0 text-xs font-bold text-brand-600">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-navy-900 text-sm">{phase.name}</h3>
                          <span className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                            phaseCfg.bg, phaseCfg.color
                          )}>
                            {phaseCfg.label}
                          </span>
                        </div>

                        {phase.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {phase.description}
                          </p>
                        )}

                        {/* Phase dates */}
                        {(phase.startDate || phase.endDate) && (
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(phase.startDate)} → {formatDate(phase.endDate)}
                          </p>
                        )}

                        {/* Budget and hours */}
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <div className="flex justify-between text-xs
                              text-muted-foreground mb-1">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> Budget
                              </span>
                              <span>{phasePct}%</span>
                            </div>
                            <Progress value={phasePct} size="sm"
                              variant={phasePct >= 90 ? 'danger' :
                                phasePct >= 75 ? 'warning' : 'success'} />
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatCurrency(phase.spentAmount)} /
                              {formatCurrency(phase.budgetAmount)}
                            </p>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs
                              text-muted-foreground mb-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Hours
                              </span>
                              <span>{hoursPct}%</span>
                            </div>
                            <Progress value={hoursPct} size="sm"
                              variant={hoursPct >= 90 ? 'danger' :
                                hoursPct >= 75 ? 'warning' : 'success'} />
                            <p className="text-xs text-muted-foreground mt-1">
                              {phase.loggedHours.toFixed(1)}h / {phase.budgetHours.toFixed(0)}h
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Phase actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleDeletePhase(phase.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500
                            hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showAddPhase && (
        <AddPhaseModal
          projectId={id as string}
          onClose={() => setShowAddPhase(false)}
          onAdded={fetchProject}
        />
      )}

      {/* Close status menu on outside click */}
      {showStatusMenu && (
        <div className="fixed inset-0 z-0"
          onClick={() => setShowStatusMenu(false)} />
      )}
    </>
  )
}