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
      return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบก่อนลงทะเบียน' }, { status: 401 })
    }

    const secret = process.env.JWT_SECRET || 'secret123'
    const decoded: any = jwt.verify(token, secret)
    const studentId = decoded.studentId

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ message: 'ไม่พบรหัสวิชาที่ต้องการลงทะเบียน' }, { status: 400 })
    }

    // 1. ค้นหานักศึกษาพร้อมประวัติการลงทะเบียนและข้อมูลคอร์สเดิม
    const student = await prisma.student.findUnique({
      where: { studentId },
      include: {
        enrollments: {
          include: { course: true }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ message: 'ไม่พบข้อมูลนักศึกษา' }, { status: 404 })
    }

    // 2. ค้นหาวิชาที่ต้องการลงทะเบียนใหม่
    const targetCourse = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!targetCourse) {
      return NextResponse.json({ message: 'ไม่พบรายวิชานี้ในระบบ' }, { status: 404 })
    }

    // 3. เงื่อนไขที่ 1: ตรวจสอบว่าเคยลงทะเบียนวิชานี้ไปแล้วหรือยัง
    const alreadyEnrolled = student.enrollments.some(e => e.courseId === courseId)
    if (alreadyEnrolled) {
      return NextResponse.json({ message: 'คุณได้ลงทะเบียนวิชานี้ไปแล้ว' }, { status: 400 })
    }

    // 4. เงื่อนไขที่ 2: ตรวจสอบที่นั่งเต็ม (Capacity)
    if (targetCourse.enrolled >= targetCourse.capacity) {
      return NextResponse.json({ message: 'รายวิชานี้มีผู้ลงทะเบียนเต็มจำนวนแล้ว' }, { status: 400 })
    }

    // 5. เงื่อนไขที่ 3: ตรวจสอบเวลาเรียนชนกัน (Schedule Conflict)
    for (const enrollment of student.enrollments) {
      const enrolledCourse = enrollment.course
      if (enrolledCourse.scheduleDay === targetCourse.scheduleDay) {
        // เช็คช่วงเวลาทับซ้อนกัน
        if (
          (targetCourse.startTime >= enrolledCourse.startTime && targetCourse.startTime < enrolledCourse.endTime) ||
          (targetCourse.endTime > enrolledCourse.startTime && targetCourse.endTime <= enrolledCourse.endTime) ||
          (targetCourse.startTime <= enrolledCourse.startTime && targetCourse.endTime >= enrolledCourse.endTime)
        ) {
          return NextResponse.json({ 
            message: `เวลาเรียนชนกับวิชา ${enrolledCourse.courseCode} (${enrolledCourse.courseName}) วัน ${enrolledCourse.scheduleDay} เวลา ${enrolledCourse.startTime}-${enrolledCourse.endTime}` 
          }, { status: 400 })
        }
      }
    }

    // 6. บันทึกข้อมูลการลงทะเบียนและอัปเดตจำนวนที่นั่งในคอร์สแบบ Transaction
    await prisma.$transaction([
      prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: targetCourse.id,
          status: 'CONFIRMED'
        }
      }),
      prisma.course.update({
        where: { id: courseId },
        data: { enrolled: { increment: 1 } }
      })
    ])

    return NextResponse.json({ message: 'ลงทะเบียนสำเร็จ' }, { status: 200 })

  } catch (error) {
    console.error('Enroll Error:', error)
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' }, { status: 500 })
  }
}