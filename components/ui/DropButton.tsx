"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DropButton({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDrop = async () => {
    if (!confirm("คุณต้องการถอนรายวิชานี้ใช่หรือไม่?")) return

    setLoading(true)
    try {
      const res = await fetch("/api/drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "เกิดข้อผิดพลาดในการถอนรายวิชา")
        return
      }

      alert("ถอนรายวิชาสำเร็จ!")
      router.refresh()
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDrop} 
      disabled={loading}
      className="text-red-600 border-red-200 hover:bg-red-50"
    >
      {loading ? "กำลังดำเนินการ..." : "ถอนรายวิชา"}
    </Button>
  )
}