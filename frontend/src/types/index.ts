export type Role = 'admin' | 'sales' | 'sanction' | 'disbursement' | 'collection' | 'borrower'

export type LoanStatus = 'applied' | 'approved' | 'rejected' | 'disbursed' | 'closed'

export type CollectionStatus = 'pending' | 'ongoing' | 'completed' | 'defaulted'

export interface User {
  _id: string
  username: string
  fullname: string
  email: string
  role: Role
  createdAt?: string
  updatedAt?: string
}

export interface LoginPayload {
  email?: string
  username?: string
  password: string
}

export interface RegisterPayload {
  username: string
  fullname: string
  email: string
  password: string
}

export interface AuthSession {
  user: User
  accessToken: string
}

export interface ApiResponse<T> {
  statusCode: number
  success: boolean
  message: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Array<{ msg?: string; [key: string]: unknown }>
}

export interface AuthResponse extends ApiResponse<AuthSession> {}

export interface SalarySlip {
  originalName: string
  size: number
  mimeType: string
  downloadUrl: string
}

export interface LoanBorrowerSummary {
  _id: string
  username: string
  fullname: string
  email: string
}

export interface SalesLead {
  _id: string
  username: string
  fullname: string
  email: string
  createdAt: string
}

export interface LoanDetails {
  fullName: string
  pan: string
  dateOfBirth: string
  monthlySalary: number
  employmentMode: 'salaried' | 'self-employed' | 'unemployed'
  ageAtApplication: number
}

export interface LoanRecord {
  id?: string
  _id: string
  borrower?: LoanBorrowerSummary | string
  createdBy?: LoanBorrowerSummary | string
  loanAmount: number
  tenureDays: number
  interestRate: number
  simpleInterest: number
  totalRepayment: number
  totalPaidAmount: number
  outstandingAmount: number
  purpose: string
  personalDetails: LoanDetails
  salarySlip: SalarySlip
  status: LoanStatus
  collectionStatus: CollectionStatus
  rejectionReason?: string
  sanctionRemark?: string
  sanctionedBy?: LoanBorrowerSummary | string
  sanctionedAt?: string
  disbursedBy?: LoanBorrowerSummary | string
  disbursedAt?: string
  createdAt: string
  updatedAt: string
}

export interface OverviewStats {
  totalUsers: number
  totalBorrowers: number
  totalLoans: number
  statusCounts: Array<{ _id: LoanStatus; count: number }>
  recentApplications: LoanRecord[]
}

export interface PaymentRecord {
  _id: string
  loan: string | LoanRecord
  borrower: string | LoanBorrowerSummary
  amount: number
  utr: string
  paidAt: string
  recordedBy?: string | LoanBorrowerSummary
  createdAt: string
  updatedAt: string
}

export interface LoanApplyValues {
  fullName: string
  pan: string
  dateOfBirth: string
  monthlySalary: number
  employmentMode: 'salaried' | 'self-employed' | 'unemployed'
  loanAmount: number
  tenureDays: number
  purpose: string
  salarySlip: FileList
}

export interface PaymentValues {
  utr: string
  amount: number
  paidAt: string
}

export interface RejectValues {
  rejectionReason: string
}
