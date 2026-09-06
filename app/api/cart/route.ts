import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

// ดึงข้อมูลวิชาในตะกร้า
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123')
    const student = await prisma.student.findUnique({
      where: { studentId: decoded.studentId },
      include: { 
        cartItems: { include: { course: true } },
        enrollments: { include: { course: true } }
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 })
  }
}

// เพิ่มวิชาลงตะกร้า (พร้อมเช็ค Rules)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123')
    const { courseId } = await request.json()

    const student = await prisma.student.findUnique({
      where: { studentId: decoded.studentId },
      include: { 
        cartItems: { include: { course: true } },
        enrollments: { include: { course: true } }
      }
    })

    const targetCourse = await prisma.course.findUnique({ where: { id: courseId } })
    if (!targetCourse) return NextResponse.json({ message: 'ไม่พบรายวิชา' }, { status: 404 })

    // เช็คที่นั่งเต็ม
    if (targetCourse.enrolled >= targetCourse.capacity) {
      return NextResponse.json({ message: 'รายวิชานี้มีผู้ลงทะเบียนเต็มจำนวนแล้ว' }, { status: 400 })
    }

    // เช็คว่าอยู่ในตะกร้าหรือลงทะเบียนไปแล้วยัง
    const inCart = student?.cartItems.some(item => item.courseId === courseId)
    const inEnrolled = student?.enrollments.some(item => item.courseId === courseId)
    if (inCart || inEnrolled) {
      return NextResponse.json({ message: 'คุณมีรายวิชานี้ในตะกร้าหรือลงทะเบียนแล้ว' }, { status: 400 })
    }

    // เช็ค Rule 3: หน่วยกิตรวมต้องไม่เกิน 22 หน่วยกิต
    const currentCredits = student?.enrollments.reduce((sum, e) => sum + e.course.credits, 0) || 0
    const cartCredits = student?.cartItems.reduce((sum, c) => sum + c.course.credits, 0) || 0
    if (currentCredits + cartCredits + targetCourse.credits > 22) {
      return NextResponse.json({ message: 'หน่วยกิตรวมเกินกำหนด (สูงสุด 22 หน่วยกิต)' }, { status: 400 })
    }

    // เช็คเวลาชนกันกับวิชาในตะกร้าและที่ลงทะเบียนแล้ว
    const allActiveCourses = [
      ...(student?.enrollments.map(e => e.course) || []),
      ...(student?.cartItems.map(c => c.course) || [])
    ]

    for (const c of allActiveCourses) {
      if (c.scheduleDay === targetCourse.scheduleDay) {
        if (
          (targetCourse.startTime >= c.startTime && targetCourse.startTime < c.endTime) ||
          (targetCourse.endTime > c.startTime && targetCourse.endTime <= c.endTime) ||
          (targetCourse.startTime <= c.startTime && targetCourse.endTime >= c.endTime)
        ) {
          return NextResponse.json({ message: `เวลาเรียนชนกับวิชา ${c.courseCode} (${c.courseName})` }, { status: 400 })
        }
      }
    }

    await prisma.cartItem.create({
      data: { studentId: student!.id, courseId }
    })

    return NextResponse.json({ message: 'เพิ่มลงตะกร้าสำเร็จ' })
  } catch (error) {
    return NextResponse.json({ message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}