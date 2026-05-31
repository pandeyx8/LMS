import api from '../lib/axios'
import { unwrapResponse } from '../lib/api'
import type { LoanRecord, OverviewStats, RejectValues, SalesLead } from '../types'

export async function applyLoan(formData: FormData): Promise<LoanRecord> {
  const response = await api.post('/loans/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return unwrapResponse<{ loan: LoanRecord }>(response).loan
}

export async function getMyLoans(): Promise<LoanRecord[]> {
  const response = await api.get('/loans/my')
  return unwrapResponse<LoanRecord[]>(response)
}

export async function getBorrowerLoansByUsername(username: string): Promise<LoanRecord[]> {
  const response = await api.get(`/loans/borrower/${encodeURIComponent(username)}`)
  return unwrapResponse<LoanRecord[]>(response)
}

export async function getSanctionQueue(): Promise<LoanRecord[]> {
  const response = await api.get('/loans/sanction/queue')
  return unwrapResponse<LoanRecord[]>(response)
}

export async function getDisbursementQueue(): Promise<LoanRecord[]> {
  const response = await api.get('/loans/disbursement/queue')
  return unwrapResponse<LoanRecord[]>(response)
}

export async function getCollectionQueue(): Promise<LoanRecord[]> {
  const response = await api.get('/loans/collection/queue')
  return unwrapResponse<LoanRecord[]>(response)
}

export async function getAdminOverview(): Promise<OverviewStats> {
  const response = await api.get('/loans/admin/overview')
  return unwrapResponse<OverviewStats>(response)
}

export async function getSalesLeads(): Promise<SalesLead[]> {
  const response = await api.get('/loans/sales/leads')
  return unwrapResponse<SalesLead[]>(response)
}

export async function approveLoan(id: string, sanctionRemark?: string): Promise<LoanRecord> {
  const response = await api.post(`/loans/${id}/approve`, sanctionRemark ? { sanctionRemark } : {})
  return unwrapResponse<LoanRecord>(response)
}

export async function rejectLoan(id: string, payload: RejectValues): Promise<LoanRecord> {
  const response = await api.post(`/loans/${id}/reject`, payload)
  return unwrapResponse<LoanRecord>(response)
}

export async function disburseLoan(id: string): Promise<LoanRecord> {
  const response = await api.post(`/loans/${id}/disburse`)
  return unwrapResponse<LoanRecord>(response)
}
