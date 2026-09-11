import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import UserProfile from "@/components/ui/UserProfile"
import AdminSidebar from "./AdminSidebar" // ✅ นำเข้า Sidebar ตัวใหม่

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  
  if (!token) redirect("/login")

  let user: any = null
  try {
    const secret = process.env.JWT_SECRET || "secret123"
    const decoded: any = jwt.verify(token, secret)
    
    user = await prisma.user.findUnique({ where: { id: decoded.userId } })

    if (!user || user.role !== "admin") {
      redirect("/dashboard") 
    }
  } catch (err) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* ✅ เรียกใช้ Sidebar แบบ Responsive */}
      <AdminSidebar />

      {/* Main Content */}
      {/* เปลี่ยนจาก ml-64 เป็น md:ml-64 เพื่อให้เนื้อหาเต็มจอในมือถือ */}
      <main className="flex-1 md:ml-64 min-w-0 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Topbar */}
        {/* เพิ่ม pl-16 ในจอมือถือ เพื่อเว้นที่ว่างให้ปุ่ม Hamburger */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-4 md:px-8 pl-16 md:pl-8 sticky top-0 z-40">
          <h2 className="text-slate-500 font-medium text-sm hidden sm:block">ระบบจัดการข้อมูล PSRU Enrollment</h2>
          <h2 className="text-slate-500 font-medium text-sm sm:hidden">Admin Panel</h2>
          
          <UserProfile name={user.name} role={user.role} /> 
        </header>
        
        {/* เนื้อหา */}
        <div className="p-0">
          {children}
        </div>
      </main>
      
    </div>
  )
}