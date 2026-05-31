import React from 'react'
import { FiLogOut } from 'react-icons/fi'
import useAuth from '../store/useAuth'

type Props = {
  title: string
  subtitle?: string
  onLogout: () => void
}

export default function Navbar({ title, subtitle, onLogout }: Props) {
  const user = useAuth((state) => state.user)

  return (
    <header className="border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1E3A8A]">Loan Management System</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            {user?.role && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 capitalize">
                {user.role}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <FiLogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  )
}
