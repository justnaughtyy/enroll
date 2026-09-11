import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Users, BookOpen, ChevronRight } from "lucide-react"

export default async function TeacherDashboard() {
  // 1. ตรวจสอบการเข้าสู่ระบบและดึงข้อมูล userId จาก Token
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) redirect("/login")

  let userId = ""
  try {
    const secret = process.env.JWT_SECRET || "secret123"
    const decoded: any = jwt.verify(token, secret)
    
    // ถ้าไม่ใช่ teacher ให้เด้งกลับไปหน้า dashboard รวมเพื่อคัดกรองใหม่
    if (decoded.role !== "teacher") redirect("/dashboard")
    userId = decoded.userId
  } catch (err) {
    redirect("/login")
  }

  // 2. ดึงข้อมูลรายวิชา "เฉพาะที่อาจารย์คนนี้สอน"
  const myCourses = await prisma.course.findMany({
    where: { teacherId: userId },
    include: {
      _count: { select: { enrollments: true } } // นับจำนวนเด็กที่ลงทะเบียนมาด้วย
    },
    orderBy: { courseCode: 'asc' }
  })

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* ส่วนหัว */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            รายวิชาที่สอน (My Courses)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            เลือกรายวิชาเพื่อดูรายชื่อนักศึกษาและบันทึกผลการเรียน
          </p>
        </div>
      </div>

      {/* Grid แสดงการ์ดรายวิชา */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCourses.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200">
            <p className="text-slate-500">ยังไม่มีรายวิชาที่ได้รับมอบหมายในเทอมนี้</p>
          </div>
        ) : (
          myCourses.map((course) => (
            <Link 
              key={course.id} 
              href={`/teacher/courses/${course.id}`} // ลิงก์ไปหน้ารายชื่อนักศึกษา (เดี๋ยวเราจะสร้างกัน)
              className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 group-hover:bg-blue-50/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-slate-700 font-bold text-xs border border-slate-200 shadow-sm">
                    {course.courseCode}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2 py-1 rounded-md">
                    เทอม {course.term}/{course.year}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 text-lg line-clamp-2 mt-2 group-hover:text-blue-700 transition-colors">
                  {course.courseName}
                </h3>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>ผู้เรียน: <strong className="text-slate-800">{course._count.enrollments}</strong> / {course.capacity}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  )
}