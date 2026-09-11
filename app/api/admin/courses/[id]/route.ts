import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  // ✅ ปรับ Type ให้รองรับ Promise สำหรับ Next.js เวอร์ชันใหม่
  context: { params: Promise<{ id: string }> } 
) {
  try {
    // ✅ ต้องใส่ await ก่อนดึงค่า id
    const params = await context.params 
    const courseId = params.id

    // 1. ลบข้อมูล "ตะกร้าสินค้า" (CartItem) ที่ผูกกับวิชานี้ก่อน
    await prisma.cartItem.deleteMany({
      where: { courseId: courseId }
    })

    // 2. ลบข้อมูล "การลงทะเบียน" (Enrollment) ที่ผูกกับวิชานี้
    await prisma.enrollment.deleteMany({
      where: { courseId: courseId }
    })

    // 3. เมื่อไม่มีข้อมูลลูกมาขวางแล้ว ก็ทำการลบ "วิชาหลัก" (Course) ได้เลย
    await prisma.course.delete({
      where: { id: courseId }
    })

    return NextResponse.json(
      { message: "ลบรายวิชาสำเร็จ" }, 
      { status: 200 }
    )
    
  } catch (error: any) {
    console.error("Delete course error:", error)
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ ไม่สามารถลบวิชาได้" }, 
      { status: 500 }
    )
  }
}

// วางโค้ดนี้ต่อท้ายฟังก์ชัน DELETE ในไฟล์ app/api/admin/courses/[id]/route.ts ได้เลยครับ

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // สำหรับ Next.js เวอร์ชันใหม่ ต้อง await params ก่อนดึงค่า
    const { id: courseId } = await params
    
    const body = await req.json()
    const { courseCode, courseName, credits, capacity, teacherId, term, year, isOpen, schedule } = body
    const isCourseOpen = isOpen === "true" || isOpen === true

    if (!courseCode || !courseName || !credits || !capacity) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        courseCode,
        courseName,
        credits: Number(credits),
        capacity: Number(capacity),
        teacherId: teacherId || null,
        term: Number(term),
        year: Number(year),
        isOpen: isCourseOpen,
        schedule: schedule || "ยังไม่กำหนดเวลา"
      }
    })

    return NextResponse.json(
      { message: "อัปเดตข้อมูลรายวิชาสำเร็จ", course: updatedCourse },
      { status: 200 }
    )
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "รหัสวิชานี้ซ้ำกับวิชาอื่นในระบบ" }, { status: 400 })
    }
    console.error("Update course error:", error)
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" },
      { status: 500 }
    )
  }
}