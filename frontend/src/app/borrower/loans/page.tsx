"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '../../../store/useAuth'

export default function BorrowerLoansRedirect() {
  const router = useRouter()
  const user = useAuth((state) => state.user)
  const hydrated = useAuth((state) => state.hydrated)

  useEffect(() => {
    if (!hydrated) return
    if (!user?.username) {
      router.replace('/')
      return
    }

    router.replace(`/borrower/${user.username}/loans`)
  }, [hydrated, router, user?.username])

  return null
}
