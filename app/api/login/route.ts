import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt" // ✅ นำเข้า bcrypt

export async function POST(req: Request) {
  try {
    const { studentId, password } = await req.json()

    // 1. ค้นหาผู้ใช้จาก username (รหัสนักศึกษา หรือ รหัสอาจารย์/แอดมิน)
    const user = await prisma.user.findUnique({
      where: { username: studentId } 
    })

    // 2. ถ้าไม่พบผู้ใช้ ให้ดีดกลับทันที
    if (!user) {
      return NextResponse.json(
        { message: "รหัสผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" }, 
        { status: 401 }
      )
    }

    // 3. ✅ ตรวจสอบรหัสผ่านที่ถูก Hash ไว้ด้วย bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "รหัสผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" }, 
        { status: 401 }
      )
    }

    // 4. สร้าง Token พร้อมแนบ Role
    const secret = process.env.JWT_SECRET || "secret123"
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        name: user.name, 
        role: user.role 
      },
      secret,
      { expiresIn: "1d" }
    )

    const response = NextResponse.json({ 
      message: "เข้าสู่ระบบสำเร็จ", 
      role: user.role 
    })
    
    response.cookies.set("token", token, { 
      httpOnly: true, 
      path: "/",
      maxAge: 60 * 60 * 24 
    })

    return response
  } catch (error) {
    console.error("Login Error:", error)
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, 
      { status: 500 }
    )
  }
}