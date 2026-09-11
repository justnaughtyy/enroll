import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await params

    // 1. กรณีเป็น "อาจารย์" -> ปลดออกจากวิชาที่สอนอยู่ (เซ็ต teacherId ให้ว่าง)
    await prisma.course.updateMany({
      where: { teacherId: userId },
      data: { teacherId: null }
    })

    // 2. กรณีเป็น "นักศึกษา" -> ลบตะกร้าสินค้าและการลงทะเบียนทิ้ง
    // หมายเหตุ: ถ้า schema ของคุณยังใช้คำว่า studentId อยู่ ให้เปลี่ยน userId ด้านล่างเป็น studentId นะครับ
    await prisma.cartItem.deleteMany({
      where: { userId: userId } 
    })
    
    await prisma.enrollment.deleteMany({
      where: { userId: userId }
    })

    // 3. ลบข้อมูลบัญชีผู้ใช้
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: "ลบผู้ใช้งานสำเร็จ" }, { status: 200 })
    
  } catch (error: any) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด ไม่สามารถลบผู้ใช้งานได้" }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await params
    const body = await req.json()
    const { username, password, name, role } = body

    if (!username || !name || !role) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    // เตรียมข้อมูลที่จะอัปเดต
    const updateData: any = {
      username,
      name,
      role,
    }

    // ถ้ามีการพิมพ์รหัสผ่านใหม่เข้ามา ให้ Hash รหัสผ่านใหม่ด้วย
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json(
      { message: "อัปเดตข้อมูลผู้ใช้งานสำเร็จ", user: updatedUser },
      { status: 200 }
    )
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "Username นี้ถูกใช้งานแล้ว" }, { status: 400 })
    }
    console.error("Update user error:", error)
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" },
      { status: 500 }
    )
  }
}