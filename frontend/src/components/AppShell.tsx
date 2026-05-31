"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import useAuth from '../store/useAuth'
import { clearRoleCookie } from '../lib/session'
import { logout as logoutRequest } from '../services/auth.service'

type Props = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function AppShell({ title, subtitle, children }: Props) {
  const router = useRouter()
  const clearAuth = useAuth((state) => state.logout)

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } finally {
      clearRoleCookie()
      clearAuth()
      router.replace('/')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 border-r border-slate-200 bg-white lg:block">
          <Sidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar title={title} subtitle={subtitle} onLogout={handleLogout} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
