"use client"

import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, // ✅ 1. เพิ่ม DropdownMenuGroup เข้ามา
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function UserProfile({ name, role }: { name: string, role: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // ✅ เรียกใช้ API Logout ที่คุณมีอยู่แล้ว แทนการลบด้วย JavaScript
      await fetch("/api/logout", {
        method: "POST",
      })
      
      // เมื่อลบสำเร็จ ค่อยสั่งเปลี่ยนหน้าไปที่ /login
      router.push("/login")
      router.refresh()
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการออกจากระบบ")
    }
  }

  // แปลง Role ให้เป็นภาษาไทยสวยๆ ไว้โชว์
  const roleDisplay = role === "admin" ? "ผู้ดูแลระบบ" : role === "teacher" ? "อาจารย์ผู้สอน" : "นักศึกษา"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-9 w-9 border border-slate-200 shadow-sm transition-transform hover:scale-105">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=2563eb`} alt={name} />
          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        
        {/* ✅ 2. เอา DropdownMenuGroup มาครอบตัว Label เอาไว้เพื่อแก้ Error */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">{roleDisplay}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>โปรไฟล์ของฉัน</span>
          </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          <span>ออกจากระบบ</span>
        </DropdownMenuItem>
        
      </DropdownMenuContent>
    </DropdownMenu>
  )
}