import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123')
    const student = await prisma.student.findUnique({
      where: { studentId: decoded.studentId },
      include: { cartItems: { include: { course: true } } }
    })

    if (!student || student.cartItems.length === 0) {
      return NextResponse.json({ message: 'ไม่มีรายวิชาในตะกร้า' }, { status: 400 })
    }

    // ทำ Transaction บันทึกผลและตัดโควต้ารายวิชา
    await prisma.$transaction(async (tx) => {
      for (const item of student.cartItems) {
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            courseId: item.courseId,
            status: 'CONFIRMED'
          }
        })
        await tx.course.update({
          where: { id: item.courseId },
          data: { enrolled: { increment: 1 } }
        })
      }
      // ล้างข้อมูลในตะกร้าออก
      await tx.cartItem.deleteMany({
        where: { studentId: student.id }
      })
    })

    return NextResponse.json({ message: 'ยืนยันการลงทะเบียนสำเร็จ' })
  } catch (error) {
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการยืนยัน' }, { status: 500 })
  }
}