'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus, ChevronDown, X, SortAsc, Monitor,
  Sparkles, FileText, LayoutTemplate, PenLine, ArrowRight
} from 'lucide-react'
import { gql } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { apolloClient } from '@/lib/apollo-client'
import { cn, formatCurrency } from '@/lib/utils'

const GET_PROJECTS = gql`
  query {
    projects {
      id
      name
      status
      category
      totalBudget
      spentAmount
      startDate
      endDate
      contact { id name }
      phases {
        id
        name
        status
        budgetAmount
        spentAmount
      }
      createdAt
    }
  }
`

const CREATE_PROJECT = gql`
  mutation CreateProject(
    $name: String!
    $totalBudget: Float!
    $category: String
    $description: String
  ) {
    createProject(input: {
      name: $name
      totalBudget: $totalBudget
      category: $category
      description: $description
    }) {
      id
      name
      status
      totalBudget
      spentAmount
      phases { id name status }
      createdAt
    }
  }
`

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'Draft',     color: 'text-gray-500',   bg: 'bg-gray-100' },
  ACTIVE:    { label: 'Active',    color: 'text-green-700',  bg: 'bg-green-100' },
  ON_HOLD:   { label: 'On Hold',   color: 'text-yellow-700', bg: 'bg-yellow-100' },
  COMPLETED: { label: 'Completed', color: 'text-blue-700',   bg: 'bg-blue-100' },
  ARCHIVED:  { label: 'Archived',  color: 'text-gray-400',   bg: 'bg-gray-50' },
}

const subNav = ['Projects', 'Drafts', 'Milestones', 'Deliverables', 'Templates', 'Archive']

