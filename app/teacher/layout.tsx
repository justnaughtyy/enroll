import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, House } from "lucide-react";
import UserProfile from "@/components/ui/UserProfile";
import Image from "next/image";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. ตรวจสอบสิทธิ์การเข้าถึง (ต้องเป็น Teacher เท่านั้น)
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  let user: any = null;
  try {
    const secret = process.env.JWT_SECRET || "secret123";
    const decoded: any = jwt.verify(token, secret);

    user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.role !== "teacher") {
      redirect("/dashboard");
    }
  } catch (err) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 🌟 Top Navbar สำหรับอาจารย์ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* โลโก้ และ ชื่อระบบ */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white flex-shrink-0">
                <Image
                  src="/psrubw.jpg"
                  alt="Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <span className="font-bold text-slate-800 text-lg hidden sm:block">
                Teacher Panel
              </span>
              <span className="font-bold text-slate-800 text-lg sm:hidden">
                Teacher
              </span>
            </div>

            {/* เมนูนำทาง และ โปรไฟล์ */}
            <div className="flex items-center gap-2 sm:gap-6">
              <nav className="flex items-center">
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <House className="w-4 h-4" />
                  <span className="hidden sm:inline">หน้าแรก</span>
                </Link>
                <Link
                  href="/teacher"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">วิชาที่สอน</span>
                </Link> 
              </nav>

              {/* เส้นคั่นแนวตั้ง (แสดงเฉพาะจอใหญ่) */}
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              {/* คอมโพเนนต์โปรไฟล์ (ที่มีปุ่ม Logout) */}
              <UserProfile name={user.name} role={user.role} />
            </div>
          </div>
        </div>
      </header>

      {/* 🌟 Main Content (เนื้อหาหน้าเว็บจะมาแทรกตรงนี้) */}
      <main className="pb-12">{children}</main>
    </div>
  );
}
