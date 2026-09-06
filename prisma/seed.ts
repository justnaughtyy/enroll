import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // เข้ารหัสผ่านว่า "password123" สำหรับนักศึกษาทุกคน
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 1. สร้างนักศึกษา 2 คน
  const student1 = await prisma.student.upsert({
    where: { studentId: '66011234' },
    update: {},
    create: {
      studentId: '66011234',
      password: hashedPassword,
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      faculty: 'วิทยาศาสตร์และเทคโนโลยี', 
    },
  })

  const student2 = await prisma.student.upsert({
    where: { studentId: '66011235' },
    update: {},
    create: {
      studentId: '66011235',
      password: hashedPassword,
      firstName: 'สมหญิง',
      lastName: 'เรียนเก่ง',
      faculty: 'วิทยาศาสตร์และเทคโนโลยี',
    },
  })

  // 3. เพิ่มนักศึกษาคนที่ 3
  const student3 = await prisma.student.upsert({
    where: { studentId: '66011236' },
    update: {},
    create: {
      studentId: '66011236',
      password: hashedPassword,
      firstName: 'สมศักดิ์',
      lastName: 'ตั้งใจ',
      faculty: 'วิทยาศาสตร์และเทคโนโลยี',
    },
  })

  // 2. สร้างรายวิชา 3 วิชา (จงใจให้มีวิชาที่เวลาชนกันและที่นั่งเต็ม)
  const course1 = await prisma.course.upsert({
    where: { courseCode: 'CSI101' },
    update: {},
    create: {
      courseCode: 'CSI101',
      courseName: 'Web Development',
      credits: 3,
      instructor: 'ดร. สมปอง',
      scheduleDay: 'Monday',
      startTime: '09:00',
      endTime: '12:00',
      capacity: 30, 
    },
  })

  const course2 = await prisma.course.upsert({
    where: { courseCode: 'CSI102' },
    update: {},
    create: {
      courseCode: 'CSI102',
      courseName: 'Database Systems',
      credits: 3,
      instructor: 'ผศ. สมศรี',
      scheduleDay: 'Monday', 
      startTime: '10:00', // เวลาชนกับ CSI101 
      endTime: '13:00',
      capacity: 2, // ที่นั่งน้อย เพื่อทดสอบเวลาเต็ม
    },
  })
  
  const course3 = await prisma.course.upsert({
    where: { courseCode: 'GEN201' },
    update: {},
    create: {
      courseCode: 'GEN201',
      courseName: 'English for Communication',
      credits: 3,
      instructor: 'อ. จอห์น',
      scheduleDay: 'Wednesday', 
      startTime: '13:00',
      endTime: '16:00',
      capacity: 40,
    },
  })

  

  console.log('Mock Data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })