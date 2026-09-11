import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditCourseForm from "./EditCourseForm"

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const { id } = await params

  // ดึงข้อมูลวิชาที่ต้องการแก้ไข
  const course = await prisma.course.findUnique({
    where: { id }
  })

  if (!course) {
    notFound() // ถ้าไม่เจอวิชา ให้แสดงหน้า 404
  }

  // ดึงรายชื่ออาจารย์ทั้งหมดมาแสดงใน Dropdown
  const teachers = await prisma.user.findMany({
    where: { role: "teacher" },
    select: { id: true, name: true }
  })

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">แก้ไขรายวิชา</h1>
        <p className="text-slate-500 text-sm mt-1">อัปเดตรายละเอียดและอาจารย์ผู้สอนของวิชา {course.courseCode}</p>
      </div>
      
      {/* โยนข้อมูลวิชาเดิม และรายชื่ออาจารย์ไปให้ Form */}
      <EditCourseForm course={course} teachers={teachers} />
    </div>
  )
}