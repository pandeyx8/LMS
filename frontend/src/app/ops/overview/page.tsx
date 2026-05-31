"use client"

import React, { useEffect, useMemo, useState } from 'react'
import AppShell from '../../../components/AppShell'
import EmptyState from '../../../components/EmptyState'
import Table from '../../../components/Table'
import useRequireAuth from '../../../hooks/useRequireAuth'
import { getAdminOverview } from '../../../services/loan.service'
import type { LoanStatus, OverviewStats } from '../../../types'

export default function OverviewPage() {
  useRequireAuth('admin')
  const [overview, setOverview] = useState<OverviewStats | null>(null)

  useEffect(() => {
    getAdminOverview().then(setOverview).catch(() => setOverview(null))
  }, [])

  const statusCountMap = useMemo(() => {
    const map: Record<LoanStatus, number> = {
      applied: 0,
      approved: 0,
      rejected: 0,
      disbursed: 0,
      closed: 0
    }

    overview?.statusCounts.forEach((item) => {
      map[item._id] = item.count
    })

    return map
  }, [overview])

  return (
    <AppShell title="Overview" subtitle="Portfolio snapshot and recent applications">
      {!overview ? (
        <EmptyState title="No dashboard data" description="The backend has not returned overview data yet." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Loans" value={overview.totalLoans} />
            <SummaryCard label="Applied" value={statusCountMap.applied} />
            <SummaryCard label="Approved" value={statusCountMap.approved} />
            <SummaryCard label="Disbursed" value={statusCountMap.disbursed} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Closed" value={statusCountMap.closed} />
            <SummaryCard label="Borrowers" value={overview.totalBorrowers} />
            <SummaryCard label="Users" value={overview.totalUsers} />
            <SummaryCard label="Rejected" value={statusCountMap.rejected} />
          </div>

          <section className="card bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
                <p className="text-sm text-slate-500">Latest loan submissions from the backend.</p>
              </div>
            </div>

            {overview.recentApplications.length === 0 ? (
              <EmptyState title="No recent applications" />
            ) : (
              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 lg:block">
                <Table headers={['Borrower', 'PAN', 'Loan Amount', 'Tenure', 'Status']}>
                  {overview.recentApplications.map((loan) => (
                    <tr key={loan._id} className="border-t border-slate-200">
                      <td className="py-3 font-medium text-slate-900">{loan.personalDetails.fullName}</td>
                      <td className="py-3 text-slate-600">{loan.personalDetails.pan}</td>
                      <td className="py-3 text-slate-600">{loan.loanAmount.toLocaleString()}</td>
                      <td className="py-3 text-slate-600">{loan.tenureDays} days</td>
                      <td className="py-3 text-slate-600">{loan.status}</td>
                    </tr>
                  ))}
                </Table>
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  )
}
