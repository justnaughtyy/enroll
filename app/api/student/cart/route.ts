import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    // 1. เช็กว่าใครกำลังล็อกอินอยู่
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret123")
    const userId = decoded.userId

    const body = await req.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ message: "ไม่พบรหัสวิชา" }, { status: 400 })
    }

    // 2. ดึงข้อมูลวิชาเพื่อมาเช็กเงื่อนไขต่างๆ
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { enrollments: true } } }
    })

    if (!course) return NextResponse.json({ message: "ไม่พบรายวิชานี้ในระบบ" }, { status: 404 })
    if (!course.isOpen) return NextResponse.json({ message: "วิชานี้ปิดการลงทะเบียนแล้ว" }, { status: 400 })
    if (course._count.enrollments >= course.capacity) {
      return NextResponse.json({ message: "ที่นั่งในรายวิชานี้เต็มแล้ว" }, { status: 400 })
    }

    // 3. เช็กว่าเคยเพิ่มลงตะกร้าไปแล้วหรือยัง
    const existingCart = await prisma.cartItem.findFirst({
      where: { userId: userId, courseId: courseId }
    })
    if (existingCart) return NextResponse.json({ message: "วิชานี้อยู่ในตะกร้าแล้ว" }, { status: 400 })

    // 4. เช็กว่าเคยลงทะเบียนวิชานี้ไปแล้วหรือยัง
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { userId: userId, courseId: courseId }
    })
    if (existingEnrollment) return NextResponse.json({ message: "คุณลงทะเบียนวิชานี้ไปแล้ว" }, { status: 400 })

    // 5. บันทึกลงตะกร้า
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: userId,
        courseId: courseId
      }
    })

    return NextResponse.json({ message: "เพิ่มลงตะกร้าสำเร็จ", cartItem }, { status: 201 })
  } catch (error: any) {
    console.error("Add to cart error:", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, { status: 500 })
  }
}