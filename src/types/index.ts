export interface Position {
  id: string
  team: 'PEN' | 'GDS' | 'GIO' | 'PRO' | 'PIN'
  title: string
  level: string
  salary: string
  hc: number
  priority: 'P1' | 'P2' | 'P3'
  status: 'open' | 'filled' | 'closed'
  pipeline: {
    cv: number
    firstInterview: number
    secondInterview: number
    offers: number
  }
  rejectReasons: {
    notFitSkills: number
    lowExp: number
    salaryMismatch: number
    other: number
  }
  createdDate: string
  estimatedFillDays: number
}

export interface Candidate {
  id: string
  name: string
  previousCompany: string
  industry: string
  education: string
  salary: string
  hireDate: string
  position: string
  team: string
}

export interface HiringSummary {
  dateRange: { start: string; end: string }
  team?: string
  totalHired: number
  salaryRange: string
  hcTotal: number
  pipeline: { cv: number; itv: number; offers: number }
  rejectReasons: Record<string, number>
  levelDistribution: Record<string, number>
  byTeam: Record<string, number>
  aiInsight: string
}

export type UserRole = 'hrbp' | 'head_of_ta'

export interface User {
  name: string
  role: UserRole
  team?: string // Only for HRBP
}
