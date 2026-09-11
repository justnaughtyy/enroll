import { prisma } from "@/lib/prisma"
import CourseForm from "./CourseForm"

export default async function CreateCoursePage() {
  // ดึงเฉพาะ User ที่มี Role เป็น "teacher"
  const teachers = await prisma.user.findMany({
    where: { role: "teacher" },
    select: { id: true, name: true }
  })

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">เพิ่มรายวิชาใหม่</h1>
        <p className="text-slate-500 text-sm mt-1">กำหนดรายละเอียดรายวิชาและมอบหมายอาจารย์ผู้สอน</p>
      </div>
      
      {/* เรียกใช้งาน Client Component แบบส่งข้อมูลอาจารย์ไปให้ */}
      <CourseForm teachers={teachers} />
    </div>
  )
}