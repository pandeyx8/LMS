import React from 'react'

export type Status = 'applied' | 'approved' | 'rejected' | 'disbursed' | 'closed'

const colorMap: Record<Status, string> = {
  applied: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  disbursed: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  closed: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
}

export default function Badge({ status }: { status: Status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${colorMap[status]}`}>{status}</span>
}
