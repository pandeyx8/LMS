"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '../components/Button'
import Input from '../components/Input'
import { login } from '../services/auth.service'
import useAuth from '../store/useAuth'
import { setRoleCookie } from '../lib/session'
import type { LoginPayload } from '../types'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuth((state) => state.setAuth)
  const setLoading = useAuth((state) => state.setLoading)
  const loading = useAuth((state) => state.loading)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginPayload>()

  const onSubmit = async (values: LoginPayload) => {
    try {
      setApiError('')
      setLoading(true)
      const session = await login(values)
      setAuth(session)
      setRoleCookie(session.user.role)

      const redirects: Record<string, string> = {
        borrower: '/borrower/apply',
        sales: '/ops/sales',
        sanction: '/ops/sanction',
        disbursement: '/ops/disbursement',
        collection: '/ops/collection',
        admin: '/ops/overview'
      }

      router.push(redirects[session.user.role] ?? '/ops/overview')
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl mx-auto">
        <section className="card bg-white p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1E3A8A]">Loan Management System</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Secure lending operations for borrowers and internal teams.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Sign in to manage loan applications, sanction decisions, disbursements, and collections in one place.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="name@company.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />

            {apiError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {apiError}
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-sm text-slate-500">Use your LMS account credentials.</p>
              <div className="flex items-center gap-3">
                <Link href="/signup" className="text-sm font-medium text-[#1E3A8A] hover:underline">
                  Sign up
                </Link>
                <Button type="submit" disabled={loading} className="min-w-28">
                  {loading ? 'Signing in...' : 'Login'}
                </Button>
              </div>
            </div>
          </form>
        </section>

        
      </div>
    </div>
  )
}
