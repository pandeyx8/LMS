import api from '../lib/axios'
import { unwrapResponse } from '../lib/api'
import type { PaymentRecord, PaymentValues } from '../types'

export async function recordPayment(loanId: string, payload: PaymentValues): Promise<PaymentRecord> {
  const response = await api.post(`/loans/${loanId}/payments`, payload)
  return unwrapResponse<{ payment: PaymentRecord }>(response).payment
}

export async function getLoanPayments(loanId: string): Promise<{ loan: unknown; payments: PaymentRecord[] }> {
  const response = await api.get(`/loans/${loanId}/payments`)
  return unwrapResponse<{ loan: unknown; payments: PaymentRecord[] }>(response)
}
