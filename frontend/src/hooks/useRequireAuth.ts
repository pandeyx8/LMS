import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '../store/useAuth'

export default function useRequireAuth(role?: string) {
  const user = useAuth((state) => state.user)
  const accessToken = useAuth((state) => state.accessToken)
  const hydrated = useAuth((state) => state.hydrated)
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (!user || !accessToken) {
      router.replace('/')
      return
    }

    if (role && user.role !== role && user.role !== 'admin') {
      router.replace('/')
    }
  }, [accessToken, hydrated, role, router, user])
}
