import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // 1. ดึง Token จาก Cookie
  const token = req.cookies.get('token')?.value
  const path = req.nextUrl.pathname

  // 2. ถ้าไม่มี Token และไม่ได้อยู่หน้า Login ให้เด้งไปหน้า Login
  if (!token && path !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 3. ถ้ามี Token ให้ตรวจสอบสิทธิ์ (Role)
  if (token) {
    try { 
      // --- เปลี่ยนวิธีการถอดรหัสตรงนี้ ---
      const base64Url = token.split('.')[1]
      // 1. แปลงรูปแบบ Base64URL เป็น Base64 มาตรฐาน
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const decodedJson = decodeURIComponent(
        atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join('')
      )
      const decoded = JSON.parse(decodedJson)
      const role = decoded.role // 'admin' | 'teacher' | 'student'

      // --- กฎการเข้าถึงแต่ละ Route ---

      // กฎข้อที่ 1: ถ้าเป็นนักศึกษา ห้ามเข้าหน้า admin และ teacher
      if ((path.startsWith('/admin') || path.startsWith('/teacher')) && role === 'student') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // กฎข้อที่ 2: ถ้าเป็นอาจารย์ ห้ามเข้าหน้า admin
      if (path.startsWith('/admin') && role === 'teacher') {
        return NextResponse.redirect(new URL('/teacher', req.url)) // เด้งกลับไปหน้าอาจารย์
      }

      // กฎข้อที่ 3: ถ้าล็อกอินแล้วและพยายามเข้าหน้า /login ให้ปัดไปหน้าแรกตามสิทธิ์ของคนนั้น
      if (path === '/login') {
        if (role === 'admin') return NextResponse.redirect(new URL('/admin', req.url))
        if (role === 'teacher') return NextResponse.redirect(new URL('/teacher', req.url))
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

    } catch (error) {
      // ถ้า Token พังหรือถอดรหัสไม่ได้ ให้ลบทิ้งแล้วไล่ไปล็อกอินใหม่
      const response = NextResponse.redirect(new URL('/login', req.url))
      response.cookies.delete('token')
      return response
    }
  }

  // ถ้าทุกอย่างถูกต้อง ให้ปล่อยผ่าน (Render หน้าเว็บตามปกติ)
  return NextResponse.next()
}

// 4. กำหนด URL ที่ต้องการให้ Middleware ตัวนี้ทำงาน
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/teacher/:path*', 
    '/login'
  ],
}