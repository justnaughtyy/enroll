import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123')
    const { cartItemId } = await request.json()

    if (!cartItemId) {
      return NextResponse.json({ message: 'ไม่พบรหัสรายการในตะกร้า' }, { status: 400 })
    }

    // ตรวจสอบว่าเป็นของนักศึกษาคนนี้จริงๆ ไหม
    const student = await prisma.student.findUnique({
      where: { studentId: decoded.studentId }
    })

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    })

    if (!cartItem || cartItem.studentId !== student?.id) {
      return NextResponse.json({ message: 'ไม่พบรายการนี้ในตะกร้าของคุณ' }, { status: 404 })
    }

    // ลบรายการออกจากตาราง CartItem
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    })

    return NextResponse.json({ message: 'ลบออกจากตะกร้าสำเร็จ' }, { status: 200 })

  } catch (error) {
    console.error('Remove Cart Error:', error)
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' }, { status: 500 })
  }
}