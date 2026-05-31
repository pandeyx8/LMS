import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-60'
  const variants: Record<string, string> = {
    primary: 'bg-[#1E3A8A] text-white hover:bg-[#1b347a] shadow-sm',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100'
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
