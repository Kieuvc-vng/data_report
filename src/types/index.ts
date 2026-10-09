export interface Position {
  id: string
  department: string
  businessUnit: string
  title: string
  level: string
  salary: string
  hc: number
  priority: 'P1' | 'P2' | 'P3'
  status: 'open' | 'filled' | 'closed'
  jobCode?: string
  lineManager?: {
    name: string
    email: string
  }
  pipeline: {
    cv: number
    firstInterview: number
    secondInterview: number
    offers: number
  }
  rejectReasons: {
    byStage?: {
      cv?: Record<string, number>
      firstInterview?: Record<string, number>
      secondInterview?: Record<string, number>
    }
    candidateWithdrawn: number
  }
  topIndustries?: Array<{ name: string; count: number }>
  topCompanies?: Array<{ name: string; count: number }>
  topEducationBackground?: Array<{ name: string; count: number }>
  topSource?: Array<{ name: string; count: number }>
  createdDate: string
  estimatedFillDays: number
  onboardedCount: number
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
  department: string
}

export interface HiringSummary {
  dateRange: { start: string; end: string }
  department?: string
  businessUnit?: string
  totalHired: number
  salaryRange: string
  hcTotal: number
  pipeline: { cv: number; firstInterview: number; secondInterview: number; offers: number }
  timeToFill: number
  offerAcceptanceRate: number
  offersCount: number
  onboardedCount: number
  rejectReasons: {
    byStage?: {
      cv?: Record<string, number>
      firstInterview?: Record<string, number>
      secondInterview?: Record<string, number>
      offer?: Record<string, number>
    }
    allReasons: Record<string, number>
    candidateWithdrawn: number
  }
  topIndustries?: Array<{ name: string; count: number }>
  topCompanies?: Array<{ name: string; count: number }>
  topEducationBackground?: Array<{ name: string; count: number }>
  topSource?: Array<{ name: string; count: number }>
}

export type UserRole = 'hrbp' | 'head_of_ta'

export interface User {
  name: string
  role: UserRole
  department?: string // Only for HRBP
}
