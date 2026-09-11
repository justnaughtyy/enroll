"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

// ปุ่มลบทีละวิชา
export function RemoveCartBtn({ cartItemId }: { cartItemId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/student/cart/${cartItemId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("ลบไม่สำเร็จ")
      
      toast.success("ลบออกจากตะกร้าแล้ว")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleRemove} disabled={loading} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto">
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}

// ปุ่มยืนยันการลงทะเบียนทั้งหมด
export function ConfirmEnrollmentBtn() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการยืนยันการลงทะเบียนเรียน?")) return

    setLoading(true)
    try {
      const res = await fetch("/api/student/enroll", { method: "POST" })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message)
      
      toast.success("ลงทะเบียนเรียนสำเร็จ!")
      router.push("/dashboard") // กลับไปหน้า Dashboard ดูผลการเรียน
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleConfirm} disabled={loading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2 shadow-md">
      <CheckCircle className="w-5 h-5" />
      {loading ? "กำลังดำเนินการ..." : "ยืนยันการลงทะเบียนเรียน"}
    </Button>
  )
}