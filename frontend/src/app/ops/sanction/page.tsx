"use client"

import React, { useEffect, useState } from 'react'
import AppShell from '../../../components/AppShell'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'
import EmptyState from '../../../components/EmptyState'
import Modal from '../../../components/Modal'
import Table from '../../../components/Table'
import Textarea from '../../../components/Textarea'
import useRequireAuth from '../../../hooks/useRequireAuth'
import { approveLoan, getSanctionQueue, rejectLoan } from '../../../services/loan.service'
import type { LoanRecord } from '../../../types'

export default function SanctionPage() {
  useRequireAuth('sanction')
  const [applications, setApplications] = useState<LoanRecord[]>([])
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    getSanctionQueue().then(setApplications).catch(() => setApplications([]))
  }, [])

  const handleReject = async () => {
    try {
      if (!rejectReason.trim()) {
        setApiError('Rejection reason is required')
        return
      }

      if (!selectedLoan) return

      await rejectLoan(selectedLoan._id, { rejectionReason: rejectReason.trim() })
      setApplications((current) => current.filter((loan) => loan._id !== selectedLoan._id))
      setSelectedLoan(null)
      setRejectReason('')
      setApiError('')
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to reject loan')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveLoan(id)
      setApplications((current) => current.filter((loan) => loan._id !== id))
      setSelectedLoan((current) => (current?._id === id ? null : current))
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to approve loan')
    }
  }

  const salarySlipUrl = selectedLoan ? `/api/v1/loans/${selectedLoan._id}/salary-slip` : ''

  return (
    <AppShell title="Sanction" subtitle="Review applied loans and make credit decisions">
      <div className="space-y-6">
        {applications.length === 0 ? (
          <EmptyState title="No applied loans" description="Applications ready for sanction will appear here." />
        ) : (
          <div className="card bg-white p-6">
            <Table headers={['Borrower', 'PAN', 'Loan Amount', 'Tenure', 'Status', 'Actions']}>
              {applications.map((loan) => (
                <tr key={loan._id} className="border-t border-slate-200">
                  <td className="py-3 font-medium text-slate-900">{loan.personalDetails.fullName}</td>
                  <td className="py-3 text-slate-600">{loan.personalDetails.pan}</td>
                  <td className="py-3 text-slate-600">{loan.loanAmount.toLocaleString()}</td>
                  <td className="py-3 text-slate-600">{loan.tenureDays} days</td>
                  <td className="py-3"><Badge status={loan.status} /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" onClick={() => setSelectedLoan(loan)}>
                        View details
                      </Button>
                      <Button type="button" onClick={() => handleApprove(loan._id)}>
                        Approve
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setSelectedLoan(loan)}>
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </div>

      <Modal open={Boolean(selectedLoan)} onClose={() => setSelectedLoan(null)} title={selectedLoan ? `Application details - ${selectedLoan.personalDetails.fullName}` : 'Application details'}>
        {selectedLoan && (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2">
              <DetailCard label="Full Name" value={selectedLoan.personalDetails.fullName} />
              <DetailCard label="PAN" value={selectedLoan.personalDetails.pan} />
              <DetailCard label="Date of Birth" value={new Date(selectedLoan.personalDetails.dateOfBirth).toLocaleDateString()} />
              <DetailCard label="Age" value={`${selectedLoan.personalDetails.ageAtApplication} years`} />
              <DetailCard label="Monthly Salary" value={selectedLoan.personalDetails.monthlySalary.toLocaleString()} />
              <DetailCard label="Employment Mode" value={selectedLoan.personalDetails.employmentMode} />
              <DetailCard label="Loan Amount" value={selectedLoan.loanAmount.toLocaleString()} />
              <DetailCard label="Tenure" value={`${selectedLoan.tenureDays} days`} />
              <DetailCard label="Purpose" value={selectedLoan.purpose} />
              <DetailCard label="Interest" value={selectedLoan.simpleInterest.toLocaleString()} />
              <DetailCard label="Total Repayment" value={selectedLoan.totalRepayment.toLocaleString()} />
              <DetailCard label="Outstanding" value={selectedLoan.outstandingAmount.toLocaleString()} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Salary slip</p>
                  <p className="mt-1 text-sm text-slate-600">Open the uploaded document in a new tab before sanctioning.</p>
                </div>
                <a
                  href={salarySlipUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1b347a]"
                >
                  View salary slip
                </a>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <DetailCard label="File name" value={selectedLoan.salarySlip?.originalName ?? 'Uploaded file'} />
                <DetailCard label="File type" value={selectedLoan.salarySlip?.mimeType ?? 'Document'} />
                <DetailCard label="File size" value={selectedLoan.salarySlip?.size ? `${(selectedLoan.salarySlip.size / (1024 * 1024)).toFixed(2)} MB` : '-'} />
                <DetailCard label="Created at" value={new Date(selectedLoan.createdAt).toLocaleString()} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">BRE validation</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <DetailCard label="Age rule" value={selectedLoan.personalDetails.ageAtApplication >= 23 && selectedLoan.personalDetails.ageAtApplication <= 50 ? 'Pass' : 'Fail'} />
                <DetailCard label="PAN rule" value={/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(selectedLoan.personalDetails.pan) ? 'Pass' : 'Fail'} />
                <DetailCard label="Salary rule" value={selectedLoan.personalDetails.monthlySalary >= 25000 ? 'Pass' : 'Fail'} />
                <DetailCard label="Employment rule" value={selectedLoan.personalDetails.employmentMode !== 'unemployed' ? 'Pass' : 'Fail'} />
              </div>
            </section>

            {apiError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{apiError}</div>}

            <div className="space-y-4 border-t border-slate-200 pt-4">
              <Textarea
                label="Rejection reason"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Explain why this loan is being rejected"
              />

              <div className="flex flex-wrap justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setSelectedLoan(null)}>
                  Close
                </Button>
                <Button type="button" variant="ghost" onClick={() => selectedLoan && handleReject()}>
                  Reject
                </Button>
                <Button type="button" onClick={() => selectedLoan && handleApprove(selectedLoan._id)}>
                  Approve
                </Button>
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
