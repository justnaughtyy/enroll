import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { courseCode, courseName, credits, capacity, teacherId, term, year, isOpen, schedule } = body
    const isCourseOpen = isOpen === "true" || isOpen === true

    // ตรวจสอบว่ากรอกข้อมูลสำคัญครบไหม
    if (!courseCode || !courseName || !credits || !capacity) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    // บันทึกลงฐานข้อมูล
    const newCourse = await prisma.course.create({
      data: {
        courseCode,
        courseName,
        credits: Number(credits),
        capacity: Number(capacity),
        teacherId: teacherId || null, // ถ้าไม่ได้เลือกอาจารย์ จะเป็น null
        term: Number(term),
        year: Number(year),
        isOpen: isCourseOpen,
        schedule: schedule || "ยังไม่กำหนดเวลา"
      }
    })

    return NextResponse.json({ message: "เพิ่มรายวิชาสำเร็จ", course: newCourse }, { status: 201 })
  } catch (error: any) {
    // ดักจับ Error กรณีตั้งรหัสวิชาซ้ำ
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "รหัสวิชานี้มีอยู่ในระบบแล้ว" }, { status: 400 })
    }
    return NextResponse.json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, { status: 500 })
  }
}