import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import LoginForm from "@/components/ui/LoginForm"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  // ถ้ามี Token อยู่แล้ว ให้ดีดไปหน้า Dashboard ทันที
  if (token) {
    try {
      const secret = process.env.JWT_SECRET || "secret123"
      jwt.verify(token, secret)
      redirect("/dashboard")
    } catch (err) {
      // ถ้า Token ไม่ถูกต้อง ปล่อยให้อยู่หน้า Login
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">ระบบลงทะเบียนเรียน</h1>
          <p className="text-sm text-slate-500">มหาวิทยาลัยราชภัฏพิบูลสงคราม</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}