"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
// นำเข้า AlertDialog จาก Shadcn
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

export default function DropButton({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // ฟังก์ชันนี้จะถูกเรียกก็ต่อเมื่อผู้ใช้กดปุ่ม "ยืนยันการถอน" ใน Pop-up แล้วเท่านั้น
  const handleDrop = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error("ไม่สามารถถอนรายวิชาได้", {
          description: data.message || "เกิดข้อผิดพลาดในการถอนรายวิชา",
        })
        return
      }

      toast.success("ถอนรายวิชาสำเร็จ!", {
        description: "ระบบได้นำรายวิชานี้ออกจากการลงทะเบียนของคุณแล้ว",
      })
      router.refresh()
      
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ", {
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      {/* 1. ปุ่ม Trigger สำหรับเปิด Pop-up (ใช้หน้าตาปุ่มเดิมของเรา) */}
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={loading}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
        >
          {loading ? "กำลังดำเนินการ..." : "ถอนรายวิชา"}
        </Button>
      </AlertDialogTrigger>

      {/* 2. หน้าต่าง Pop-up ที่จะเด้งขึ้นมา */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการถอนรายวิชา</AlertDialogTitle>
          <AlertDialogDescription>
            คุณแน่ใจหรือไม่ว่าต้องการถอนรายวิชานี้? ข้อมูลการลงทะเบียนในวิชานี้จะถูกลบออก และคุณอาจต้องลงทะเบียนใหม่หากต้องการเรียน
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          {/* ปุ่มยกเลิก (ปิด Pop-up เฉยๆ ไม่เกิดอะไรขึ้น) */}
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          
          {/* ปุ่มยืนยัน (กดแล้วจะไปเรียกฟังก์ชัน handleDrop) */}
          <AlertDialogAction 
            onClick={handleDrop}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            ยืนยันการถอน
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}