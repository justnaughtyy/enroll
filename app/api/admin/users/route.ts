import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password, name, role } = body

    // ตรวจสอบว่ากรอกครบไหม
    if (!username || !password || !name || !role) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    // เช็กว่า username นี้ถูกใช้ไปหรือยัง
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json({ message: "Username นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น" }, { status: 400 })
    }

    // เข้ารหัสรหัสผ่าน (Hash) ก่อนบันทึกลงฐานข้อมูล
    const hashedPassword = await bcrypt.hash(password, 10)

    // บันทึกผู้ใช้ใหม่
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role,
      }
    })

    return NextResponse.json({ message: "เพิ่มผู้ใช้ใหม่สำเร็จ", user: newUser }, { status: 201 })
  } catch (error: any) {
    console.error("Create user error:", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, { status: 500 })
  }
}