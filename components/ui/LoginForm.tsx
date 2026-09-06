"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
        alert(data.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
        setLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้")
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
        />
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  )
}