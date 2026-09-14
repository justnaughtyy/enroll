"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
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

export default function DeleteUserBtn({ id, name }: { id: string, name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false) // ✅ State คุมการเปิด/ปิด Modal

  const executeDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success("ลบผู้ใช้งานสำเร็จ!")
      router.refresh()
      setIsOpen(false) // ✅ ปิด Modal เมื่อลบสำเร็จ
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการลบ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ปุ่มถังขยะสำหรับกดเปิด Modal */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
        title="ลบผู้ใช้งาน"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* AlertDialog ที่จะเด้งขึ้นมา */}
      <AlertDialog 
        open={isOpen} 
        onOpenChange={(open) => {
          // ป้องกันการกดปิด (คลิกพื้นหลัง) ตอนที่กำลังโหลด API
          if (!loading) setIsOpen(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบบัญชีผู้ใช้?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี <span className="font-bold text-slate-800">"{name}"</span> ? <br/>
              <span className="text-red-500 mt-1 inline-block">
                (ข้อมูลการลงทะเบียนหรือวิชาที่สอนจะถูกยกเลิกด้วย และไม่สามารถกู้คืนได้)
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault() // ป้องกัน Modal ปิดทันทีก่อนเรียก API
                executeDelete()
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "กำลังลบ..." : "ยืนยันการลบ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}