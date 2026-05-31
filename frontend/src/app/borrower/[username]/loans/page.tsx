"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AppShell from '../../../../components/AppShell'
import Badge from '../../../../components/Badge'
import Button from '../../../../components/Button'
import EmptyState from '../../../../components/EmptyState'
import Modal from '../../../../components/Modal'
import Table from '../../../../components/Table'
import useRequireAuth from '../../../../hooks/useRequireAuth'
import { getBorrowerLoansByUsername } from '../../../../services/loan.service'
import useAuth from '../../../../store/useAuth'
import type { LoanRecord } from '../../../../types'

export default function BorrowerLoansPage() {
  useRequireAuth('borrower')
  const params = useParams<{ username: string }>()
  const authUser = useAuth((state) => state.user)
  const [loans, setLoans] = useState<LoanRecord[]>([])
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null)

  const routeUsername = String(params.username ?? '').toLowerCase()
  const authUsername = String(authUser?.username ?? '').toLowerCase()
  const canViewRoute = Boolean(routeUsername && authUsername && routeUsername === authUsername)

  const getLoanKey = (loan: LoanRecord) => loan.id ?? loan._id

  useEffect(() => {
    if (!canViewRoute) return
    getBorrowerLoansByUsername(routeUsername).then(setLoans).catch(() => setLoans([]))
  }, [canViewRoute, routeUsername])

  if (!canViewRoute) {
    return (
      <AppShell title="My Loans" subtitle="Track repayments and application status">
        <EmptyState title="Unauthorized route" description="Borrowers can only view their own loan route." />
      </AppShell>
    )
  }

  return (
    <AppShell title="My Loans" subtitle="Track repayments, reopen your submitted form, and view the uploaded salary slip.">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Application access</p>
              <p className="mt-1 text-sm text-slate-600">You can reopen your previously submitted application any time from this page.</p>
            </div>
            <Button type="button" onClick={() => window.location.assign('/borrower/apply')}>
              New Application
            </Button>
          </div>
        </div>

        {loans.length === 0 ? (
          <EmptyState title="No loans yet" description="You have not submitted a loan application." />
        ) : (
          <div className="grid gap-4 lg:hidden">
            {loans.map((loan) => (
              <article key={getLoanKey(loan)} className="card bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Loan amount</p>
                    <p className="text-lg font-semibold text-slate-900">{loan.loanAmount.toLocaleString()}</p>
                  </div>
                  <Badge status={loan.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500">Interest</dt>
                    <dd className="mt-1 font-medium text-slate-900">{loan.simpleInterest.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Total repayment</dt>
                    <dd className="mt-1 font-medium text-slate-900">{loan.totalRepayment.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Outstanding</dt>
                    <dd className="mt-1 font-medium text-slate-900">{loan.outstandingAmount.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Created</dt>
                    <dd className="mt-1 font-medium text-slate-900">{new Date(loan.createdAt).toLocaleDateString()}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={() => setSelectedLoan(loan)}>
                    Review form
                  </Button>
                  {loan.salarySlip?.downloadUrl && (
                    <Button type="button" variant="ghost" onClick={() => window.open(loan.salarySlip?.downloadUrl, '_blank', 'noreferrer')}>
                      Salary slip
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {loans.length > 0 && (
          <div className="hidden lg:block">
            <Table headers={['Loan Amount', 'Interest', 'Total Repayment', 'Outstanding', 'Status', 'Created Date', 'Action']}>
              {loans.map((loan) => (
                <tr key={getLoanKey(loan)} className="border-t border-slate-200">
                  <td className="py-3 font-medium text-slate-900">{loan.loanAmount.toLocaleString()}</td>
                  <td className="py-3 text-slate-600">{loan.simpleInterest.toLocaleString()}</td>
                  <td className="py-3 text-slate-600">{loan.totalRepayment.toLocaleString()}</td>
                  <td className="py-3 text-slate-600">{loan.outstandingAmount.toLocaleString()}</td>
                  <td className="py-3"><Badge status={loan.status} /></td>
                  <td className="py-3 text-slate-600">{new Date(loan.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <Button type="button" variant="ghost" onClick={() => setSelectedLoan(loan)}>
                      Review form
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </div>

      <Modal open={Boolean(selectedLoan)} onClose={() => setSelectedLoan(null)} title="Previous application review">
        {selectedLoan && (
          <div className="space-y-5 text-sm text-slate-700">
            <div className="grid gap-3 md:grid-cols-2">
              <DetailCard label="Full name" value={selectedLoan.personalDetails?.fullName ?? '-'} />
              <DetailCard label="PAN" value={selectedLoan.personalDetails?.pan ?? '-'} />
              <DetailCard label="Date of birth" value={selectedLoan.personalDetails?.dateOfBirth ? new Date(selectedLoan.personalDetails.dateOfBirth).toLocaleDateString() : '-'} />
              <DetailCard label="Age at application" value={String(selectedLoan.personalDetails?.ageAtApplication ?? '-')} />
              <DetailCard label="Monthly salary" value={formatCurrency(selectedLoan.personalDetails?.monthlySalary)} />
              <DetailCard label="Employment mode" value={selectedLoan.personalDetails?.employmentMode ?? '-'} />
              <DetailCard label="Loan amount" value={formatCurrency(selectedLoan.loanAmount)} />
              <DetailCard label="Tenure" value={`${selectedLoan.tenureDays} days`} />
              <DetailCard label="Purpose" value={selectedLoan.purpose ?? '-'} />
              <DetailCard label="Status" value={selectedLoan.status} />
              <DetailCard label="Simple interest" value={formatCurrency(selectedLoan.simpleInterest)} />
              <DetailCard label="Total repayment" value={formatCurrency(selectedLoan.totalRepayment)} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Salary slip</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{selectedLoan.salarySlip?.originalName ?? 'Uploaded document'}</p>
                  <p className="text-slate-500">{selectedLoan.salarySlip?.mimeType ?? 'Document'} · {selectedLoan.salarySlip?.size ? `${(selectedLoan.salarySlip.size / (1024 * 1024)).toFixed(2)} MB` : '-'}</p>
                </div>
                {selectedLoan.salarySlip?.downloadUrl && (
                  <Button type="button" onClick={() => window.open(selectedLoan.salarySlip?.downloadUrl, '_blank', 'noreferrer')}>
                    Open slip
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  )
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return '-'
  return value.toLocaleString()
}
