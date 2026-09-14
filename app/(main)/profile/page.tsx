import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { redirect } from "next/navigation"
import { User, Mail, Shield, Building, BookOpen, Activity, Fingerprint } from "lucide-react"

export default async function ProfilePage() {
  // 1. ดึง Token เพื่อยืนยันตัวตน
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  
  if (!token) {
    redirect("/login") // ถ้าไม่มี Token ให้เด้งไปหน้า Login
  }

  let userId = ""
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret123")
    userId = decoded.userId
  } catch (error) {
    redirect("/login")
  }

  // 2. ดึงข้อมูลผู้ใช้จาก Database
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    redirect("/login")
  }

  // 3. แปลง Role เป็นภาษาไทยให้ดูสวยงาม
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "ผู้ดูแลระบบ (Admin)"
      case "teacher": return "อาจารย์ (Teacher)"
      case "student": return "นักศึกษา (Student)"
      default: return role
    }
  }


  let joinedDate = "ไม่ระบุ"
  if (user.createdAt) {
    try {
      joinedDate = new Intl.DateTimeFormat("th-TH", {
        dateStyle: "long",
      }).format(new Date(user.createdAt))
    } catch (error) {
      joinedDate = "ไม่ระบุ"
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">ข้อมูลส่วนตัว (Profile)</h1>
        <p className="text-slate-500 mt-1">ตรวจสอบและจัดการข้อมูลบัญชีผู้ใช้ของคุณ</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* ส่วนหัวของ Profile (Cover & Avatar) */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12 sm:-mt-16 mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full p-1.5 shadow-md">
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=2563eb`} 
                alt={user.name}
                className="w-full h-full rounded-full object-cover shadow-inner"
              />
            </div>
            <div className="text-center sm:text-left pb-2">
              <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-blue-600 font-medium">{getRoleLabel(user.role)}</p>
            </div>
          </div>

          <hr className="border-slate-100 mb-8" />

          {/* ส่วนแสดงข้อมูล */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* กล่องข้อมูลบัญชี (แสดงทุกคน) */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                ข้อมูลบัญชี
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">ชื่อผู้ใช้งาน / รหัสประจำตัว</p>
                    <p className="text-slate-800 font-medium">{user.username}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">อีเมล (Email)</p>
                    <p className="text-slate-800 font-medium">{user.email || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">วันที่เข้าร่วมระบบ</p>
                    <p className="text-slate-800 font-medium">{joinedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* กล่องข้อมูลการศึกษา (แสดงเฉพาะนักศึกษา) */}
            {user.role === "student" && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  ข้อมูลการศึกษา
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">คณะ (Faculty)</p>
                      <p className="text-slate-800 font-medium">{user.faculty || "ยังไม่ระบุ"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">สาขาวิชา (Major)</p>
                      <p className="text-slate-800 font-medium">{user.major || "ยังไม่ระบุ"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">สถานภาพนักศึกษา</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        user.studentStatus === "ปกติ" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {user.studentStatus || "ปกติ"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
      
    </div>
  )
}