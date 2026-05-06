'use client'

import React, { useState, useEffect } from 'react'
import { gql } from '@apollo/client'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { apolloClient } from '@/lib/apollo-client'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, Users, DollarSign, Clock, FileText } from 'lucide-react'
import { SkeletonKpiCard } from '@/components/ui/skeleton'
const ANALYTICS_QUERY = gql`
  query {
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
    projects { id name status totalBudget spentAmount }
    staff { id targetUtilization user { firstName lastName } }
    invoices { id status total issueDate }
    timeEntries(from: "2024-01-01", to: "2027-01-01") {
      id hours isBillable entryDate
    }
  }
`

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apolloClient.query({ query: ANALYTICS_QUERY, fetchPolicy: 'network-only' })
      .then(r => { setData(r.data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  if (loading) return (
  <div>
    <div className="app-topbar">
      <h1 className="text-lg font-semibold text-navy-900">Analytics</h1>
    </div>
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />
      </div>
    </div>
  </div>
)

  const metrics = data?.dashboard
  const projects = data?.projects || []
  const staff = data?.staff || []
  const invoices = data?.invoices || []
  const timeEntries = data?.timeEntries || []
  const revenueData = metrics?.revenueByMonth || []

  const totalHours = timeEntries.reduce((s: number, e: any) => s + e.hours, 0)
  const billableHours = timeEntries.filter((e: any) => e.isBillable).reduce((s: number, e: any) => s + e.hours, 0)
  const billableRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0
  const totalInvoiced = invoices.reduce((s: number, i: any) => s + i.total, 0)
  const paidInvoices = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + i.total, 0)
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length

  const kpis = [
    { label: 'Total Hours Logged', value: `${totalHours.toFixed(1)}h`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Billable Rate', value: `${billableRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Invoiced', value: formatCurrency(totalInvoiced), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Amount Collected', value: formatCurrency(paidInvoices), icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Active Projects', value: String(activeProjects), icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Team Size', value: String(staff.length), icon: Users, color: 'text-navy-600', bg: 'bg-navy-50' },
  ]

  const projectBudgetData = projects.map((p: any) => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    budget: p.totalBudget,
    spent: p.spentAmount,
  }))

  const invoiceStatusData = [
    { name: 'Draft', value: invoices.filter((i: any) => i.status === 'DRAFT').length },
    { name: 'Sent', value: invoices.filter((i: any) => i.status === 'SENT').length },
    { name: 'Paid', value: invoices.filter((i: any) => i.status === 'PAID').length },
    { name: 'Overdue', value: invoices.filter((i: any) => i.status === 'OVERDUE').length },
  ].filter(d => d.value > 0)

  return (
    <div>
      <div className="app-topbar">
        <h1 className="text-lg font-semibold text-navy-900">Analytics</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl border border-border p-4">
              <div className={`w-8 h-8 ${kpi.bg} rounded-lg flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-semibold text-navy-900">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        {revenueData.length > 0 && (
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-navy-900 mb-6">Revenue vs Expenses vs Profit</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e17055" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e17055" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number, name: string) => [formatCurrency(v), name]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6c5ce7" strokeWidth={2} fill="url(#rev)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#e17055" strokeWidth={2} fill="url(#exp)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#22c55e" strokeWidth={2} fill="url(#prof)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Project Budget */}
          {projectBudgetData.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-navy-900 mb-6">Project Budget vs Spent</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={projectBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                    tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#6c5ce7" radius={[4,4,0,0]} />
                  <Bar dataKey="spent" name="Spent" fill="#22c55e" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Team Utilization */}
          {staff.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-navy-900 mb-6">Team Target Utilization</h2>
              <div className="space-y-4">
                {staff.map((s: any) => (
                  <div key={s.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-navy-900">
                        {s.user.firstName} {s.user.lastName}
                      </span>
                      <span className="text-muted-foreground">{s.targetUtilization}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${s.targetUtilization >= 90 ? 'bg-orange-400' : 'bg-brand-500'}`}
                        style={{ width: `${Math.min(s.targetUtilization, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Invoice Summary */}
        {invoices.length > 0 && (
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-navy-900 mb-4">Invoice Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Invoices', value: invoices.length, color: 'text-navy-900' },
                { label: 'Paid', value: invoices.filter((i: any) => i.status === 'PAID').length, color: 'text-green-600' },
                { label: 'Outstanding', value: invoices.filter((i: any) => ['SENT','VIEWED'].includes(i.status)).length, color: 'text-orange-600' },
                { label: 'Overdue', value: invoices.filter((i: any) => i.status === 'OVERDUE').length, color: 'text-red-600' },
              ].map(item => (
                <div key={item.label} className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className={`text-3xl font-semibold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}