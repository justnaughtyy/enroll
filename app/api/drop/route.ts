import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })
    }

    const secret = process.env.JWT_SECRET || 'secret123'
    const decoded: any = jwt.verify(token, secret)
    const studentId = decoded.studentId

    const body = await request.json()
    const { enrollmentId } = body

    if (!enrollmentId) {
      return NextResponse.json({ message: 'ไม่พบรหัสการลงทะเบียน' }, { status: 400 })
    }

    // 1. ค้นหาข้อมูล Enrollment และตรวจสอบว่าเป็นของนักศึกษาคนนี้จริงไหม
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { student: true }
    })

    if (!enrollment || enrollment.student.studentId !== studentId) {
      return NextResponse.json({ message: 'ไม่พบข้อมูลการลงทะเบียนนี้' }, { status: 404 })
    }

    // 2. ทำ Transaction ลบการลงทะเบียน และลดจำนวนคนเรียนในคอร์สลง 1
    await prisma.$transaction([
      prisma.enrollment.delete({
        where: { id: enrollmentId }
      }),
      prisma.course.update({
        where: { id: enrollment.courseId },
        data: { enrolled: { decrement: 1 } }
      })
    ])

    return NextResponse.json({ message: 'ถอนรายวิชาสำเร็จ' }, { status: 200 })

  } catch (error) {
    console.error('Drop Error:', error)
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' }, { status: 500 })
  }
}