import type { Role } from '../types'

const ROLE_COOKIE = 'lms_role'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export function setRoleCookie(role: Role) {
  if (typeof document === 'undefined') return
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
}

export function clearRoleCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`
}

export function getRoleCookieName() {
  return ROLE_COOKIE
}
