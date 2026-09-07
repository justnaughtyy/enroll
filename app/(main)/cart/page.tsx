import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ConfirmButton from "@/components/ui/ConfirmButton"
import RemoveCartButton from "@/components/ui/RemoveCartButton"
import { ShoppingCart, ArrowLeft, Clock, Award, CheckCircle2, BookOpen } from "lucide-react"

// const prisma = new PrismaClient()

export default async function CartPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) redirect("/login")

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123')
  const student = await prisma.student.findUnique({
    where: { studentId: decoded.studentId },
    include: { cartItems: { include: { course: true } } }
  })

  const totalCredits = student?.cartItems.reduce((sum, item) => sum + item.course.credits, 0) || 0

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Banner Summary Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-yellow-600" /> รายการวิชาในตะกร้าของคุณ
            </h2>
            <p className="text-sm text-slate-500">จัดการรายวิชาหรือกดยืนยันเพื่อบันทึกผลการลงทะเบียนเรียน</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-600 text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-yellow-600 font-medium">หน่วยกิตรวมในตะกร้า</p>
              <p className="text-lg font-bold text-yellow-900">{totalCredits} / 22 <span className="text-xs font-normal text-yellow-700">หน่วยกิต</span></p>
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="space-y-4">
          {student?.cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-700">ยังไม่มีรายวิชาในตะกร้า</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">คุณยังไม่ได้เลือกวิชาลงในตะกร้า ลองกลับไปค้นหาและเพิ่มรายวิชาที่ต้องการได้เลยครับ</p>
              </div>
              <Link href="/courses">
                <Button className="bg-yellow-600 hover:bg-yellow-700 mt-2 gap-2">
                  <BookOpen className="w-4 h-4" /> ไปหน้าค้นหารายวิชา
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {student?.cartItems.map((item) => (
                <Card key={item.id} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-lg font-semibold bg-yellow-50 text-yellow-700 rounded-md">
                          {item.course.courseCode}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-base text-lg">{item.course.courseName}</h4>
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-4 pt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {item.course.scheduleDay} ({item.course.startTime} - {item.course.endTime})</span>
                        <span>•</span>
                        <span>หน่วยกิต: <strong className="text-slate-700">{item.course.credits}</strong></span>
                        <span>•</span>
                        <span>อาจารย์: {item.course.instructor}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-end pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                      <RemoveCartButton cartItemId={item.id} />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Confirm Action Bar */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>ระบบได้ตรวจสอบเงื่อนไขเวลาเรียนและหน่วยกิตเบื้องต้นเรียบร้อยแล้ว เมื่อกดยืนยันระบบจะตัดโควต้าที่นั่งทันที</span>
                </div>
                <ConfirmButton />
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}