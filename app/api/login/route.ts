import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, password } = body

    // 1. ตรวจสอบว่าส่งข้อมูลมาครบไหม
    if (!studentId || !password) {
      return NextResponse.json({ message: 'กรุณากรอกรหัสนักศึกษาและรหัสผ่าน' }, { status: 400 })
    }

    // 2. ค้นหานักศึกษาในฐานข้อมูลด้วยรหัสนักศึกษา
    const student = await prisma.student.findUnique({
      where: { studentId },
    })

    if (!student) {
      return NextResponse.json({ message: 'ไม่พบรหัสนักศึกษานี้ในระบบ' }, { status: 404 })
    }

    // 3. นำรหัสผ่านที่กรอก มาเทียบกับรหัสผ่านที่ Hash ไว้ในฐานข้อมูล
    const passwordMatch = await bcrypt.compare(password, student.password)

    if (!passwordMatch) {
      return NextResponse.json({ message: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 })
    }

    // 4. สร้าง JWT Token (บัตรผ่าน)
    const secret = process.env.JWT_SECRET || 'secret123'
    const token = jwt.sign(
      { id: student.id, studentId: student.studentId },
      secret,
      { expiresIn: '1d' } // ให้บัตรผ่านมีอายุ 1 วัน
    )

    // 5. ส่ง Response กลับไปพร้อมกับแนบ Token ลงใน Cookie
    const response = NextResponse.json({ message: 'เข้าสู่ระบบสำเร็จ' }, { status: 200 })
    
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true, // ป้องกันการถูกขโมยผ่าน JavaScript
      path: '/',
      maxAge: 60 * 60 * 24, // 1 วัน
    })

    return response

  } catch (error) {
    console.error('Login Error:', error)
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' }, { status: 500 })
  }
}