"use client"

import React, { useEffect, useState } from 'react'
import AppShell from '../../../components/AppShell'
import Button from '../../../components/Button'
import EmptyState from '../../../components/EmptyState'
import Modal from '../../../components/Modal'
import Table from '../../../components/Table'
import useRequireAuth from '../../../hooks/useRequireAuth'
import { disburseLoan, getDisbursementQueue } from '../../../services/loan.service'
import type { LoanRecord } from '../../../types'

export default function DisbursementPage() {
  useRequireAuth('disbursement')
  const [loans, setLoans] = useState<LoanRecord[]>([])
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    getDisbursementQueue().then(setLoans).catch(() => setLoans([]))
  }, [])

  const handleConfirm = async () => {
    await disburseLoan(selectedId)
    setLoans((current) => current.filter((loan) => loan._id !== selectedId))
    setSelectedId('')
  }

  return (
    <AppShell title="Disbursement" subtitle="Release approved loans to borrowers">
      {loans.length === 0 ? (
        <EmptyState title="No approved loans" description="Approved loans will be ready for disbursement here." />
      ) : (
        <div className="card bg-white p-6">
          <Table headers={['Borrower', 'PAN', 'Amount', 'Tenure', 'Actions']}>
            {loans.map((loan) => (
              <tr key={loan._id} className="border-t border-slate-200">
                <td className="py-3 font-medium text-slate-900">{loan.personalDetails.fullName}</td>
                <td className="py-3 text-slate-600">{loan.personalDetails.pan}</td>
                <td className="py-3 text-slate-600">{loan.loanAmount.toLocaleString()}</td>
                <td className="py-3 text-slate-600">{loan.tenureDays} days</td>
                <td className="py-3">
                  <Button type="button" onClick={() => setSelectedId(loan._id)}>
                    Mark as disbursed
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Modal open={Boolean(selectedId)} onClose={() => setSelectedId('')} title="Confirm disbursement">
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-600">This will mark the selected loan as disbursed.</p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setSelectedId('')}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}
