"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function DeleteUserBtn({ id, name }: { id: string, name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${name}" ?\n(ข้อมูลการลงทะเบียนหรือวิชาที่สอนจะถูกยกเลิกด้วย)`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success("ลบผู้ใช้งานสำเร็จ!")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการลบ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      disabled={loading}
      className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
      title="ลบผู้ใช้งาน"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}