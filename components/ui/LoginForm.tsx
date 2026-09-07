"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner" 

export default function LoginForm() {
  const router = useRouter()
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        // ❌ แก้เป็น toast.error สำหรับกรณีรหัสผิดหรือหาผู้ใช้ไม่เจอ
        toast.error("เข้าสู่ระบบไม่สำเร็จ", {
          description: data.message || "รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง",
        })
        setLoading(false)
        return
      }

      // ✅ เพิ่ม toast.success แจ้งเตือนเมื่อล็อกอินผ่าน
      toast.success("เข้าสู่ระบบสำเร็จ!", {
        description: "กำลังพาท่านเข้าสู่ระบบลงทะเบียน...",
      })

      // ใช้ setTimeout หน่วงเวลา 1 วินาที เพื่อให้ผู้ใช้มองเห็น Pop-up สีเขียวก่อนเปลี่ยนหน้า
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1000)

    } catch (err) {
      // ❌ เปลี่ยนจาก alert() แบบเก่า เป็น Pop-up สวยๆ
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ", {
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
      })
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="studentId">รหัสนักศึกษา</Label>
        <Input 
          id="studentId" 
          placeholder="เช่น 66011234"
          value={studentId} 
          onChange={(e) => setStudentId(e.target.value)} 
          required 
          className="h-11" // เพิ่มความสูงให้ช่องกรอกดูโปร่งขึ้นนิดนึง
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="••••••••"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          className="h-11"
        />
      </div>
      <Button type="submit" className="w-full h-11 mt-2 bg-blue-600 hover:bg-blue-700 transition-colors" disabled={loading}>
        {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  )
}