import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiBarChart2, FiBriefcase, FiCheckCircle, FiCreditCard, FiFileText, FiLayers } from 'react-icons/fi'
import useAuth from '../store/useAuth'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

const borrowerNav: NavItem[] = [
  { href: '/borrower/apply', label: 'Apply Loan', icon: <FiFileText /> },
  { href: '/borrower/loans', label: 'My Loans', icon: <FiCreditCard /> }
]

const salesNav: NavItem[] = [{ href: '/ops/sales', label: 'Sales', icon: <FiBriefcase /> }]

const opsNav: NavItem[] = [
  ...salesNav,
  { href: '/ops/overview', label: 'Overview', icon: <FiBarChart2 /> },
  { href: '/ops/sanction', label: 'Sanction', icon: <FiCheckCircle /> },
  { href: '/ops/disbursement', label: 'Disbursement', icon: <FiLayers /> },
  { href: '/ops/collection', label: 'Collection', icon: <FiCreditCard /> }
]

const roleNavMap: Record<string, NavItem[]> = {
  borrower: borrowerNav,
  sales: salesNav,
  sanction: [{ href: '/ops/sanction', label: 'Sanction', icon: <FiCheckCircle /> }],
  disbursement: [{ href: '/ops/disbursement', label: 'Disbursement', icon: <FiLayers /> }],
  collection: [{ href: '/ops/collection', label: 'Collection', icon: <FiCreditCard /> }],
  admin: opsNav
}

export default function Sidebar() {
  const pathname = usePathname()
  const role = useAuth((state) => state.role) ?? 'borrower'
  const username = useAuth((state) => state.user?.username) ?? 'borrower'
  const borrowerNavItems = [
    { href: '/borrower/apply', label: 'Apply Loan', icon: <FiFileText /> },
    { href: `/borrower/${username}/loans`, label: 'My Loans', icon: <FiCreditCard /> }
  ]

  return (
    <nav className="flex h-full flex-col bg-white px-4 py-5">
      <div className="mb-6 px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1E3A8A]">LMS</p>
        <p className="mt-1 text-sm text-slate-500">Get Loan</p>
      </div>

      <ul className="space-y-1">
        {((role === 'borrower' ? borrowerNavItems : roleNavMap[role]) ?? borrowerNav).map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
