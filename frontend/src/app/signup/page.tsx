"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { register as registerUser } from '../../services/auth.service'
import type { RegisterPayload } from '../../types'

export default function SignupPage() {
  const router = useRouter()
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterPayload>()

  const onSubmit = async (values: RegisterPayload) => {
    try {
      setLoading(true)
      setApiError('')
      await registerUser(values)
      setSuccessMessage('Account created. You can now sign in with your credentials.')
      setTimeout(() => router.push('/'), 1200)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="card bg-white p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1E3A8A]">Create account</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Borrower registration</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Create a borrower account before applying for a loan.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <Input label="Username" error={errors.username?.message} {...register('username', { required: 'Username is required' })} />
            <Input label="Full Name" error={errors.fullname?.message} {...register('fullname', { required: 'Full name is required' })} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} />
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
            />

            {apiError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{apiError}</div>}
            {successMessage && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</div>}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Back to login
              </Link>
              <Button type="submit" disabled={loading} className="min-w-28">
                {loading ? 'Creating...' : 'Create account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}