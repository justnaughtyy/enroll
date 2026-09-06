"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function EnrollButton({ courseId, isEnrolled, isFull }: { courseId: string, isEnrolled: boolean, isFull: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "เกิดข้อผิดพลาดในการลงทะเบียน")
        return
      }

      alert("ลงทะเบียนเรียนสำเร็จ!")
      router.refresh() // รีเฟรชหน้าเว็บเพื่ออัปเดตข้อมูลล่าสุด
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้")
    } finally {
      setLoading(false)
    }
  }

  if (isEnrolled) {
    return <Button variant="secondary" disabled className="bg-slate-200 text-slate-700">ลงทะเบียนแล้ว</Button>
  }

  if (isFull) {
    return <Button variant="destructive" disabled>ที่นั่งเต็ม</Button>
  }

  return (
    <Button onClick={handleEnroll} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700">
      {loading ? "กำลังบันทึก..." : "ลงทะเบียนเรียน"}
    </Button>
  )
}