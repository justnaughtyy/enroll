"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner" // 1. นำเข้า toast
// 2. นำเข้า AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ConfirmButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // ฟังก์ชันนี้จะทำงานเมื่อกดปุ่ม "ยืนยัน" ในหน้า Pop-up 
  const handleConfirm = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cart/confirm", { method: "POST" })
      const data = await res.json()
      
      if (!res.ok) { 
        // ❌ เปลี่ยนจาก alert() เป็น toast.error
        toast.error("ทำรายการไม่สำเร็จ", {
          description: data.message || "เกิดข้อผิดพลาดในการยืนยันการลงทะเบียน"
        })
        return; 
      }
      
      // ✅ เปลี่ยนจาก alert() เป็น toast.success
      toast.success("ยืนยันการลงทะเบียนสำเร็จ!", {
        description: "รายวิชาในตะกร้าของคุณถูกบันทึกเข้าระบบเรียบร้อยแล้ว"
      })
      
      // หน่วงเวลา 1 วินาทีให้โชว์แจ้งเตือนสีเขียวก่อน แล้วค่อยกลับไปหน้า Dashboard
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1000)

    } catch (err) { 
      // ❌ เปลี่ยนจาก alert() เป็น toast.error
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ", {
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง"
      })
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <AlertDialog>
      {/* 1. ปุ่ม Trigger สำหรับเรียก Pop-up */}
      <AlertDialogTrigger asChild>
        <Button 
          disabled={loading} 
          className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
        >
          {loading ? "กำลังบันทึก..." : "ยืนยันการลงทะเบียนทั้งหมด"}
        </Button>
      </AlertDialogTrigger>

      {/* 2. หน้าต่าง Pop-up ยืนยัน */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลงทะเบียน</AlertDialogTitle>
          <AlertDialogDescription>
            คุณได้ตรวจสอบรายวิชาทั้งหมดในตะกร้าเรียบร้อยแล้ว และต้องการยืนยันการลงทะเบียนใช่หรือไม่? (เมื่อยืนยันแล้วจะไม่สามารถแก้ไขผ่านตะกร้าได้อีก)
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>กลับไปทบทวน</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            ยืนยันการลงทะเบียน
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}