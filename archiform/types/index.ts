// ── User & Auth ──────────────────────────────────────────
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  role: UserRole
  firmId: string
  createdAt: string
}

export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER'

// ── Firm / Organization ────────────────────────────────────
export interface Firm {
  id: string
  name: string
  logoUrl?: string
  industry: Industry
  employeeCount: number
  location: string
  plan: Plan
  trialEndsAt?: string
  createdAt: string
}

export type Industry = 
  | 'ARCHITECTURE'
  | 'ENGINEERING'
  | 'INTERIOR_DESIGN'
  | 'LANDSCAPE'
  | 'URBAN_PLANNING'
  | 'NOT_LISTED'

export type Plan = 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'

// ── Project ───────────────────────────────────────────────
export interface Project {
  id: string
  firmId: string
  name: string
  clientId?: string
  client?: Client
  status: ProjectStatus
  category?: string
  totalBudget: number
  spentAmount: number
  phases: Phase[]
  staffAssignments: StaffAssignment[]
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'

export interface Phase {
  id: string
  projectId: string
  name: string
  budgetHours: number
  loggedHours: number
  budgetAmount: number
  spentAmount: number
  status: PhaseStatus
  startDate?: string
  endDate?: string
  order: number
}

export type PhaseStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

// ── Staff ─────────────────────────────────────────────────
export interface StaffMember {
  id: string
  firmId: string
  userId: string
  user: User
  title: string
  department?: string
  hourlyRate: number
  targetUtilization: number
  currentUtilization?: number
  assignments: StaffAssignment[]
  isActive: boolean
}

export interface StaffAssignment {
  id: string
  staffId: string
  staff?: StaffMember
  projectId: string
  project?: Project
  phaseId?: string
  allocatedHours: number
  startDate: string
  endDate: string
}

// ── Time ──────────────────────────────────────────────────
export interface TimeEntry {
  id: string
  staffId: string
  staff?: StaffMember
  projectId: string
  project?: Project
  phaseId?: string
  phase?: Phase
  date: string
  hours: number
  description?: string
  isBillable: boolean
  createdAt: string
}

// ── Money / Invoicing ─────────────────────────────────────
export interface Invoice {
  id: string
  firmId: string
  projectId: string
  project?: Project
  clientId: string
  client?: Client
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  lineItems: LineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  paidAt?: string
  notes?: string
  createdAt: string
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  isBillable: boolean
}

// ── Client / Contact ──────────────────────────────────────
export interface Client {
  id: string
  firmId: string
  name: string
  email?: string
  phone?: string
  company?: string
  address?: Address
  projects?: Project[]
  createdAt: string
}

export interface Address {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

// ── Analytics ─────────────────────────────────────────────
export interface DashboardMetrics {
  estimatedOperatingProfit: number | null
  utilizationRate: number | null
  projectedOperatingProfit: number | null
  projectedFirmCapacity: number | null
  revenueByMonth: MonthlyRevenue[]
  topProjects: ProjectSummary[]
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export interface ProjectSummary {
  id: string
  name: string
  budget: number
  spent: number
  percentComplete: number
}

// ── Onboarding / Forms ────────────────────────────────────
export interface OnboardingStep1 {
  email: string
}

export interface OnboardingStep2 {
  email: string
  firstName: string
  howDidYouHear: HearAboutUs
  companyName: string
  numberOfEmployees: number
  industry: Industry
  location: string
}

export type HearAboutUs =
  | 'FRIEND'
  | 'GOOGLE'
  | 'LINKEDIN'
  | 'CONFERENCE'
  | 'PUBLICATION'
  | 'SOCIAL_MEDIA'
  | 'OTHER'

export interface CreateAccountForm {
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

// ── Navigation ────────────────────────────────────────────
export interface NavItem {
  label: string
  href: string
  icon?: string
  badge?: string
  children?: NavItem[]
}

// ── API Responses ─────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ── Filter / Sort ─────────────────────────────────────────
export interface ProjectFilters {
  statuses?: ProjectStatus[]
  assignment?: string
  categories?: string[]
  clientIds?: string[]
  activePhases?: boolean
  sortBy?: 'alphabetical' | 'date' | 'budget' | 'status'
  sortOrder?: 'asc' | 'desc'
}
