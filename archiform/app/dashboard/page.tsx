'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, TrendingDown, Users, DollarSign, Clock, BarChart2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { apolloClient } from '@/lib/apollo-client'
import { gql } from '@apollo/client'
import { SkeletonDashboard } from '@/components/ui/skeleton'

const DASHBOARD_QUERY = gql`
  query {
    projects { id name status totalBudget spentAmount }
    staff { id hourlyRate targetUtilization user { firstName lastName } }
    invoices { id status total issueDate }
    timeEntries(from: "2024-01-01", to: "2027-01-01") {
      id hours isBillable entryDate
    }
    me { id firstName lastName }
    firm { id name plan trialEndsAt }
    dashboard {
      estimatedOperatingProfit
      utilizationRate
      projectedOperatingProfit
      projectedFirmCapacity
      revenueByMonth {
        month
        revenue
        expenses
        profit
      }
    }
  }
`

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apolloClient.query({ query: DASHBOARD_QUERY, fetchPolicy: 'network-only' })
      .then(result => {
        setData(result.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load dashboard')
        setLoading(false)
        console.error(err)
      })
  }, [])

  if (loading) return <SkeletonDashboard />

  if (error) {
    return (
      <div>
        <div className="app-topbar">
          <h1 className="text-lg font-semibold text-navy-900">Dashboard</h1>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {error} — make sure you are logged in.
          </div>
        </div>
      </div>
    )
  }

  const metrics = data?.dashboard
  const projects = data?.projects || []
  const staff = data?.staff || []
  const invoices = data?.invoices || []
  const timeEntries = data?.timeEntries || []
  const revenueData = metrics?.revenueByMonth || []
  const user = data?.me
  const firm = data?.firm

  // Real KPI calculations from actual data
  const totalBudget = projects.reduce((s: number, p: any) => s + (p.totalBudget || 0), 0)
  const totalHours = timeEntries.reduce((s: number, e: any) => s + (e.hours || 0), 0)
  const billableHours = timeEntries.filter((e: any) => e.isBillable).reduce((s: number, e: any) => s + e.hours, 0)
  const paidRevenue = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + i.total, 0)
  const outstanding = invoices.filter((i: any) => ['SENT', 'VIEWED', 'OVERDUE'].includes(i.status)).reduce((s: number, i: any) => s + i.total, 0)
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length
  const avgHourlyRate = staff.length > 0
    ? staff.reduce((s: number, m: any) => s + (m.hourlyRate || 0), 0) / staff.length
    : 0
  const utilizationRate = staff.length > 0 && totalHours > 0
    ? Math.min((totalHours / (staff.length * 160)) * 100, 100)
    : metrics?.utilizationRate || null

  // Use backend metrics if available, otherwise calculate from raw data
  const estimatedProfit = metrics?.estimatedOperatingProfit ||
    (paidRevenue > 0 ? paidRevenue * 0.35 : null)
  const projectedProfit = metrics?.projectedOperatingProfit ||
    (estimatedProfit ? estimatedProfit * 1.12 : null)
  const projectedCapacity = metrics?.projectedFirmCapacity ||
    (utilizationRate ? Math.min(utilizationRate * 1.05, 100) : null)

  const kpiCards = [
    {
      label: 'TOTAL BUDGET',
      sub: 'across all active projects',
      value: totalBudget > 0 ? totalBudget : null,
      trend: activeProjects > 0 ? +activeProjects : null,
      trendLabel: `${activeProjects} active project${activeProjects !== 1 ? 's' : ''}`,
      link: '/projects',
      linkLabel: 'View all projects →',
      isPercent: false,
      isHours: false,
      icon: BarChart2,
      iconColor: 'text-brand-500',
    },
    {
      label: 'HOURS LOGGED',
      sub: 'all time entries',
      value: totalHours > 0 ? totalHours : null,
      trend: billableHours > 0 ? +(billableHours / totalHours * 100).toFixed(0) : null,
      trendLabel: `${billableHours.toFixed(1)}h billable`,
      link: '/time',
      linkLabel: 'View time entries →',
      isPercent: false,
      isHours: true,
      icon: Clock,
      iconColor: 'text-blue-500',
    },
    {
      label: 'REVENUE COLLECTED',
      sub: 'paid invoices',
      value: paidRevenue > 0 ? paidRevenue : null,
      trend: null,
      trendLabel: outstanding > 0
        ? `${formatCurrency(outstanding)} outstanding`
        : invoices.length > 0 ? 'All invoices paid' : 'No invoices yet',
      link: '/money',
      linkLabel: 'View invoices →',
      isPercent: false,
      isHours: false,
      icon: DollarSign,
      iconColor: 'text-green-500',
    },
    {
      label: 'TEAM UTILIZATION',
      sub: 'based on logged hours',
      value: utilizationRate !== null && utilizationRate > 0 ? utilizationRate : null,
      trend: null,
      trendLabel: staff.length > 0
        ? `${staff.length} team member${staff.length !== 1 ? 's' : ''}`
        : 'Add staff to track',
      link: '/staff',
      linkLabel: 'Go to staffing →',
      isPercent: true,
      isHours: false,
      icon: Users,
      iconColor: 'text-purple-500',
    },
  ]

  const formatKpiValue = (kpi: any) => {
    if (kpi.value === null || kpi.value === undefined) return '--'
    if (kpi.isHours) return `${kpi.value.toFixed(1)}h`
    if (kpi.isPercent) return formatPercent(kpi.value, 1)
    return formatCurrency(kpi.value, 'USD', true)
  }

  return (
    <div>
      {/* Top bar */}
      <div className="app-topbar">
        <h1 className="text-lg font-semibold text-navy-900">Dashboard</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Welcome banner */}
        <div className="relative bg-navy-950 rounded-xl overflow-hidden p-8 text-white">
          <div className="absolute inset-0 section-grid-bg opacity-30" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-normal mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {user ? `Welcome back, ${user.firstName}!` : 'Welcome to your insights dashboard!'}
              </h2>
              <p className="text-white/60 text-sm max-w-lg">
                {firm?.name
                  ? `${firm.name} · ${firm.plan} plan · Real-time profit tracking and team capacity analysis.`
                  : 'Unlock real-time profit tracking, invoice monitoring, phase budget management, and team capacity analysis.'}
              </p>
            </div>
            <Link
              href="/projects"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-brand-500
                hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm
                font-medium transition-colors"
            >
              {projects.length === 0 ? 'Set up your first project' : 'View all projects'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-navy-900">Business performance</h2>
            <Link href="/analytics" className="text-sm text-brand-500 hover:underline">
              See all reports →
            </Link>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiCards.map((kpi) => (
              <div key={kpi.label} className="kpi-card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {kpi.label}
                  </p>
                  <kpi.icon className={`w-4 h-4 ${kpi.iconColor} opacity-60`} />
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">{kpi.sub}</p>

                <p className={`text-3xl font-normal mb-1 ${kpi.value !== null ? 'text-navy-900' : 'text-muted-foreground'}`}
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {formatKpiValue(kpi)}
                </p>

                {kpi.trendLabel && (
                  <div className="flex items-center gap-1 mb-3">
                    {kpi.trend !== null && kpi.trend > 0 && (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    )}
                    {kpi.trend !== null && kpi.trend < 0 && (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-[11px] font-medium ${
                      kpi.trend !== null && kpi.trend > 0 ? 'text-green-600' :
                      kpi.trend !== null && kpi.trend < 0 ? 'text-red-600' :
                      'text-muted-foreground'
                    }`}>
                      {kpi.trendLabel}
                    </span>
                  </div>
                )}

                <Link href={kpi.link} className="text-xs text-brand-500 hover:underline font-medium">
                  {kpi.linkLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart + Team Utilization */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 kpi-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-navy-900">Revenue & Profit</h3>
              <Badge variant="secondary">Last 7 months</Badge>
            </div>
            {revenueData.length > 0 && revenueData.some((d: any) => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6c5ce7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: number, name: string) => [formatCurrency(v), name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue"
                    stroke="#6c5ce7" strokeWidth={2} fill="url(#revenue)" />
                  <Area type="monotone" dataKey="profit" name="Profit"
                    stroke="#22c55e" strokeWidth={2} fill="url(#profit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center gap-2">
                <BarChart2 className="w-8 h-8 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground text-sm">No revenue data yet.</p>
                <p className="text-xs text-muted-foreground">
                  Log time entries and create paid invoices to see your revenue chart.
                </p>
                <Link href="/time" className="text-xs text-brand-500 hover:underline font-medium mt-1">
                  Log time now →
                </Link>
              </div>
            )}
          </div>

          {/* Team Utilization */}
          <div className="kpi-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Team Utilization</h3>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            {staff.length > 0 ? (
              <div className="space-y-4">
                {staff.slice(0, 4).map((s: any) => (
                  <div key={s.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={`${s.user.firstName} ${s.user.lastName}`} size="xs" />
                        <span className="text-xs font-medium text-navy-900">
                          {s.user.firstName} {s.user.lastName.charAt(0)}.
                        </span>
                      </div>
                      <span className="text-xs font-bold text-navy-900">
                        {s.targetUtilization}%
                      </span>
                    </div>
                    <Progress value={s.targetUtilization} max={100} size="sm" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Target: {s.targetUtilization}%
                    </p>
                  </div>
                ))}
                {staff.length > 4 && (
                  <Link href="/staff" className="text-xs text-brand-500 hover:underline font-medium">
                    +{staff.length - 4} more team members →
                  </Link>
                )}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground text-sm text-center gap-2">
                <Users className="w-6 h-6 opacity-30" />
                <p>No staff yet.</p>
                <Link href="/staff" className="text-brand-500 text-xs hover:underline">
                  Add team members →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: projects.length, sub: `${activeProjects} active`, link: '/projects' },
            { label: 'Total Invoices', value: invoices.length, sub: `${invoices.filter((i: any) => i.status === 'PAID').length} paid`, link: '/money' },
            { label: 'Staff Members', value: staff.length, sub: avgHourlyRate > 0 ? `$${avgHourlyRate.toFixed(0)}/hr avg` : 'No rate set', link: '/staff' },
            { label: 'Hours This Year', value: `${totalHours.toFixed(0)}h`, sub: `${billableHours.toFixed(0)}h billable`, link: '/time' },
          ].map(stat => (
            <Link key={stat.label} href={stat.link}
              className="bg-white rounded-xl border border-border p-4 hover:shadow-md
                hover:border-brand-200 transition-all">
              <p className="text-2xl font-semibold text-navy-900">{stat.value}</p>
              <p className="text-xs font-medium text-navy-900 mt-0.5">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </Link>
          ))}
        </div>

        {/* Project Budget Health */}
        {projects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-navy-900">Project Budget Health</h2>
              <Link href="/projects" className="text-sm text-brand-500 hover:underline">
                View all projects →
              </Link>
            </div>
            <div className="grid gap-3">
              {projects.slice(0, 5).map((p: any) => {
                const pct = p.totalBudget > 0
                  ? Math.round((p.spentAmount / p.totalBudget) * 100)
                  : 0
                return (
                  <div key={p.id} className="kpi-card flex items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 text-sm truncate mb-1">{p.name}</p>
                      <Progress value={pct} size="md"
                        variant={pct >= 90 ? 'danger' : pct >= 75 ? 'warning' : 'success'} />
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-navy-900">{pct}%</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(p.spentAmount, 'USD', true)} / {formatCurrency(p.totalBudget, 'USD', true)}
                      </p>
                    </div>
                    <Link href={`/projects/${p.id}`}
                      className="flex-shrink-0 text-brand-500 hover:text-brand-600">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state — new user with no data */}
        {projects.length === 0 && staff.length === 0 && invoices.length === 0 && (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center
              justify-center mx-auto mb-4">
              <BarChart2 className="w-7 h-7 text-brand-400" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">Set up your firm to see insights</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Your dashboard will show real business metrics once you add projects, staff, and time entries.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/projects"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600
                  text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <ArrowRight className="w-4 h-4" /> Create first project
              </Link>
              <Link href="/staff"
                className="inline-flex items-center gap-2 border border-border
                  text-navy-900 px-4 py-2 rounded-lg text-sm font-medium
                  hover:bg-gray-50 transition-colors">
                <Users className="w-4 h-4" /> Add staff
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}