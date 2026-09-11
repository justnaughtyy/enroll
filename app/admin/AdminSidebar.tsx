"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Users, Menu, X, Home, Search } from "lucide-react"
import Image from "next/image"

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // ฟังก์ชันเช็กว่ากำลังอยู่หน้านี้หรือเปล่า เพื่อทำไฮไลท์สีปุ่ม
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  return (
    <>
      {/* ปุ่ม Hamburger สำหรับมือถือ (แสดงเฉพาะจอเล็ก) */}
      <button
        className="md:hidden fixed top-3 left-4 z-[60] p-2 bg-slate-900 text-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ฉากหลังสีดำโปร่งแสงเวลากดเปิดเมนูในมือถือ */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ตัว Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col shadow-xl transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}>
        {/* โลโก้ */}
        <div className="h-16 flex items-center gap-3 px-6 bg-slate-950/50 border-b border-slate-800 md:pl-6 pl-14">
          <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white">
            <Image src="/psrubw.jpg" alt="Logo" fill className="object-contain p-1" />
          </div>
          <span className="text-white font-bold tracking-wide">Admin Panel</span>
        </div>

        {/* เมนูนำทาง */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3 mt-2">จัดการระบบ</div>
          
          <Link href="/admin" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${pathname === "/admin" ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-medium">ภาพรวม (Dashboard)</span>
          </Link>

          <Link href="/admin/courses" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive("/admin/courses") ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">จัดการรายวิชา</span>
          </Link>

          <Link href="/admin/users" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive("/admin/users") ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">จัดการผู้ใช้งาน</span>
          </Link>

          {/* เส้นคั่น */}
          <div className="pt-6 pb-2">
            <div className="h-px bg-slate-800 w-full mb-4"></div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">เว็บไซต์สาธารณะ</div>
          </div>

          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">หน้าแรกเว็บไซต์</span>
          </Link>

          <Link href="/courses" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            <Search className="w-5 h-5" />
            <span className="text-sm font-medium">ค้นหารายวิชา (Public)</span>
          </Link>

        </nav>
      </aside>
    </>
  )
}