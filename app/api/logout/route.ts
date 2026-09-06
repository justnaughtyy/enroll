import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // 1. สร้าง URL ปลายทางไปที่หน้า login
  const loginUrl = new URL('/login', request.url)
  
  // 2. สั่ง redirect พร้อมระบุ status: 303 (บังคับให้ browser เปลี่ยนเป็น GET request)
  const response = NextResponse.redirect(loginUrl, { status: 303 })
  
  // 3. สั่งลบ Cookie Token ทิ้งอย่างเด็ดขาด
  response.cookies.set({
    name: 'token',
    value: '',
    path: '/',
    maxAge: 0,
  })

  return response
}