import React from 'react'

export default function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="card p-8 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  )
}
