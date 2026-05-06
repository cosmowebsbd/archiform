import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ── Tailwind class merger ──────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Currency formatter ────────────────────────────────────
export function formatCurrency(
  amount: number,
  currency = 'USD',
  compact = false
): string {
  if (compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Number formatter ──────────────────────────────────────
export function formatNumber(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n)
  }
  return new Intl.NumberFormat('en-US').format(n)
}

// ── Percentage formatter ──────────────────────────────────
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`
}

// ── Date formatter ────────────────────────────────────────
export function formatDate(
  date: string | Date,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const formats = {
    short: { month: '2-digit' as const, day: '2-digit' as const, year: '2-digit' as const },
    medium: { month: 'short' as const, day: 'numeric' as const, year: 'numeric' as const },
    long: { month: 'long' as const, day: 'numeric' as const, year: 'numeric' as const },
  }
  return new Intl.DateTimeFormat('en-US', formats[format]).format(d)
}

// ── Hours formatter ───────────────────────────────────────
export function formatHours(hours: number): string {
  if (hours === 1) return '1 hr'
  if (hours < 10) return `${hours.toFixed(1)} hrs`
  return `${Math.round(hours)} hrs`
}

// ── Budget progress ───────────────────────────────────────
export function getBudgetPercent(spent: number, budget: number): number {
  if (budget === 0) return 0
  return Math.min(Math.round((spent / budget) * 100), 100)
}

export function getBudgetStatus(spent: number, budget: number): 'good' | 'warning' | 'danger' {
  const pct = getBudgetPercent(spent, budget)
  if (pct >= 90) return 'danger'
  if (pct >= 75) return 'warning'
  return 'good'
}

// ── Initials ──────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ── Status color map ──────────────────────────────────────
export const projectStatusConfig = {
  DRAFT:     { label: 'Draft',     color: 'text-gray-500',   bg: 'bg-gray-100' },
  ACTIVE:    { label: 'Active',    color: 'text-green-700',  bg: 'bg-green-100' },
  ON_HOLD:   { label: 'On Hold',   color: 'text-yellow-700', bg: 'bg-yellow-100' },
  COMPLETED: { label: 'Completed', color: 'text-blue-700',   bg: 'bg-blue-100' },
  ARCHIVED:  { label: 'Archived',  color: 'text-gray-400',   bg: 'bg-gray-50' },
} as const

export const invoiceStatusConfig = {
  DRAFT:     { label: 'Draft',     color: 'text-gray-500',    bg: 'bg-gray-100' },
  SENT:      { label: 'Sent',      color: 'text-blue-700',    bg: 'bg-blue-100' },
  VIEWED:    { label: 'Viewed',    color: 'text-purple-700',  bg: 'bg-purple-100' },
  PAID:      { label: 'Paid',      color: 'text-green-700',   bg: 'bg-green-100' },
  OVERDUE:   { label: 'Overdue',   color: 'text-red-700',     bg: 'bg-red-100' },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-400',    bg: 'bg-gray-50' },
} as const

// ── Debounce ──────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// ── Local storage helpers ─────────────────────────────────
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn('localStorage.setItem failed')
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },
}
