import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ChevronLeft, Users, BookOpen } from "lucide-react"
import GradingTable from "./GradingTable"

export default async function TeacherCourseDetailPage({ params }: { params: { id: string } }) {
  const { id: courseId } = await params

  // 1. ถอดรหัส Token เพื่อดึง ID ของอาจารย์ที่ล็อกอินอยู่
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) redirect("/login")
  
  let userId = ""
  try {
    const secret = process.env.JWT_SECRET || "secret123"
    const decoded: any = jwt.verify(token, secret)
    userId = decoded.userId
  } catch (err) {
    redirect("/login")
  }

  // 2. ดึงข้อมูลวิชา พร้อมรายชื่อนักศึกษา (ดึงจากตาราง Enrollment ทะลุไปหา User)
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      enrollments: {
        include: { user: true }, // ดึงข้อมูลนักศึกษามาด้วย
        orderBy: { user: { username: 'asc' } } // เรียงตามรหัสนักศึกษา (username)
      }
    }
  })

  // ถ้าไม่เจอวิชานี้ในระบบ
  if (!course) notFound()

  // 🛡️ ป้องกันความปลอดภัย: ถ้าวิชานี้ไม่ได้สอนโดยอาจารย์คนที่ล็อกอินอยู่ ให้เตะกลับไปหน้าแรก
  if (course.teacherId !== userId) {
    redirect("/teacher")
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* ปุ่มย้อนกลับ */}
      <Link href="/teacher" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        กลับไปหน้ารายวิชาทั้งหมด
      </Link>

      {/* ส่วนหัวแสดงรายละเอียดวิชา */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-bold text-sm">
                {course.courseCode}
              </span>
              <span className="text-sm font-medium text-slate-500">
                ภาคเรียน {course.term}/{course.year}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{course.courseName}</h1>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              <div className="text-sm">
                <p className="text-slate-500">จำนวนผู้เรียน</p>
                <p className="font-semibold text-slate-800">{course.enrollments.length} / {course.capacity} คน</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ตารางให้เกรด (เรียกใช้ Client Component) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <GradingTable enrollments={course.enrollments} />
      </div>

    </div>
  )
}