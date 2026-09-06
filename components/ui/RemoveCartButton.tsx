"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function RemoveCartButton({ cartItemId }: { cartItemId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    if (!confirm("ต้องการลบรายวิชานี้ออกจากตะกร้าใช่หรือไม่?")) return

    setLoading(true)
    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message)
        return
      }

      alert("ลบออกจากตะกร้าสำเร็จ")
      router.refresh()
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRemove} 
      disabled={loading}
      className="text-sm text-red-600 border-red-200 hover:bg-red-50"
    >
      {loading ? "กำลังลบ..." : "ลบ"}
    </Button>
  )
}