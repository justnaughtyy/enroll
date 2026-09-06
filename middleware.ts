import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // 1. ถ้ามี Token อยู่แล้ว (ล็อกอินแล้ว) แต่พยายามเข้าหน้า /login -> ดีดไป /dashboard ทันที
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. ถ้ายังไม่มี Token (ยังไม่ล็อกอิน) แต่พยายามเข้าหน้าหลักๆ -> ดีดกลับไปหน้า /login
  const protectedPaths = ['/dashboard', '/courses', '/cart']
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// กำหนดให้ Middleware ทำงานเฉพาะเส้นทางเหล่านี้
export const config = {
  matcher: ['/login', '/dashboard/:path*', '/courses/:path*', '/cart/:path*'],
}