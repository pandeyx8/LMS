import api from '../lib/axios'
import { unwrapResponse } from '../lib/api'
import type { AuthSession, LoginPayload, RegisterPayload, User } from '../types'

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await api.post('/auth/login', payload)
  return unwrapResponse<AuthSession>(response)
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function register(payload: RegisterPayload): Promise<User> {
  const response = await api.post('/auth/register', payload)
  return unwrapResponse<User>(response)
}
