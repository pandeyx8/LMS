import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/') {
    return NextResponse.next()
  }

  const token = req.cookies.get('accessToken')?.value
  const role = req.cookies.get('lms_role')?.value

  if (!role) {
  return NextResponse.redirect(new URL('/', req.url))
}

  if (pathname.startsWith('/borrower') && role !== 'borrower' && role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/ops') && role === 'borrower') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/borrower/:path*', '/ops/:path*']
}
