"use client"

import React, { useEffect, useState } from 'react'
import AppShell from '../../../components/AppShell'
import Button from '../../../components/Button'
import EmptyState from '../../../components/EmptyState'
import Input from '../../../components/Input'
import Modal from '../../../components/Modal'
import Table from '../../../components/Table'
import useRequireAuth from '../../../hooks/useRequireAuth'
import { getCollectionQueue } from '../../../services/loan.service'
import { getLoanPayments, recordPayment } from '../../../services/payment.service'
import type { LoanRecord, PaymentRecord, PaymentValues } from '../../../types'

export default function CollectionPage() {
  useRequireAuth('collection')
  const [loans, setLoans] = useState<LoanRecord[]>([])
  const [selectedViewId, setSelectedViewId] = useState('')
  const [selectedPaymentId, setSelectedPaymentId] = useState('')
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [formValues, setFormValues] = useState<PaymentValues>({ utr: '', amount: 0, paidAt: '' })
  const [apiError, setApiError] = useState('')
  const [loadingPayments, setLoadingPayments] = useState(false)

  const closeViewModal = () => {
    setSelectedViewId('')
    setSelectedLoan(null)
    setPayments([])
    setApiError('')
  }

  const closePaymentModal = () => {
    setSelectedPaymentId('')
    setFormValues({ utr: '', amount: 0, paidAt: '' })
    setApiError('')
  }

  const openViewModal = (loan: LoanRecord) => {
    setSelectedLoan(loan)
    setSelectedViewId(loan._id)
    setLoadingPayments(true)
    setApiError('')

    getLoanPayments(loan._id)
      .then((response) => {
        setSelectedLoan(response.loan as LoanRecord)
        setPayments(response.payments)
      })
      .catch(() => {
        setPayments([])
      })
      .finally(() => setLoadingPayments(false))
  }

  const handleAmountChange = (value: string) => {
  const amount = parseFloat(value)

  setFormValues((current) => ({
    ...current,
    amount: Number.isNaN(amount) ? 0 : amount,
  }))
}

  useEffect(() => {
    getCollectionQueue().then(setLoans).catch(() => setLoans([]))
  }, [])

  const handleSubmit = async () => {
    try {
      setApiError('')
      if (!formValues.utr.trim()) {
        setApiError('UTR number is required')
        return
      }
      if (!formValues.amount || formValues.amount <= 0) {
        setApiError('Amount is required')
        return
      }
      if (!formValues.paidAt) {
        setApiError('Payment date is required')
        return
      }

      await recordPayment(selectedPaymentId, formValues)
      const refreshed = await getLoanPayments(selectedPaymentId)
      setSelectedLoan(refreshed.loan as LoanRecord)
      if (selectedViewId === selectedPaymentId) {
        setPayments(refreshed.payments)
      }
      setLoans((current) =>
        current.map((loan) =>
          loan._id === selectedPaymentId
            ? {
                ...loan,
                totalPaidAmount: (refreshed.loan as LoanRecord).totalPaidAmount,
                outstandingAmount: (refreshed.loan as LoanRecord).outstandingAmount,
                status: (refreshed.loan as LoanRecord).status,
                collectionStatus: (refreshed.loan as LoanRecord).collectionStatus,
              }
            : loan
        )
      )
      setFormValues({ utr: '', amount: 0, paidAt: '' })
      closePaymentModal()
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to record payment')
    }
  }

  return (
    <AppShell title="Collection" subtitle="Record repayments on disbursed loans">
      {loans.length === 0 ? (
        <EmptyState title="No disbursed loans" description="Loans ready for collection will appear here." />
      ) : (
        <div className="card bg-white p-6">
          <Table headers={['Borrower Name', 'Loan Amount', 'Paid Till Now', 'Outstanding', 'Action']}>
            {loans.map((loan) => (
              <tr key={loan._id} className="border-t border-slate-200">
                <td className="py-3 font-medium text-slate-900">{loan.personalDetails.fullName}</td>
                <td className="py-3 text-slate-600">{loan.loanAmount.toLocaleString()}</td>
                <td className="py-3 text-slate-600">{loan.totalPaidAmount.toLocaleString()}</td>
                <td className="py-3 text-slate-600">{loan.outstandingAmount.toLocaleString()}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="ghost" onClick={() => openViewModal(loan)}>
                      View
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setFormValues({ utr: '', amount: 0, paidAt: '' })
                        setApiError('')
                        setSelectedLoan(loan)
                        setSelectedPaymentId(loan._id)
                      }}
                    >
                      Add Payment
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Modal open={Boolean(selectedViewId)} onClose={closeViewModal} title={selectedLoan ? `Loan details - ${selectedLoan.personalDetails.fullName}` : 'Loan details'}>
        {selectedLoan && (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Borrower Name" value={selectedLoan.personalDetails.fullName} />
              <SummaryCard label="Loan Amount" value={formatCurrency(selectedLoan.loanAmount)} />
              <SummaryCard label="Total Repayment" value={formatCurrency(selectedLoan.totalRepayment)} />
              <SummaryCard label="Paid Till Now" value={formatCurrency(selectedLoan.totalPaidAmount)} />
              <SummaryCard label="Outstanding" value={formatCurrency(selectedLoan.outstandingAmount)} />
              <SummaryCard label="Status" value={selectedLoan.status.toUpperCase()} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Payment history</p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-4 font-medium">UTR</th>
                      <th className="py-2 pr-4 font-medium">Amount</th>
                      <th className="py-2 pr-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingPayments ? (
                      <tr>
                        <td className="py-4 text-slate-500" colSpan={3}>Loading payment history...</td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td className="py-4 text-slate-500" colSpan={3}>No payment history yet.</td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment._id} className="border-b border-slate-200 last:border-0">
                          <td className="py-3 pr-4 text-slate-700">{payment.utr}</td>
                          <td className="py-3 pr-4 text-slate-700">{formatCurrency(payment.amount)}</td>
                          <td className="py-3 pr-4 text-slate-700">{formatDate(payment.paidAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(selectedPaymentId)} onClose={closePaymentModal} title={selectedLoan ? `Add payment - ${selectedLoan.personalDetails.fullName}` : 'Add payment'}>
        {selectedLoan && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard label="Borrower Name" value={selectedLoan.personalDetails.fullName} />
                <SummaryCard label="Total Repayment" value={formatCurrency(selectedLoan.totalRepayment)} />
                <SummaryCard label="Outstanding" value={formatCurrency(selectedLoan.outstandingAmount)} />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Outstanding amount is calculated as Total Repayment - Total Paid.
              </p>
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-4">
              <Input label="UTR Number" value={formValues.utr} onChange={(event) => setFormValues((current) => ({ ...current, utr: event.target.value }))} />
              <Input
                label="Amount"
                type="number"
                min={.01}
                step={.01}
                value={formValues.amount === 0 ? '' : String(formValues.amount)}
                onChange={(event) => handleAmountChange(event.target.value)}
              />
              <Input label="Payment Date" type="date" value={formValues.paidAt} onChange={(event) => setFormValues((current) => ({ ...current, paidAt: event.target.value }))} />

              {apiError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{apiError}</div>}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={closePaymentModal}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSubmit}>
                  Add Payment
                </Button>
              </div>
            </section>
          </div>
        )}
      </Modal>
    </AppShell>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString()}`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString()
}
