"use client"

import React, { useEffect, useState } from 'react'
import AppShell from '../../../components/AppShell'
import Button from '../../../components/Button'
import EmptyState from '../../../components/EmptyState'
import Modal from '../../../components/Modal'
import Table from '../../../components/Table'
import useRequireAuth from '../../../hooks/useRequireAuth'
import { getSalesLeads } from '../../../services/loan.service'
import type { SalesLead } from '../../../types'

export default function SalesPage() {
  useRequireAuth('sales')
  const [leads, setLeads] = useState<SalesLead[]>([])
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null)

  useEffect(() => {
    getSalesLeads().then(setLeads).catch(() => setLeads([]))
  }, [])

  return (
    <AppShell title="Sales Dashboard" subtitle="Registered users who have not applied for a loan yet">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Sales dashboard</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">Total Leads: {leads.length}</p>
          <p className="mt-1 text-sm text-slate-600">These are borrowers who registered but have not submitted any loan application yet.</p>
        </div>

        {leads.length === 0 ? (
          <EmptyState title="No sales leads" description="Users who register but do not apply will appear here." />
        ) : (
          <div className="card bg-white p-6">
            <Table headers={['Name', 'Email', 'Registered On', 'Action']}>
              {leads.map((lead) => (
                <tr key={lead._id} className="border-t border-slate-200">
                  <td className="py-3 font-medium text-slate-900">{lead.fullname}</td>
                  <td className="py-3 text-slate-600">{lead.email}</td>
                  <td className="py-3 text-slate-600">{formatDate(lead.createdAt)}</td>
                  <td className="py-3">
                    <Button type="button" variant="ghost" onClick={() => setSelectedLead(lead)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title={selectedLead ? `Lead details - ${selectedLead.fullname}` : 'Lead details'}
      >
        {selectedLead && (
          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard label="Name" value={selectedLead.fullname} />
            <DetailCard label="Email" value={selectedLead.email} />
            <DetailCard label="Username" value={selectedLead.username} />
            <DetailCard label="Registered On" value={formatDate(selectedLead.createdAt)} />
          </div>
        )}
      </Modal>
    </AppShell>
  )
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString()
}