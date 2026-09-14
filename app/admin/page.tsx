import { prisma } from "@/lib/prisma"
import { Users, BookOpen, UserCheck, GraduationCap, Activity } from "lucide-react"
import AdminChart from "./AdminChart"

export default async function AdminDashboardPage() {
  // 1. ดึงข้อมูลพื้นฐาน (ตาม Requirement)
  const totalStudents = await prisma.user.count({ where: { role: "student" } })
  const totalCourses = await prisma.course.count()
  
  // ข้อมูลเสริมที่ใส่มาให้ดูครบถ้วน
  const totalTeachers = await prisma.user.count({ where: { role: "teacher" } })
  const totalUsers = await prisma.user.count()

  // 2. Logic หา "เทอมปัจจุบัน" (หาจากวิชาที่ปีและเทอมล่าสุดในระบบ)
  const latestCourse = await prisma.course.findFirst({
    orderBy: [
      { year: 'desc' },
      { term: 'desc' }
    ]
  })

  let enrolledStudentsCount = 0
  let currentTermLabel = "ยังไม่มีข้อมูล"

  if (latestCourse) {
    currentTermLabel = `${latestCourse.term}/${latestCourse.year}`
    
    // นับจำนวนนักศึกษา "แบบไม่ซ้ำคน" (Distinct) ที่ลงทะเบียนในเทอมปัจจุบัน
    const enrolledStudents = await prisma.enrollment.groupBy({
      by: ['userId'],
      where: {
        course: {
          term: latestCourse.term,
          year: latestCourse.year
        }
      }
    })
    enrolledStudentsCount = enrolledStudents.length
  }

  // 3. คำนวณเปอร์เซ็นต์ (%) ของคนที่ลงทะเบียนแล้ว
  const enrolledPercentage = totalStudents > 0 
    ? Math.round((enrolledStudentsCount / totalStudents) * 100) 
    : 0

  // 4. ดึงข้อมูลวิชาเพื่อมาทำกราฟ (Option เสริมตาม Requirement)
  const coursesForChart = await prisma.course.findMany({
    include: { _count: { select: { enrollments: true } } },
    orderBy: { courseCode: 'asc' }
  })

  const chartData = coursesForChart.map(course => ({
    name: course.courseCode,
    enrollments: course._count.enrollments,
    capacity: course.capacity
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-800">ภาพรวมระบบ (Admin Dashboard)</h1>
        <p className="text-slate-500 mt-1">สถิติการใช้งานและข้อมูลการลงทะเบียนเรียน</p>
      </div>

      {/* 🌟 กล่องสถิติตาม Requirement เป๊ะๆ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Requirement ข้อ 1: จำนวนนักศึกษาทั้งหมด */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">นักศึกษาทั้งหมดในระบบ</p>
            <p className="text-3xl font-bold text-slate-800">{totalStudents} <span className="text-base font-normal text-slate-500">คน</span></p>
          </div>
        </div>

        {/* Requirement ข้อ 2: จำนวนที่ลงทะเบียนเทอมปัจจุบัน + เปอร์เซ็นต์ */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl border border-blue-800 shadow-md flex items-center gap-4 text-white relative overflow-hidden">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm z-10">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div className="z-10 w-full">
            <div className="flex justify-between items-start">
              <p className="text-blue-100 text-sm font-medium">ลงทะเบียนแล้ว (เทอม {currentTermLabel})</p>
              <span className="bg-white text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                {enrolledPercentage}%
              </span>
            </div>
            <p className="text-3xl font-bold mt-1">{enrolledStudentsCount} <span className="text-base font-medium text-blue-100">คน</span></p>
          </div>
          {/* พื้นหลังตกแต่งกล่อง */}
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Activity className="w-32 h-32" />
          </div>
        </div>

        {/* Requirement ข้อ 3: จำนวนรายวิชาทั้งหมด */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-full text-purple-600">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">รายวิชาที่เปิดสอนทั้งหมด</p>
            <p className="text-3xl font-bold text-slate-800">{totalCourses} <span className="text-base font-normal text-slate-500">วิชา</span></p>
          </div>
        </div>
      </div>

      {/* กล่องข้อมูลเสริม (อาจารย์ และ ผู้ใช้งาน) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3 text-slate-600">
            <UserCheck className="w-5 h-5" />
            <span className="font-medium">จำนวนอาจารย์ทั้งหมด</span>
          </div>
          <span className="font-bold text-lg text-slate-800">{totalTeachers} คน</span>
        </div>
        <div className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3 text-slate-600">
            <Users className="w-5 h-5" />
            <span className="font-medium">ผู้ใช้งานรวมทั้งระบบ</span>
          </div>
          <span className="font-bold text-lg text-slate-800">{totalUsers} บัญชี</span>
        </div>
      </div>

      {/* Requirement ข้อ 4: กราฟสถิติสรุป */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-2">สถิติการลงทะเบียนแยกตามรายวิชา</h2>
        <p className="text-sm text-slate-500 mb-6">เปรียบเทียบจำนวนนักศึกษาที่ลงทะเบียนจริง กับ จำนวนที่นั่งที่เปิดรับ</p>
        
        <AdminChart data={chartData} />
      </div>

    </div>
  )
}