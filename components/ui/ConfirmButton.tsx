"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ConfirmButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!confirm("ยืนยันการลงทะเบียนวิชาทั้งหมดในตะกร้าใช่หรือไม่?")) return
    setLoading(true)
    try {
      const res = await fetch("/api/cart/confirm", { method: "POST" })
      const data = await res.json()
      if (!res.ok) { alert(data.message); return; }
      alert("ยืนยันการลงทะเบียนสำเร็จ!")
      router.push("/dashboard")
    } catch (err) { alert("เกิดข้อผิดพลาด") } finally { setLoading(false) }
  }

  return (
    <Button onClick={handleConfirm} disabled={loading} className="text-sm bg-emerald-600 hover:bg-emerald-700">
      {loading ? "กำลังบันทึก..." : "ยืนยันการลงทะเบียนทั้งหมด"}
    </Button>
  )
}