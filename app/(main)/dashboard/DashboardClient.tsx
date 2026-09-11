"use client"

import { useState, useMemo } from "react"
import { BookOpen, GraduationCap, Filter, Calculator } from "lucide-react"

// กำหนดค่าน้ำหนักของเกรด (W ไม่เอามาคำนวณ)
const gradeValues: Record<string, number> = {
  'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0
}

export default function DashboardClient({ initialEnrollments }: { initialEnrollments: any[] }) {
  const [selectedTerm, setSelectedTerm] = useState<string>("ALL")

  // 1. หา เทอม/ปีการศึกษา ทั้งหมดที่มีในประวัติการเรียน เพื่อทำ Dropdown
  const termOptions = useMemo(() => {
    const terms = new Set(initialEnrollments.map(en => `${en.course.term}/${en.course.year}`))
    // เรียงจากปีล่าสุด/เทอมล่าสุด ลงไป
    return Array.from(terms).sort((a, b) => {
      const [termA, yearA] = a.split('/').map(Number)
      const [termB, yearB] = b.split('/').map(Number)
      if (yearA !== yearB) return yearB - yearA
      return termB - termA
    })
  }, [initialEnrollments])

  // 2. ฟังก์ชันคำนวณเกรดเฉลี่ย
  const calculateGPA = (enrollments: any[]) => {
    let totalPoints = 0
    let totalCredits = 0

    enrollments.forEach(en => {
      const grade = en.grade
      const credits = en.course.credits
      
      // คำนวณเฉพาะวิชาที่ได้เกรดแล้ว และไม่ใช่เกรด W
      if (grade && gradeValues[grade] !== undefined) {
        totalPoints += gradeValues[grade] * credits
        totalCredits += credits
      }
    })

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00"
  }

  // 3. คำนวณ CGPA (เฉลี่ยสะสมทั้งหมด)
  const cgpa = useMemo(() => calculateGPA(initialEnrollments), [initialEnrollments])

  // 4. กรองวิชาตามเทอมที่เลือก
  const filteredEnrollments = useMemo(() => {
    if (selectedTerm === "ALL") return initialEnrollments
    return initialEnrollments.filter(en => `${en.course.term}/${en.course.year}` === selectedTerm)
  }, [initialEnrollments, selectedTerm])

  // 5. คำนวณ GPA (เฉพาะเทอมที่กรอง) และหน่วยกิต
  const termGpa = useMemo(() => calculateGPA(filteredEnrollments), [filteredEnrollments])
  const termCredits = filteredEnrollments.reduce((sum, en) => sum + en.course.credits, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* ส่วนหัว และ การคำนวณเกรด */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* กล่องหัวเรื่อง */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="text-blue-600 w-7 h-7" />
            ผลการเรียน
          </h1>
          <p className="text-slate-500 mt-1 text-sm">ประวัติการลงทะเบียนและเกรด</p>
        </div>

        {/* กล่อง CGPA (เกรดเฉลี่ยสะสม) */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl border border-blue-800 shadow-md text-white flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">เกรดเฉลี่ยสะสม (CGPA)</p>
            <p className="text-4xl font-bold">{cgpa}</p>
          </div>
          <Calculator className="w-10 h-10 text-white/20" />
        </div>

        {/* กล่อง GPA (เกรดเฉลี่ยประจำเทอม) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">เกรดประจำเทอม (GPA)</p>
            <p className="text-4xl font-bold text-slate-800">{selectedTerm === "ALL" ? "-" : termGpa}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">หน่วยกิตรวม</p>
            <p className="text-xl font-semibold text-slate-600">{termCredits}</p>
          </div>
        </div>
      </div>

      {/* ส่วนกรองข้อมูล (Filter) */}
      <div className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Filter className="w-4 h-4" />
          <span>กรองตามภาคเรียน:</span>
        </div>
        <select 
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
        >
          <option value="ALL">ดูประวัติทั้งหมด (All Semesters)</option>
          {termOptions.map(term => (
            <option key={term} value={term}>ภาคเรียนที่ {term}</option>
          ))}
        </select>
      </div>

      {/* ตารางแสดงผลการเรียน */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">ภาคเรียน</th>
                <th className="px-6 py-4 font-medium">รหัสวิชา</th>
                <th className="px-6 py-4 font-medium">ชื่อวิชา</th>
                <th className="px-6 py-4 font-medium text-center">หน่วยกิต</th>
                <th className="px-6 py-4 font-medium text-center">ผลการเรียน (Grade)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <BookOpen className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="text-base text-slate-500 font-medium">ไม่มีข้อมูลลงทะเบียนในภาคเรียนนี้</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((en) => {
                  // ถ้าได้เกรด F หรือ W จะแสดงสีแดง, ถ้าว่างจะสีเทา, ถ้าผ่านปกติสีเขียว
                  const gradeColor = en.grade === 'F' || en.grade === 'W' 
                    ? 'bg-red-100 text-red-700 border-red-200' 
                    : en.grade 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-500 border-slate-200'

                  return (
                    <tr key={en.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{en.course.term}/{en.course.year}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{en.course.courseCode}</td>
                      <td className="px-6 py-4">{en.course.courseName}</td>
                      <td className="px-6 py-4 text-center">{en.course.credits}</td>
                      <td className="px-6 py-4 text-center">
                        {en.grade ? (
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg border shadow-sm ${gradeColor}`}>
                            {en.grade}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">รอเกรด</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}