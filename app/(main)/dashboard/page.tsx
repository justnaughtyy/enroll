import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import DropButton from "@/components/ui/DropButton"
import { BookOpen, User, GraduationCap, Clock, Calendar, LogOut, Plus, Award } from "lucide-react"

// const prisma = new PrismaClient()

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) redirect("/login")

  let studentId = ""
  try {
    const secret = process.env.JWT_SECRET || "secret123"
    const decoded: any = jwt.verify(token, secret)
    studentId = decoded.studentId
  } catch (err) {
    redirect("/login")
  }

  const student = await prisma.student.findUnique({
    where: { studentId },
    include: {
      enrollments: {
        include: { course: true }
      }
    }
  })

  if (!student) redirect("/login")

  const totalEnrolledCredits = student.enrollments.reduce((sum, item) => sum + item.course.credits, 0)

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-6">

        {/* Welcome Banner Card */}
        <div className="bg-gradient-to-r from-zinc-900 to-neutral-500 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-100">
              <User className="w-3.5 h-3.5" /> รหัสนักศึกษา: {student.studentId}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-blue-100 text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> คณะ{student.faculty}
            </p>
          </div>

          {/* <div className="flex gap-2">
            <Link href="/cart">
              <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md font-semibold gap-2">
                🛒 ตะกร้าของฉัน
              </Button>
            </Link>
            <Link href="/courses">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-md gap-2">
                <Plus className="w-4 h-4" /> ค้นหาและลงทะเบียน
              </Button>
            </Link>
          </div> */}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">รายวิชาที่ลงทะเบียนแล้ว</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{student.enrollments.length} <span className="text-sm font-normal text-slate-400">วิชา</span></div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">หน่วยกิตรวมในภาคเรียนนี้</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {totalEnrolledCredits} <span className="text-sm font-normal text-slate-400">/ 22 หน่วยกิต</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-600" /> ตารางเรียนและรายวิชาที่ลงทะเบียน
            </h3>
          </div>

          {student.enrollments.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-700">ยังไม่มีรายวิชาที่ลงทะเบียน</h4>
                  <p className="text-sm text-slate-400 max-w-sm">คุณยังไม่ได้ลงทะเบียนเรียนในเทอมนี้ เริ่มต้นค้นหาและจัดตารางเรียนกันได้เลย</p>
                </div>
                <Link href="/courses">
                  <Button size="lg" className="mt-2 bg-yellow-600 hover:bg-yellow-700 gap-2">
                    <Plus className="w-4 h-4" /> ไปหน้าค้นหารายวิชา
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {student.enrollments.map((item) => (
                <Card key={item.id} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md">
                          {item.course.courseCode}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-base">{item.course.courseName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-4 pt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {item.course.scheduleDay} ({item.course.startTime} - {item.course.endTime})</span>
                        <span>•</span>
                        <span>หน่วยกิต: {item.course.credits}</span>
                        <span>•</span>
                        <span>อาจารย์: {item.course.instructor}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                      <span className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                        ลงทะเบียนสำเร็จ
                      </span>
                      <DropButton enrollmentId={item.id} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}