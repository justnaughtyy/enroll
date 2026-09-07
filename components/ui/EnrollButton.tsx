"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner" // 1. นำเข้า toast จาก sonner

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
        // ❌ แทนที่ alert() ด้วย toast.error
        toast.error("ทำรายการไม่สำเร็จ", {
          description: data.message || "เกิดข้อผิดพลาดในการลงทะเบียน",
        })
        return
      }

      // ✅ แทนที่ alert() แจ้งเตือนสำเร็จ ด้วย toast.success
      toast.success("ลงทะเบียนเรียนสำเร็จ!", {
        description: "ระบบได้บันทึกข้อมูลของคุณเรียบร้อยแล้ว",
      })
      
      router.refresh() // รีเฟรชหน้าเว็บเพื่ออัปเดตข้อมูลล่าสุด (เช่น เปลี่ยนปุ่มเป็นสีเทา "ลงทะเบียนแล้ว")
    } catch (err) {
      // ❌ เปลี่ยน alert() ใน catch เป็น toast.error
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ", {
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setLoading(false)
    }
  }

  // ปรับแต่งปุ่มกรณีต่างๆ เล็กน้อยให้ตัวหนังสือชัดเจนขึ้น (font-medium)
  if (isEnrolled) {
    return <Button variant="secondary" disabled className="bg-slate-200 text-slate-700 font-medium">ลงทะเบียนแล้ว</Button>
  }

  if (isFull) {
    return <Button variant="destructive" disabled className="font-medium">ที่นั่งเต็ม</Button>
  }

  return (
    <Button 
      onClick={handleEnroll} 
      disabled={loading} 
      className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-colors"
    >
      {loading ? "กำลังบันทึก..." : "ลงทะเบียนเรียน"}
    </Button>
  )
}