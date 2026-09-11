import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"

export default async function StudentDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) redirect("/login")

  let userId = ""
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret123")
    userId = decoded.userId
  } catch (err) {
    redirect("/login")
  }

  // ดึงประวัติการลงทะเบียนทั้งหมดของนักศึกษาคนนี้ (ใช้ userId ตามที่คุณออกแบบไว้)
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: userId },
    include: {
      course: {
        include: { teacher: { select: { name: true } } }
      }
    },
    orderBy: { id: 'desc' }
  })

  // ส่งข้อมูลไปให้ Client Component จัดการต่อ (เรื่อง Filter และคำนวณเกรด)
  return <DashboardClient initialEnrollments={enrollments} />
}