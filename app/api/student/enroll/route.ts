import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// 📌 ฟังก์ชันช่วย 1: แปลง "จันทร์ 09:00 - 12:00" เป็นตัวเลขเพื่อง่ายต่อการคำนวณ
function parseSchedule(schedule: string) {
  const match = schedule.match(/^([^\s]+)\s+([0-9]{2}):([0-9]{2})\s*-\s*([0-9]{2}):([0-9]{2})$/)
  if (!match) return null
  
  const day = match[1]
  const startMins = parseInt(match[2]) * 60 + parseInt(match[3])
  const endMins = parseInt(match[4]) * 60 + parseInt(match[5])
  
  return { day, startMins, endMins }
}

// 📌 ฟังก์ชันช่วย 2: ตรวจสอบว่าเวลา 2 ชุดทับซ้อนกันหรือไม่
function isTimeClash(sched1: any, sched2: any) {
  if (!sched1 || !sched2) return false // ถ้าวิชาไหนยังไม่กำหนดเวลา ปล่อยผ่าน
  if (sched1.day !== sched2.day) return false // คนละวัน ไม่ชนแน่นอน
  
  // สูตรเช็กการทับซ้อน: (เริ่ม1 < จบ2) และ (เริ่ม2 < จบ1)
  return (sched1.startMins < sched2.endMins) && (sched2.startMins < sched1.endMins)
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret123")
    const userId = decoded.userId

    // 1. ดึงข้อมูลวิชาในตะกร้า
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: { course: true }
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ message: "ไม่มีวิชาในตะกร้าให้ลงทะเบียน" }, { status: 400 })
    }

    // 2. ดึงข้อมูลวิชาที่ "ลงทะเบียนสำเร็จไปแล้ว" มาเพื่อเปรียบเทียบ
    const existingEnrollments = await prisma.enrollment.findMany({
      where: { userId: userId },
      include: { course: true }
    })

    const MAX_CREDITS = 22 // 🚨 ตั้งค่าหน่วยกิตสูงสุดต่อเทอมที่นี่

    // 3. จัดกลุ่มข้อมูลแยกตามเทอม (เพราะการเช็กต้องทำแยกเทอมกัน)
    // หน้าตาข้อมูล: { "1/2566": { totalCredits: 15, schedules: [...] } }
    const termData: Record<string, { totalCredits: number, courses: any[] }> = {}

    // 3.1 ยัดวิชาที่ "ลงไปแล้ว" ใส่ตะกร้าคำนวณก่อน
    for (const en of existingEnrollments) {
      const termKey = `${en.course.term}/${en.course.year}`
      if (!termData[termKey]) termData[termKey] = { totalCredits: 0, courses: [] }
      
      termData[termKey].totalCredits += en.course.credits
      termData[termKey].courses.push(en.course)
    }

    // 3.2 วนลูปเช็กวิชา "ในตะกร้า" ทีละตัว
    for (const item of cartItems) {
      const course = item.course
      const termKey = `${course.term}/${course.year}`
      if (!termData[termKey]) termData[termKey] = { totalCredits: 0, courses: [] }

      // 🛡️ เช็กที่ 1: หน่วยกิตเกิน 22 ไหม?
      if (termData[termKey].totalCredits + course.credits > MAX_CREDITS) {
        return NextResponse.json({ 
          message: `ลงทะเบียนไม่สำเร็จ! ภาคเรียนที่ ${termKey} คุณลงได้สูงสุด ${MAX_CREDITS} หน่วยกิต` 
        }, { status: 400 })
      }

      // 🛡️ เช็กที่ 2: เวลาเรียนชนกับวิชาอื่นไหม?
      const newSched = parseSchedule(course.schedule)
      for (const existingCourse of termData[termKey].courses) {
        const existingSched = parseSchedule(existingCourse.schedule)
        
        if (isTimeClash(newSched, existingSched)) {
          return NextResponse.json({ 
            message: `เวลาเรียนชนกัน! วิชารหัส ${course.courseCode} ชนกับ ${existingCourse.courseCode} (${existingCourse.courseName})` 
          }, { status: 400 })
        }
      }

      // ถ้าผ่านทั้ง 2 ด่าน ก็เอาวิชานี้บวกเข้าไปในยอดรวม เพื่อเอาไว้เช็กกับวิชาถัดไปในตะกร้า
      termData[termKey].totalCredits += course.credits
      termData[termKey].courses.push(course)
    }

    // 4. ถ้าผ่านด่านทั้งหมดมาได้ ก็เซฟลง Database เลย!
    const enrollmentsData = cartItems.map(item => ({
      userId: userId,
      courseId: item.courseId,
    }))

    await prisma.$transaction([
      prisma.enrollment.createMany({ data: enrollmentsData }),
      prisma.cartItem.deleteMany({ where: { userId: userId } })
    ])

    return NextResponse.json({ message: "ลงทะเบียนเรียนสำเร็จ ไม่มีเวลาชน!" }, { status: 201 })
  } catch (error: any) {
    console.error("Enrollment error:", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการลงทะเบียน" }, { status: 500 })
  }
}