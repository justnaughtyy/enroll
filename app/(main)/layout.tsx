import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { LayoutDashboard, Search, ShoppingCart } from "lucide-react"
import UserProfile from "@/components/ui/UserProfile"
import Image from "next/image"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  
  if (!token) redirect("/login")

  let user: any = null
  try {
    const secret = process.env.JWT_SECRET || "secret123"
    const decoded: any = jwt.verify(token, secret)
    user = await prisma.user.findUnique({ where: { id: decoded.userId } })

    // 🚨 ดักจับ Role: ป้องกันไม่ให้อาจารย์ หรือ แอดมิน แอบเข้ามาใช้ Layout ของนักศึกษา 🚨
    if (!user) redirect("/login")
    if (user.role === "admin") redirect("/admin/courses") // ถ้าแอดมินหลงมา เตะไปหน้าจัดการวิชา
    if (user.role === "teacher") redirect("/teacher")     // ถ้าอาจารย์หลงมา เตะไปหน้า Teacher Dashboard

  } catch (err) {
    redirect("/login")
  }

  // ดึงจำนวนวิชาที่อยู่ในตะกร้า (Cart Badge)
  const cartCount = await prisma.cartItem.count({
    where: { userId: user.id }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 🌟 Top Navbar สำหรับนักศึกษา */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-22">
            
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative w-20 h-20 rounded-md overflow-hidden bg-white flex-shrink-0">
                <Image src="/psrubw.jpg" alt="Logo" fill className="object-contain p-1" />
              </div>
              <span className="font-bold text-slate-800 text-lg hidden sm:block">PSRU Enrollment</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                การเรียนของฉัน
              </Link>
              <Link href="/courses" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
                <Search className="w-4 h-4" />
                ค้นหารายวิชา
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-yellow-500 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              
              {/* Profile Dropdown พร้อมปุ่ม Logout */}
              <UserProfile name={user.name} role={user.role} />
            </div>

          </div>
        </div>
      </header>

      {/* 🌟 พื้นที่แสดงเนื้อหาของหน้า Dashboard, Courses, Cart */}
      <main className="pb-12 pt-8">
        {children}
      </main>
      
    </div>
  )
}