// ── New Project Modal ─────────────────────────────────
function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState('budget')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    category: '',
    totalBudget: '',
    description: '',
  })

  const options = [
    { icon: Sparkles,      label: 'Build a project budget',            desc: 'Use data-driven recommendations.',       value: 'budget' },
    { icon: FileText,      label: 'Auto-generate from contract',        desc: 'Upload a contract to auto-generate.',    value: 'contract', badge: 'AI' },
    { icon: LayoutTemplate,label: 'Use a template',                     desc: 'Select a template to build faster.',     value: 'template' },
    { icon: PenLine,       label: 'Manually create project',            desc: 'Add contract details manually.',         value: 'manual' },
  ]

  const handleCreate = async () => {
  if (!form.name.trim()) { setError('Project name is required'); return }
  if (!form.totalBudget || Number(form.totalBudget) <= 0) {
    setError('Budget must be greater than 0'); return
  }

  setLoading(true)
  setError('')

  try {
    // Use raw fetch to avoid any Apollo Client issues
    const token = localStorage.getItem('archiform_token')
    const response = await fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `mutation {
          createProject(input: {
            name: "${form.name.trim().replace(/"/g, '\\"')}"
            totalBudget: ${parseFloat(form.totalBudget)}
            ${form.category ? `category: "${form.category.trim()}"` : ''}
            ${form.description ? `description: "${form.description.trim()}"` : ''}
          }) {
            id name status totalBudget spentAmount createdAt
            phases { id name status }
          }
        }`
      }),
    })

    const json = await response.json()
    console.log('Create project response:', json)

    if (json.errors) {
      setError(json.errors[0]?.message || 'Failed to create project')
      return
    }

    onCreated()
    onClose()

  } catch (err: any) {
    console.error('Create project error:', err)
    setError('Connection failed')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-navy-900">New project</h2>
            <p className="text-sm text-muted-foreground">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1 — Choose type */}
          {step === 1 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">Select an option to build your project.</p>
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelected(opt.value)}
                    className={cn(
                      'w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      selected === opt.value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-border hover:border-brand-200 hover:bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center',
                      selected === opt.value ? 'border-brand-500' : 'border-gray-300'
                    )}>
                      {selected === opt.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-navy-900">{opt.label}</span>
                        {'badge' in opt && (
                          <Badge variant="new" className="text-[9px] px-1.5 py-0.5">{opt.badge}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2 — Project details */}
          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="Project name *"
                placeholder="e.g. Riverside HQ"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
              <Input
                label="Total budget ($) *"
                type="number"
                placeholder="e.g. 50000"
                value={form.totalBudget}
                onChange={(e) => setForm(f => ({ ...f, totalBudget: e.target.value }))}
              />
              <Input
                label="Category"
                placeholder="e.g. Commercial, Residential"
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
              />
              <Input
                label="Description"
                placeholder="Brief project description (optional)"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              />
              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={step === 1 ? onClose : () => setStep(1)}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step === 1 ? (
            <Button onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate} loading={loading}>
              Create Project
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeSubNav, setActiveSubNav] = useState('Projects')
  const [activeStatus, setActiveStatus] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchProjects = () => {
  setLoading(true)
  apolloClient.clearStore().then(() => {
    apolloClient.query({
      query: GET_PROJECTS,
      fetchPolicy: 'network-only',
    })
    .then(result => {
      setProjects(result.data?.projects || [])
      setLoading(false)
    })
    .catch(err => {
      console.error('Failed to load projects:', err)
      setLoading(false)
    })
  })
}

  useEffect(() => { fetchProjects() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await apolloClient.mutate({ mutation: DELETE_PROJECT, variables: { id } })
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = activeStatus
    ? projects.filter(p => p.status === activeStatus)
    : projects

  return (
    <>
      {/* Top bar */}
      <div className="app-topbar">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold text-navy-900">Projects</h1>
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            New project
          </Button>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="bg-white border-b border-border px-6">
        <nav className="flex gap-0">
          {subNav.map((item) => (
            <button
              key={item}
              onClick={() => setActiveSubNav(item)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeSubNav === item
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-muted-foreground hover:text-gray-700'
              )}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Filter row */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button className="filter-chip">
            <SortAsc className="w-3.5 h-3.5 text-muted-foreground" />
            Sort by: Alphabetical
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <button
            onClick={() => setActiveStatus(activeStatus ? null : 'ACTIVE')}
            className={cn(
              'filter-chip',
              activeStatus && 'bg-brand-50 border-brand-200 text-brand-700'
            )}
          >
            Statuses
            {activeStatus && (
              <>
                <span className="w-4 h-4 bg-brand-500 text-white rounded-full
                  text-[10px] flex items-center justify-center font-bold">1</span>
                <button onClick={(e) => { e.stopPropagation(); setActiveStatus(null) }}>
                  <X className="w-3 h-3" />
                </button>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {activeStatus && (
            <button
              onClick={() => setActiveStatus(null)}
              className="text-sm text-brand-500 hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
              <Monitor className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900 mb-2">
              {activeStatus ? `No ${activeStatus.toLowerCase()} projects` : 'Build and manage projects'}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              {activeStatus
                ? 'Try removing the status filter to see all projects.'
                : 'Create your first project by adding a budget and phases.'}
            </p>
            {!activeStatus && (
              <Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Create a Project
              </Button>
            )}
          </div>
        )}

        {/* Project list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((project) => {
              const pct = project.totalBudget > 0
                ? Math.round((project.spentAmount / project.totalBudget) * 100)
                : 0
              const cfg = statusConfig[project.status] || statusConfig.DRAFT
              const activePhases = project.phases?.filter(
                (p: any) => p.status === 'IN_PROGRESS'
              ).length || 0

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-border p-5
                    hover:shadow-md hover:border-brand-200 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-navy-900
                          group-hover:text-brand-600 transition-colors">
                          {project.name}
                        </h3>
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                          cfg.bg, cfg.color
                        )}>
                          {cfg.label}
                        </span>
                        {project.category && (
                          <span className="text-xs text-muted-foreground">
                            {project.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.contact?.name || 'No client assigned'} ·{' '}
                        {project.phases?.length || 0} phases
                      </p>
                    </div>

                    {/* Budget */}
                    <div className="w-48 flex-shrink-0">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Budget used</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} size="sm"
                        variant={pct >= 90 ? 'danger' : pct >= 75 ? 'warning' : 'success'} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(project.spentAmount, 'USD', true)} of{' '}
                        {formatCurrency(project.totalBudget, 'USD', true)}
                      </p>
                    </div>

                    {/* Phases */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-navy-900">
                        {activePhases} active
                      </p>
                      <p className="text-xs text-muted-foreground">phases</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingId === project.id}
                        className="text-xs text-red-400 hover:text-red-600
                          transition-colors px-2 py-1 rounded hover:bg-red-50"
                      >
                        {deletingId === project.id ? '...' : 'Delete'}
                      </button>
                      <Link href={`/projects/${project.id}`}>
                        <ArrowRight className="w-4 h-4 text-muted-foreground
                          group-hover:text-brand-500 transition-colors" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={fetchProjects}
        />
      )}
    </>
  )
}