"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export default function CourseSearchBox() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // ดึงคำค้นหาเดิมจาก URL (ถ้ามี) มาแสดงในช่อง
  const [query, setQuery] = useState(searchParams.get("q") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // ถ่ามีการพิมพ์คำค้นหา ให้เติม ?q=... ไปที่ URL
    if (query.trim()) {
      router.push(`/courses?q=${encodeURIComponent(query.trim())}`)
    } else {
      // ถ้าช่องว่างเปล่า ให้กลับไปหน้าหลักของ courses
      router.push(`/courses`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
      <input
        type="text"
        placeholder="ค้นหารหัส หรือ ชื่อวิชา..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm transition-shadow"
      />
      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
      
      {/* ปุ่มค้นหา (ซ่อนไว้ แต่กด Enter ได้) */}
      <button type="submit" className="hidden">ค้นหา</button>
    </form>
  )
}