import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthSession, Role, User } from '../types'

type AuthState = {
  user: User | null
  accessToken: string | null
  role: Role | null
  loading: boolean
  hydrated: boolean
  setAuth: (session: AuthSession) => void
  setLoading: (loading: boolean) => void
  setHydrated: (hydrated: boolean) => void
  logout: () => void
}

const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      role: null,
      loading: false,
      hydrated: false,
      setAuth: ({ user, accessToken }: AuthSession) =>
        set(() => ({ user, accessToken, role: user.role, loading: false })),
      setLoading: (loading: boolean) => set(() => ({ loading })),
      setHydrated: (hydrated: boolean) => set(() => ({ hydrated })),
      logout: () => set(() => ({ user: null, accessToken: null, role: null, loading: false }))
    }),
    {
      name: 'lms-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        role: state.role
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      }
    }
  )
)

export default useAuth
