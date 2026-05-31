import axios, { AxiosHeaders } from 'axios'
import useAuth from '../store/useAuth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? useAuth.getState().accessToken : null
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`)
      } else {
        const headers = AxiosHeaders.from(config.headers)
        headers.Authorization = `Bearer ${token}`
        config.headers = headers
      }
    }
  } catch {
    //ignore error
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ?? err.message
      : err instanceof Error
        ? err.message
        : 'Request failed'

    return Promise.reject(new Error(message))
  }
)

export default api
