import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CartButton from "@/components/ui/CartButton"
import { Search, BookOpen, Clock, User, Users, ShoppingCart, ArrowLeft, GraduationCap } from "lucide-react"

// const prisma = new PrismaClient()

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) redirect("/login")

  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.q || ""

  const secret = process.env.JWT_SECRET || "secret123"
  const decoded: any = jwt.verify(token, secret)
  
  const student = await prisma.student.findUnique({
    where: { studentId: decoded.studentId },
    include: { enrollments: true, cartItems: true }
  })

  // ค้นหารายวิชาด้วยรหัสวิชาหรือชื่อวิชา[cite: 1]
  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { courseCode: { contains: query } },
        { courseName: { contains: query } }
      ]
    }
  })

  const enrolledIds = student?.enrollments.map(e => e.courseId) || []
  const cartIds = student?.cartItems.map(c => c.courseId) || []
  const cartCount = student?.cartItems.length || 0

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Search Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center"><BookOpen className="w-10 h-10 text-yellow-600 md:hidden" /></div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-600 hidden md:block" /> <span className="text-center md:text-left">ค้นหารายวิชาสำหรับลงทะเบียน</span>
            </h2>
            <p className="text-sm text-slate-500">พิมพ์รหัสวิชา (เช่น CSI101) หรือชื่อวิชาเพื่อกรองข้อมูลรายวิชาที่ต้องการ</p>
          </div>

          <form method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                name="q" 
                defaultValue={query} 
                placeholder="ค้นหาด้วยรหัสวิชา หรือชื่อวิชา..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all"
              />
            </div>
            <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 px-6 py-5 font-semibold">
              ค้นหา
            </Button>
          </form>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center text-sm text-slate-500 px-1">
          <p className="text-lg">ผลการค้นหา: พบทั้งหมด <span className="font-semibold text-lg text-slate-800">{courses.length}</span> รายวิชา</p>
          {query && (
            <Link href="/courses" className="text-yellow-600 hover:underline text-sm">
              ล้างการค้นหา
            </Link>
          )}
        </div>

        {/* Course List Grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-slate-700">ไม่พบรายวิชาที่คุณค้นหา</h3>
              <p className="text-sm text-slate-400">ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง หรือตรวจสอบตัวสะกด</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => {
              const isEnrolled = enrolledIds.includes(course.id)
              const inCart = cartIds.includes(course.id)
              const isFull = course.enrolled >= course.capacity

              return (
                <Card key={course.id} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="flex flex-col md:flex-row items-start justify-between pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-lg font-semibold bg-yellow-50 text-yellow-700 rounded-md">
                          {course.courseCode}
                        </span>
                        <CardTitle className="text-lg font-bold text-slate-800">
                          {course.courseName}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-sm text-slate-500 pt-1 flex items-center gap-3">
                        <span className="text-sm">หน่วยกิต: <strong className="text-slate-700 text-sm">{course.credits}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-sm"><User className="w-3.5 h-3.5 text-slate-400" /> {course.instructor}</span>
                      </CardDescription>
                    </div>

                    <span className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-1.5 ${
                      isFull ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      <Users className="w-3.5 h-3.5" /> {course.enrolled} / {course.capacity}
                    </span>
                  </CardHeader>

                  <CardContent className="text-sm text-slate-600 pb-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">วันเรียน: <strong className="text-slate-700">{course.scheduleDay}</strong> เวลา <strong className="text-slate-700">{course.startTime} - {course.endTime} น.</strong></span>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-slate-50/40 py-3 flex justify-end border-t border-slate-100">
                    <CartButton courseId={course.id} isEnrolled={isEnrolled} inCart={inCart} isFull={isFull} />
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}