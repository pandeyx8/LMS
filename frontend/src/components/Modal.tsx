import React from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-xl overflow-hidden rounded-md bg-white shadow-lg max-h-[calc(100vh-2rem)]">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">{title}</h3>
            <button onClick={onClose} className="text-gray-500">Close</button>
          </div>
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
