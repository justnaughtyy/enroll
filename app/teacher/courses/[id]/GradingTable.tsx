"use client"

import { useState } from "react"
import { toast } from "sonner"

export default function GradingTable({ enrollments }: { enrollments: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // ฟังก์ชันอัปเดตเกรดเมื่อเลือก Dropdown
  const handleGradeChange = async (enrollmentId: string, newGrade: string) => {
    setLoadingId(enrollmentId) // แสดงสถานะว่ากำลังโหลดเฉพาะแถวนี้
    try {
      const res = await fetch("/api/teacher/grades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, grade: newGrade || null }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message)
      }

      toast.success("บันทึกเกรดสำเร็จ")
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการบันทึก")
    } finally {
      setLoadingId(null)
    }
  }

  if (enrollments.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        ยังไม่มีนักศึกษาลงทะเบียนในรายวิชานี้
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-medium w-16 text-center">ลำดับ</th>
            <th className="px-6 py-4 font-medium">รหัสนักศึกษา</th>
            <th className="px-6 py-4 font-medium">ชื่อ-นามสกุล</th>
            <th className="px-6 py-4 font-medium w-48 text-center">ผลการเรียน (Grade)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {enrollments.map((enrollment, index) => (
            <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-center text-slate-400">{index + 1}</td>
              <td className="px-6 py-4 font-medium text-slate-800">{enrollment.user.username}</td>
              <td className="px-6 py-4">{enrollment.user.name}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <select
                    defaultValue={enrollment.grade || ""}
                    onChange={(e) => handleGradeChange(enrollment.id, e.target.value)}
                    disabled={loadingId === enrollment.id}
                    className={`
                      flex h-9 w-24 rounded-md border px-3 py-1 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                      ${loadingId === enrollment.id ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-white border-slate-200 hover:border-blue-300"}
                      ${enrollment.grade ? "text-blue-700 bg-blue-50/50 border-blue-200" : "text-slate-600"}
                    `}
                  >
                    <option value="">- รอเกรด -</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="D+">D+</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                    <option value="W">W</option>
                  </select>
                  
                  {/* แสดง Spinner หมุนๆ เล็กๆ ตอนกำลังเซฟ */}
                  {loadingId === enrollment.id && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}