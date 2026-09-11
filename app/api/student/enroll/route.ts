import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    // 1. ตรวจสอบผู้ใช้งาน
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret123")
    const userId = decoded.userId

    // 2. ดึงข้อมูลวิชาในตะกร้าทั้งหมดของคนๆ นี้
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: { course: true }
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ message: "ไม่มีวิชาในตะกร้าให้ลงทะเบียน" }, { status: 400 })
    }

    // 3. เตรียมข้อมูลสำหรับเพิ่มลงตาราง Enrollment (ใช้ userId ตามที่คุณออกแบบไว้)
    const enrollmentsData = cartItems.map(item => ({
      userId: userId,
      courseId: item.courseId,
    }))

    // 4. ใช้ Transaction: ย้ายข้อมูลเข้า Enrollment และ ลบ CartItem พร้อมกัน
    await prisma.$transaction([
      prisma.enrollment.createMany({
        data: enrollmentsData
      }),
      prisma.cartItem.deleteMany({
        where: { userId: userId }
      })
    ])

    return NextResponse.json({ message: "ลงทะเบียนเรียนสำเร็จ!" }, { status: 201 })
  } catch (error: any) {
    console.error("Enrollment error:", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการลงทะเบียน" }, { status: 500 })
  }
}