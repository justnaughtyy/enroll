"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner" // หรือใช้ไลบรารี Alert ที่คุณมี

export default function DeleteCourseBtn({ id, name }: { id: string, name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    // มีแจ้งเตือน Confirm ก่อนลบเพื่อความปลอดภัย
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบวิชา "${name}" ?`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      toast.success("ลบรายวิชาสำเร็จ!")
      router.refresh() // สั่งให้รีเฟรชตารางข้อมูลใหม่
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการลบ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      disabled={loading}
      className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
      title="ลบรายวิชา"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}