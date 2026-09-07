import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import Image from "next/image"
import LoginForm from "@/components/ui/LoginForm" // ต้องแน่ใจว่า import path ถูกต้องนะครับ

export default async function LoginPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || "secret123"
      // ถ้ามี Token และยังไม่หมดอายุ ให้ข้ามไปหน้า Dashboard เลย
      jwt.verify(token, secret)
      redirect("/dashboard")
    } catch (err) {
      // ถ้า Token หมดอายุหรือพัง ระบบจะปล่อยผ่าน (ทำให้อยู่หน้า Login ต่อไปเพื่อล็อกอินใหม่)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/60 p-4 selection:bg-blue-600 selection:text-white">
      {/* กล่อง Card หลัก: เพิ่มเงาฟุ้งๆ และมุมโค้งมน */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        
        {/* ส่วน Header (Logo & Text) */}
        <div className="pt-8 px-8 pb-6 text-center border-b border-slate-50">
          <div className="flex justify-center mb-5">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white p-1 transition-transform hover:scale-105">
              <Image
                src="/psru.png" // ดึงโลโก้มหาวิทยาลัยมาแสดง
                alt="PSRU Logo"
                fill
                className="object-contain p-1"
                priority // โหลดรูปโลโก้ก่อนเป็นอันดับแรก
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">เข้าสู่ระบบ</h1>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            ระบบลงทะเบียนเรียน มหาวิทยาลัยราชภัฏพิบูลสงคราม
          </p>
        </div>

        {/* ส่วนของ Form Component ที่คุณแยกไว้ */}
        <div className="p-8 pt-6">
          <LoginForm />
        </div>

        {/* ส่วน Footer เล็กๆ ด้านล่างสุด */}
        <div className="py-4 bg-slate-50/50 text-center border-t border-slate-100">
          <p className="text-[13px] text-slate-500">
            มีปัญหาในการเข้าสู่ระบบ?{" "}
            <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-colors">
              ติดต่อผู้ดูแลระบบ
            </a>
          </p>
        </div>
        
      </div>
    </div>
  )
}