"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function EditUserForm({ user }: { user: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      
      toast.success("อัปเดตข้อมูลสำเร็จ!")
      router.push("/admin/users") 
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการอัปเดต")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
        <Input name="name" defaultValue={user.name} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">ชื่อผู้ใช้ (Username)</label>
          <Input name="username" defaultValue={user.username} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">รหัสผ่านใหม่ (ไม่บังคับ)</label>
          <Input name="password" type="password" placeholder="ปล่อยว่างไว้หากใช้รหัสเดิม" />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-sm font-medium text-slate-700">สิทธิ์การใช้งาน (Role)</label>
        <select 
          name="role" 
          defaultValue={user.role}
          required
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        >
          <option value="student">นักศึกษา (Student)</option>
          <option value="teacher">อาจารย์ (Teacher)</option>
          <option value="admin">ผู้ดูแลระบบ (Admin)</option>
        </select>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>ยกเลิก</Button>
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? "กำลังบันทึก..." : "อัปเดตข้อมูล"}
        </Button>
      </div>
    </form>
  )
}