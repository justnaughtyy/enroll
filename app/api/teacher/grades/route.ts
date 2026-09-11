import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { enrollmentId, grade } = body

    if (!enrollmentId) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    // อัปเดตเกรดในตาราง Enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { grade }
    })

    return NextResponse.json(
      { message: "บันทึกเกรดสำเร็จ", enrollment: updatedEnrollment }, 
      { status: 200 }
    )
  } catch (error) {
    console.error("Update grade error:", error)
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ ไม่สามารถบันทึกเกรดได้" }, 
      { status: 500 }
    )
  }
}