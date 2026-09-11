"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"

export default function AddToCartBtn({ courseId, isFull, disabled }: { courseId: string, isFull: boolean, disabled?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/student/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      toast.success("เพิ่มลงตะกร้าสำเร็จ!")
      router.refresh() // รีเฟรชหน้าเพื่อให้ Navbar อัปเดตตัวเลขตะกร้า
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  if (isFull) {
    return (
      <Button disabled variant="secondary" className="w-full text-slate-500 bg-slate-100">
        ที่นั่งเต็มแล้ว
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={loading || disabled} 
      className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 transition-all"
    >
      <ShoppingCart className="w-4 h-4" />
      {loading ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
    </Button>
  )
}   