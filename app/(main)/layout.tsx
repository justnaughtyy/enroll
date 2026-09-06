import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, ShoppingCart, Search, BookOpen } from "lucide-react"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import Image from "next/image"

// const prisma = new PrismaClient()

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) redirect("/login")

  let cartCount = 0
  try {
    const secret = process.env.JWT_SECRET || "secret123"
    const decoded: any = jwt.verify(token, secret)

    const student = await prisma.student.findUnique({
      where: { studentId: decoded.studentId },
      include: { cartItems: true }
    })

    cartCount = student?.cartItems?.length || 0
  } catch (err) {
    cookieStore.delete("token")
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12 selection:bg-yellow-600 selection:text-white">
      {/* Navbar พรีเมียม: ขอบบาง เงานุ่มนวล และติดตรึงด้านบน */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* ฝั่งซ้าย: โลโก้และชื่อระบบ */}
          <Link href="/dashboard" className="flex items-center gap-3.5 group py-2">
            <div className="relative w-15 h-15 rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
              <Image
                src="/psrubw.jpg"
                alt="PSRU Logo"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 md:text-md tracking-tight group-hover:text-yellow-600 transition-colors">
                ระบบลงทะเบียนเรียน
              </span>
              <span className="text-[16px] font-medium text-slate-400">
                PSRU Enrollment
              </span>
            </div>
          </Link>

          {/* ฝั่งขวา: เมนูกดใช้งาน & โปรไฟล์ */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* เมนูค้นหารายวิชา (ทำเป็นปุ่มลิงก์สไตล์ Modern Pill) */}
            <Link 
              href="/courses"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">ค้นหารายวิชา</span>
            </Link>

            {/* ปุ่มตะกร้าสินค้า (แสดง Badge จำนวนวิชาชัดเจน) */}
            <Link href="/cart">
              <Button 
                variant="outline" 
                size="sm" 
                className="relative h-9 px-3.5 gap-2 border-slate-200/80 hover:bg-slate-100/80 text-slate-700 font-medium transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-yellow-600" />
                {/* <span className="hidden sm:inline">ตะกร้า</span> */}
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white animate-in zoom-in-50">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* เส้นคั่นแนวตั้งเบาๆ แยกส่วนระบบ กับส่วนออกจากระบบ */}
            <div className="h-5 w-[1px] bg-slate-200 mx-1" />

            {/* ปุ่มออกจากระบบ (ปรับสัดส่วนให้พอดี ไม่ใหญ่เทอะทะ) */}
            <form action="/api/logout" method="POST" className="inline">
              <Button 
                type="submit" 
                variant="ghost" 
                size="sm" 
                className="h-9 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50/80 gap-1.5 font-medium transition-all"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline text-sm">ออก</span>
              </Button>
            </form>

          </div>
        </div>
      </header>

      {/* เนื้อหาหลักของแต่ละหน้า */}
      <main className="max-w-6xl mx-auto px-6 mt-8">
        {children}
      </main>
    </div>
  )
}