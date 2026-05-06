import { cn } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse rounded-lg bg-gray-200',
      className
    )} />
  )
}

// Card skeleton — for staff, contacts
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  )
}

// Row skeleton — for tables (time, invoices)
function SkeletonRow({ cols = 5 }: { cols?: number }) {
  const widths = ['w-24', 'w-32', 'w-40', 'w-20', 'w-16']
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={cn('h-4', widths[i % widths.length])} />
        </td>
      ))}
    </tr>
  )
}

// Project row skeleton
function SkeletonProjectRow() {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-5">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="w-48 flex-shrink-0 space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="text-right flex-shrink-0 space-y-1">
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-3 w-10 ml-auto" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Skeleton className="h-6 w-12 rounded" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

// KPI card skeleton — for dashboard
function SkeletonKpiCard() {
  return (
    <div className="kpi-card space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-24" />
      <div className="flex items-center gap-1">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

// Table skeleton wrapper
function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-gray-50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Page header skeleton
function SkeletonPageHeader() {
  return (
    <div className="app-topbar">
      <div className="flex items-center justify-between w-full">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  )
}

// Dashboard skeleton
function SkeletonDashboard() {
  return (
    <div>
      <div className="app-topbar">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="p-6 space-y-6">
        {/* Welcome banner */}
        <Skeleton className="h-32 w-full rounded-xl" />

        {/* KPI cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonKpiCard key={i} />
            ))}
          </div>
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 kpi-card">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          <div className="kpi-card space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonRow,
  SkeletonProjectRow,
  SkeletonKpiCard,
  SkeletonTable,
  SkeletonPageHeader,
  SkeletonDashboard,
}