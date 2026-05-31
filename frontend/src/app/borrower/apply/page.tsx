"use client"

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import AppShell from '../../../components/AppShell'
import Badge from '../../../components/Badge'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import Select from '../../../components/Select'
import Textarea from '../../../components/Textarea'
import useAuth from '../../../store/useAuth'
import useRequireAuth from '../../../hooks/useRequireAuth'
import { applyLoan } from '../../../services/loan.service'
import type { LoanApplyValues } from '../../../types'

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const MIN_AGE = 23
const MAX_AGE = 50
const MIN_SALARY = 25000
const MIN_LOAN = 50000
const MAX_LOAN = 500000
const MIN_TENURE = 30
const MAX_TENURE = 365
const INTEREST_RATE = 12

type Step = 1 | 2 | 3 | 4

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return 0
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return 0

  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDifference = today.getMonth() - dob.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }

  return age
}

export default function ApplyLoanPage() {
  useRequireAuth('borrower')
  const router = useRouter()
  const user = useAuth((state) => state.user)
  const [step, setStep] = useState<Step>(1)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [breError, setBreError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    control,
    getValues,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<LoanApplyValues>({
    defaultValues: {
      fullName: user?.fullname ?? '',
      pan: '',
      dateOfBirth: '',
      monthlySalary: 25000,
      employmentMode: 'salaried',
      loanAmount: 50000,
      tenureDays: 30,
      purpose: 'Personal Loan'
    }
  })

  const values = useWatch({ control })

  const age = calculateAge(values?.dateOfBirth ?? '')
  const normalizedPan = (values?.pan ?? '').toUpperCase()
  const salary = Number(values?.monthlySalary ?? 0)
  const loanAmount = Number(values?.loanAmount ?? 50000)
  const tenureDays = Number(values?.tenureDays ?? 30)
  const employmentMode = values?.employmentMode ?? 'salaried'

  const breChecks = useMemo(
    () => [
      { label: 'Age 23-50', passed: age >= MIN_AGE && age <= MAX_AGE },
      { label: 'PAN format', passed: PAN_REGEX.test(normalizedPan) },
      { label: 'Salary >= 25,000', passed: salary >= MIN_SALARY },
      { label: 'Employment not unemployed', passed: employmentMode !== 'unemployed' }
    ],
    [age, employmentMode, normalizedPan, salary]
  )

  const brePassed = breChecks.every((check) => check.passed)

  const simpleInterest = useMemo(() => {
    const interest = (loanAmount * INTEREST_RATE * tenureDays) / (365 * 100)
    return Number.isFinite(interest) ? Number(interest.toFixed(2)) : 0
  }, [loanAmount, tenureDays])

  const totalRepayment = useMemo(() => Number((loanAmount + simpleInterest).toFixed(2)), [loanAmount, simpleInterest])

  const currentFile = values?.salarySlip?.[0]
  const salarySlipValid = useMemo(() => {
    if (!currentFile) return false
    const isPdf = currentFile.type === 'application/pdf'
    const isImage = ['image/jpeg', 'image/png'].includes(currentFile.type)
    const sizeOk = currentFile.size <= 5 * 1024 * 1024
    return (isPdf || isImage) && sizeOk
  }, [currentFile])

  const nextStep = async () => {
    setApiError('')

    if (step === 1) {
      const valid = await trigger(['fullName', 'pan', 'dateOfBirth', 'monthlySalary', 'employmentMode'])
      if (!valid) return
      if (!brePassed) {
        setBreError('Application blocked by BRE. Fix the highlighted rule failures and try again.')
        return
      }
      setBreError('')
      setStep(2)
      return
    }

    if (step === 2) {
      const valid = await trigger('salarySlip')
      if (!valid) return
      if (!salarySlipValid) {
        setError('salarySlip', { type: 'validate', message: 'Upload a PDF, JPG, or PNG up to 5 MB' })
        return
      }
      clearErrors('salarySlip')
      setStep(3)
      return
    }

    if (step === 3) {
      const valid = await trigger(['loanAmount', 'tenureDays', 'purpose'])
      if (!valid) return
      setConfirmed(false)
      setStep(4)
    }
  }

  const onSubmit = async (data: LoanApplyValues) => {
    if (!confirmed) {
      setApiError('Please confirm that the details above are true before applying.')
      return
    }

    const file = data.salarySlip?.[0]
    if (!file) {
      setApiError('Salary slip is required')
      return
    }

    const formData = new FormData()
    formData.append('fullName', data.fullName)
    formData.append('pan', data.pan.toUpperCase())
    formData.append('dateOfBirth', data.dateOfBirth)
    formData.append('monthlySalary', String(data.monthlySalary))
    formData.append('employmentMode', data.employmentMode)
    formData.append('loanAmount', String(data.loanAmount))
    formData.append('tenureDays', String(data.tenureDays))
    formData.append('purpose', data.purpose)
    formData.append('salarySlip', file)

    try {
      setLoading(true)
      setApiError('')
      await applyLoan(formData)
      router.replace('/borrower/loans')
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to submit application')
    } finally {
      setLoading(false)
    }
  }

  const stepTitle =
    step === 1
      ? 'Personal details + BRE'
      : step === 2
        ? 'Upload salary slip'
        : step === 3
          ? 'Loan config & live calculation'
          : 'Review & apply'

  return (
    <AppShell title="Apply Loan" subtitle="Borrower portal with server-validated eligibility checks">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="card bg-white p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Step {step} of 4</p>
                <h2 className="text-2xl font-semibold text-slate-900">{stepTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">All eligibility checks must pass before the application can be submitted.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                Borrower: {user?.fullname ?? 'Account'}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {['Eligibility', 'Salary Slip', 'Loan Config', 'Review'].map((label, index) => (
                <div
                  key={label}
                  className={`rounded-full px-3 py-2 text-center ${index + 1 === step ? 'bg-[#1E3A8A] text-white' : index + 1 < step ? 'bg-blue-50 text-[#1E3A8A]' : 'bg-slate-100'}`}
                >
                  {label}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Full Name" error={errors.fullName?.message} {...register('fullName', { required: 'Full name is required' })} />
                    <Input label="PAN" error={errors.pan?.message} {...register('pan', { required: 'PAN is required' })} />
                    <Input label="Date of Birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth', { required: 'Date of birth is required' })} />
                    <Input
                      label="Monthly Salary"
                      type="number"
                      error={errors.monthlySalary?.message}
                      {...register('monthlySalary', {
                        valueAsNumber: true,
                        required: 'Monthly salary is required',
                        min: { value: MIN_SALARY, message: 'Salary must be at least 25,000' }
                      })}
                    />
                    <Select label="Employment Mode" error={errors.employmentMode?.message} {...register('employmentMode', { required: 'Employment mode is required' })}>
                      <option value="salaried">Salaried</option>
                      <option value="self-employed">Self-employed</option>
                      <option value="unemployed">Unemployed</option>
                    </Select>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">BRE checks</p>
                      <div className="mt-4 space-y-3">
                        {breChecks.map((check) => (
                          <div key={check.label} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                            <span className="text-sm font-medium text-slate-700">{check.label}</span>
                            <Badge status={check.passed ? 'approved' : 'rejected'} />
                          </div>
                        ))}
                      </div>
                      {breError && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{breError}</div>}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Eligibility snapshot</p>
                      <dl className="mt-4 grid gap-3 text-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <dt className="text-slate-500">Age</dt>
                          <dd className="font-medium text-slate-900">{age || '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <dt className="text-slate-500">PAN valid</dt>
                          <dd className="font-medium text-slate-900">{normalizedPan ? (PAN_REGEX.test(normalizedPan) ? 'Yes' : 'No') : '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <dt className="text-slate-500">Monthly salary</dt>
                          <dd className="font-medium text-slate-900">{salary ? salary.toLocaleString() : '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-slate-500">BRE status</dt>
                          <dd className={`font-semibold ${brePassed ? 'text-emerald-700' : 'text-rose-700'}`}>{brePassed ? 'Pass' : 'Fail'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <Input
                    label="Salary Slip"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    error={errors.salarySlip?.message}
                    {...register('salarySlip', { required: 'Salary slip is required' })}
                  />
                  <p className="text-sm text-slate-500">Accepted formats: PDF, JPG, PNG. Maximum file size: 5 MB.</p>
                  {currentFile && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <div className="flex items-center justify-between gap-3">
                        <span>{currentFile.name}</span>
                        <Badge status={salarySlipValid ? 'approved' : 'rejected'} />
                      </div>
                      <p className="mt-2 text-slate-500">{(currentFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
                  <div className="space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                        <label className="font-medium text-slate-700">Loan Amount</label>
                        <span>{loanAmount.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min={MIN_LOAN}
                        max={MAX_LOAN}
                        step={10000}
                        {...register('loanAmount', { valueAsNumber: true, min: MIN_LOAN, max: MAX_LOAN })}
                        className="w-full accent-[#1E3A8A]"
                      />
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>50,000</span>
                        <span>5,00,000</span>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                        <label className="font-medium text-slate-700">Tenure Days</label>
                        <span>{tenureDays} days</span>
                      </div>
                      <input
                        type="range"
                        min={MIN_TENURE}
                        max={MAX_TENURE}
                        step={1}
                        {...register('tenureDays', { valueAsNumber: true, min: MIN_TENURE, max: MAX_TENURE })}
                        className="w-full accent-[#1E3A8A]"
                      />
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>30</span>
                        <span>365</span>
                      </div>
                    </div>

                    <Textarea label="Purpose" error={errors.purpose?.message} {...register('purpose', { required: 'Purpose is required' })} />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Live calculation</p>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Interest rate</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">12% p.a.</p>
                      </div>
                      <div className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Simple Interest</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{simpleInterest.toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Repayment</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{totalRepayment.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Review application</h3>
                  <p className="mt-1 text-sm text-slate-500">Read the summary carefully, confirm the details are correct, and then submit.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                      ['Full Name', getValues('fullName')],
                      ['PAN', normalizedPan],
                      ['Date of Birth', getValues('dateOfBirth')],
                      ['Employment Mode', getValues('employmentMode')],
                      ['Monthly Salary', String(getValues('monthlySalary'))],
                      ['Loan Amount', String(getValues('loanAmount'))],
                      ['Tenure Days', String(getValues('tenureDays'))],
                      ['Purpose', getValues('purpose')]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                        <p className="mt-2 text-sm text-slate-900">{value || '-'}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1E3A8A]">Declaration</p>
                        <p className="mt-1 text-sm text-slate-600">Confirm that all the details entered above are true and complete.</p>
                      </div>
                      <Button type="button" variant={confirmed ? 'ghost' : 'primary'} onClick={() => setConfirmed(true)}>
                        {confirmed ? 'Confirmed' : 'Confirm Details'}
                      </Button>
                    </div>
                    {confirmed && <p className="mt-3 text-sm font-medium text-emerald-700">You have confirmed the application details.</p>}
                  </div>

                  {apiError && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{apiError}</div>}
                </div>
              )}

              {apiError && step !== 4 && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{apiError}</div>}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <Button type="button" variant="ghost" onClick={() => setStep((current) => Math.max(1, current - 1) as Step)} disabled={step === 1 || loading}>
                  Back
                </Button>

                <div className="flex items-center gap-3">
                  {step < 4 ? (
                    <Button type="button" onClick={nextStep} disabled={loading}>
                      Continue
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading || !brePassed || !confirmed}>
                      {loading ? 'Submitting...' : confirmed ? 'Apply Loan' : 'Confirm & Apply'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="card bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Application tips</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>Keep your PAN and latest salary slip ready.</li>
                <li>Ensure personal details match your official documents.</li>
                <li>Processing typically completes in 2–3 business days.</li>
              </ul>
            </div>

            <div className="card border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Loan Lifecycle</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <span>Applied</span>
                <span className="text-slate-300">→</span>
                <span>Sanctioned</span>
                <span className="text-slate-300">→</span>
                <span>Disbursed</span>
                <span className="text-slate-300">→</span>
                <span>Closed</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}
