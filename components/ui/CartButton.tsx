"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner" // 1. นำเข้า toast จาก sonner

export default function CartButton({ courseId, isEnrolled, inCart, isFull }: { courseId: string, isEnrolled: boolean, inCart: boolean, isFull: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        // ❌ เปลี่ยนจาก alert(data.message) เป็น toast.error
        toast.error("ไม่สามารถเพิ่มลงตะกร้าได้", {
          description: data.message || "เกิดข้อผิดพลาดในการเพิ่มรายวิชา",
        })
        return
      }
      
      // ✅ เปลี่ยนจาก alert("เพิ่มลงตะกร้าสำเร็จ!") เป็น toast.success
      toast.success("เพิ่มลงตะกร้าสำเร็จ!", {
        description: "รายวิชาถูกเก็บไว้ในตะกร้าของคุณเรียบร้อยแล้ว",
      })
      router.refresh()
      
    } catch (err) {
      // ❌ เปลี่ยนจาก alert() ใน catch เป็น toast.error
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ", {
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setLoading(false)
    }
  }

  // ปรับเพิ่ม font-medium ให้ตัวอักษรบนปุ่มอ่านง่ายและคมชัดขึ้น
  if (isEnrolled) {
    return <Button variant="secondary" disabled className="font-medium text-slate-700">ลงทะเบียนแล้ว</Button>
  }
  
  if (inCart) {
    return <Button variant="outline" disabled className="text-yellow-600 border-yellow-200 bg-yellow-50 font-medium">อยู่ในตะกร้าแล้ว</Button>
  }
  
  if (isFull) {
    return <Button variant="destructive" disabled className="font-medium">ที่นั่งเต็ม</Button>
  }

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={loading} 
      className="py-5 bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-colors"
    >
      {loading ? "กำลังเพิ่ม..." : "+ เพิ่มลงตะกร้า"}
    </Button>
  )
}