import React from 'react'

type Props = {
  headers: string[]
  children: React.ReactNode
}

export default function Table({ headers, children }: Props) {
  return (
    <div className="overflow-x-auto card p-4">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="py-2 text-gray-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
