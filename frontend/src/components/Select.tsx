import React from 'react'

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string | null
}

export default function Select({ label, error, className = '', children, ...rest }: Props) {
  return (
    <div className={className}>
      {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
      <select
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#1E3A8A]"
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}