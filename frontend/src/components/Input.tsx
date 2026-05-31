import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | null
}

export default function Input({ label, error, className = '', ...rest }: Props) {
  return (
    <div className={className}>
      {label && <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>}
      <input
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1E3A8A]"
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
