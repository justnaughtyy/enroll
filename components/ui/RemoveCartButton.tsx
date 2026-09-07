"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner" // 1. นำเข้า toast
// 2. นำเข้า AlertDialog จาก Shadcn
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

export default function RemoveCartButton({ cartItemId }: { cartItemId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // ฟังก์ชันนี้จะทำงานเมื่อผู้ใช้กด "ยืนยันการลบ" ใน Pop-up
  const handleRemove = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId }),
      })

      const data = await res.json()

      if (!res.ok) {
        // ❌ เปลี่ยนเป็น toast.error
        toast.error("ไม่สามารถลบรายวิชาได้", {
          description: data.message || "เกิดข้อผิดพลาดในการลบรายวิชาออกจากตะกร้า",
        })
        return
      }

      // ✅ เปลี่ยนเป็น toast.success
      toast.success("ลบออกจากตะกร้าสำเร็จ", {
        description: "นำรายวิชาออกจากตะกร้าของคุณเรียบร้อยแล้ว",
      })
      router.refresh()
      
    } catch (err) {
      // ❌ เปลี่ยนเป็น toast.error
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ", {
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      {/* ปุ่มกดลบที่อยู่ในหน้าตะกร้า (Trigger) */}
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={loading}
          className="text-sm text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
        >
          {loading ? "กำลังลบ..." : "ลบ"}
        </Button>
      </AlertDialogTrigger>
      
      {/* หน้าต่าง Pop-up ยืนยันที่จะเด้งขึ้นมา */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบรายวิชา</AlertDialogTitle>
          <AlertDialogDescription>
            คุณต้องการลบรายวิชานี้ออกจากตะกร้าใช่หรือไม่? (คุณสามารถค้นหาและเพิ่มกลับเข้ามาใหม่ได้ในภายหลัง)
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleRemove}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            ยืนยันการลบ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}