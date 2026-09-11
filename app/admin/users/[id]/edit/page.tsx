import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditUserForm from "./EditUserForm"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const { id } = await params

  // ดึงข้อมูลผู้ใช้ที่ต้องการแก้ไข
  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!user) {
    notFound() 
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">แก้ไขข้อมูลผู้ใช้งาน</h1>
        <p className="text-slate-500 text-sm mt-1">อัปเดตข้อมูลส่วนตัว หรือรีเซ็ตรหัสผ่าน</p>
      </div>
      
      {/* โยนข้อมูลผู้ใช้ไปให้ Form */}
      <EditUserForm user={user} />
    </div>
  )
}