"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

// ✅ นำเข้า AlertDialog จาก shadcn/ui
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// ==========================================
// 1. ปุ่มลบทีละวิชา (ไม่มีแจ้งเตือน เพราะเป็นการกดลบจากตะกร้าเฉยๆ)
// ==========================================
export function RemoveCartBtn({ cartItemId }: { cartItemId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/student/cart/${cartItemId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("ลบไม่สำเร็จ")
      
      toast.success("ลบออกจากตะกร้าแล้ว")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleRemove} disabled={loading} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto">
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}

// ==========================================
// 2. ปุ่มยืนยันการลงทะเบียนทั้งหมด (ใช้ AlertDialog)
// ==========================================
export function ConfirmEnrollmentBtn() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false) // ✅ State คุม Modal

  const executeEnrollment = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/student/enroll", { method: "POST" })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message)
      
      toast.success("ลงทะเบียนเรียนสำเร็จ!")
      router.push("/dashboard") // กลับไปหน้า Dashboard ดูผลการเรียน
      router.refresh()
      setIsOpen(false) // ปิด Modal
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ปุ่มหลักในหน้าตะกร้า (เปิด Modal แทน) */}
      <Button 
        onClick={() => setIsOpen(true)} 
        disabled={loading} 
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2 shadow-md"
      >
        <CheckCircle className="w-5 h-5" />
        {loading ? "กำลังดำเนินการ..." : "ยืนยันการลงทะเบียนเรียน"}
      </Button>

      {/* AlertDialog แจ้งเตือนก่อนบันทึก */}
      <AlertDialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!loading) setIsOpen(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลงทะเบียนเรียน?</AlertDialogTitle>
            <AlertDialogDescription>
              กรุณาตรวจสอบรายวิชา เวลาเรียน และหน่วยกิตให้ถูกต้อง <br/>
              เมื่อกดยืนยันแล้ว ระบบจะบันทึกผลการลงทะเบียนของคุณทันที
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault() 
                executeEnrollment()
              }}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white" // ✅ ปุ่มยืนยันสีเขียว
            >
              {loading ? "กำลังดำเนินการ..." : "ยืนยันการลงทะเบียน"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}