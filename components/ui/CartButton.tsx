"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

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
        alert(data.message)
        return
      }
      alert("เพิ่มลงตะกร้าสำเร็จ!")
      router.refresh()
    } catch (err) {
      alert("เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  if (isEnrolled) return <Button variant="secondary" disabled>ลงทะเบียนแล้ว</Button>
  if (inCart) return <Button variant="outline" disabled className="text-yellow-600 border-yellow-200 bg-yellow-50">อยู่ในตะกร้าแล้ว</Button>
  if (isFull) return <Button variant="destructive" disabled>ที่นั่งเต็ม</Button>

  return (
    <Button onClick={handleAddToCart} disabled={loading} className="py-5 bg-yellow-600 hover:bg-yellow-700">
      {loading ? "กำลังเพิ่ม..." : "+ เพิ่มลงตะกร้า"}
    </Button>
  )
}