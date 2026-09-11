import { prisma } from "@/lib/prisma" // ตรวจสอบ path ให้ตรงกับโปรเจกต์คุณ
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, CheckCircle } from "lucide-react"

export default async function AdminDashboard() {
  // 1. หาจำนวนนักศึกษาทั้งหมด (นับเฉพาะคนที่มี role = 'student')
  const totalStudents = await prisma.user.count({
    where: { role: "student" },
  })

  // 2. หาจำนวนรายวิชาทั้งหมดที่เปิดสอน
  const totalCourses = await prisma.course.count()

  // 3. หาจำนวนนักศึกษาที่ลงทะเบียนแล้วในเทอมปัจจุบัน (สมมติว่าเป็นเทอม 1/2566)
  // ใช้ groupBy เพื่อหา userId ที่ไม่ซ้ำกันในตาราง Enrollment
  const enrolledStudents = await prisma.enrollment.groupBy({
    by: ["userId"],
    where: { term: 1, year: 2566 },
  })
  
  const totalEnrolled = enrolledStudents.length
  
  // 4. คำนวณเปอร์เซ็นต์การลงทะเบียน
  const enrollPercentage = totalStudents > 0 
    ? ((totalEnrolled / totalStudents) * 100).toFixed(1) 
    : "0.0"

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2">ภาพรวมระบบลงทะเบียนเรียน มหาวิทยาลัยราชภัฏพิบูลสงคราม</p>
      </div>

      {/* ส่วนแสดงการ์ดสถิติ */}
      <div className="grid gap-4 md:grid-cols-3">
        
        {/* การ์ด: จำนวนนักศึกษาทั้งหมด */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              นักศึกษาทั้งหมด
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">คนในระบบ</p>
          </CardContent>
        </Card>

        {/* การ์ด: จำนวนรายวิชาทั้งหมด */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              รายวิชาที่เปิดสอน
            </CardTitle>
            <BookOpen className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{totalCourses}</div>
            <p className="text-xs text-slate-500 mt-1">วิชาในเทอมนี้</p>
          </CardContent>
        </Card>

        {/* การ์ด: นักศึกษาที่ลงทะเบียนแล้ว */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              นักศึกษาที่ลงทะเบียนแล้ว
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{totalEnrolled}</div>
            <p className="text-xs text-slate-500 mt-1">
              คิดเป็น <span className="font-semibold text-emerald-600">{enrollPercentage}%</span> ของทั้งหมด
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}