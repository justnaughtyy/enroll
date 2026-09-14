import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('กำลังล้างข้อมูลเก่า...')
  // ลบข้อมูลเก่าทิ้งทั้งหมดเรียงตามลำดับเพื่อป้องกัน Error เรื่อง Relation
  await prisma.enrollment.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  console.log('กำลังสร้างข้อมูลใหม่...')
  // เข้ารหัสผ่าน "123456" สำหรับใช้กับทุก User เพื่อง่ายต่อการเทส
  const hashedPassword = await bcrypt.hash('123456', 10)

  // 1. สร้างข้อมูล Admin
  await prisma.user.create({
    data: {
      username: 'admin01',
      password: hashedPassword,
      name: 'ผู้ดูแลระบบ สูงสุด',
      role: 'admin',
    },
  })

  // 2. สร้างข้อมูล Teacher (2 ท่าน)
  const teacher1 = await prisma.user.create({
    data: {
      username: 'teacher01',
      password: hashedPassword,
      name: 'อ.สมพงษ์ สอนดี',
      role: 'teacher',
    },
  })

  const teacher2 = await prisma.user.create({
    data: {
      username: 'teacher02',
      password: hashedPassword,
      name: 'อ.สมหญิง ใจดี',
      role: 'teacher',
    },
  })

  // 3. สร้างข้อมูล Student (3 คน พร้อมข้อมูลคณะ สาขา สถานะ)
  const student1 = await prisma.user.create({
    data: {
      username: '66011234',
      password: hashedPassword,
      name: 'สมชาย รักเรียน',
      role: 'student',
      faculty: 'วิทยาศาสตร์และเทคโนโลยี',
      major: 'วิทยาการคอมพิวเตอร์',
      studentStatus: 'ปกติ',
    },
  })

  await prisma.user.create({
    data: {
      username: '66011235',
      password: hashedPassword,
      name: 'สมหญิง ขยันอ่าน',
      role: 'student',
      faculty: 'วิทยาศาสตร์และเทคโนโลยี',
      major: 'เทคโนโลยีสารสนเทศ',
      studentStatus: 'ปกติ',
    },
  })

  await prisma.user.create({
    data: {
      username: '66011236',
      password: hashedPassword,
      name: 'สมศักดิ์ พักก่อน',
      role: 'student',
      faculty: 'มนุษยศาสตร์และสังคมศาสตร์',
      major: 'ภาษาอังกฤษ',
      studentStatus: 'รักษาสถานภาพ',
    },
  })

  // 4. สร้างข้อมูลรายวิชา (Course)
  await prisma.course.create({
    data: {
      courseCode: 'CS101',
      courseName: 'วิทยาการคอมพิวเตอร์เบื้องต้น',
      credits: 3,
      capacity: 30,
      teacherId: teacher1.id,
      schedule: 'จันทร์ 09:00 - 12:00', // ✅ เพิ่มเวลาเรียน
      term: 1,
      year: 2566,
      isOpen: true,
    },
  })

  await prisma.course.create({
    data: {
      courseCode: 'CS102',
      courseName: 'การเขียนโปรแกรมเว็บเบื้องต้น',
      credits: 3,
      capacity: 30,
      teacherId: teacher1.id,
      schedule: 'พุธ 13:00 - 16:00',
      term: 1,
      year: 2566,
      isOpen: true,
    },
  })

  await prisma.course.create({
    data: {
      courseCode: 'ENG101',
      courseName: 'ภาษาอังกฤษเพื่อการสื่อสาร',
      credits: 3,
      capacity: 40,
      teacherId: teacher2.id,
      schedule: 'จันทร์ 10:00 - 13:00', // 🚨 จงใจตั้งให้ชนกับ CS101 เพื่อไว้เทสระบบ!
      term: 1,
      year: 2566,
      isOpen: true,
    },
  })

  await prisma.course.create({
    data: {
      courseCode: 'MATH101',
      courseName: 'แคลคูลัส 1',
      credits: 3,
      capacity: 40,
      teacherId: teacher2.id,
      schedule: 'อังคาร 09:00 - 12:00',
      term: 1,
      year: 2566,
      isOpen: true,
    },
  })

  await prisma.course.create({
    data: {
      courseCode: 'GEN101',
      courseName: 'การใช้ชีวิตในสังคม',
      credits: 2,
      capacity: 1, // 🚨 จงใจรับแค่ 1 คน เพื่อเอาไว้เทสว่าวิชาเต็มแล้วกดไม่ได้
      teacherId: teacher2.id,
      schedule: 'ศุกร์ 09:00 - 11:00',
      term: 1,
      year: 2566,
      isOpen: true,
    },
  })

  // 5. ทดลองให้นักศึกษา 1 คน ลงทะเบียนไปแล้ว 1 วิชา (เพื่อให้ Dashboard แอดมินมีข้อมูลคนลงทะเบียน)
  const mathCourse = await prisma.course.findFirst({ where: { courseCode: 'MATH101' } })
  if (mathCourse) {
    await prisma.enrollment.create({
      data: {
        userId: student1.id,
        courseId: mathCourse.id,
        grade: null, // ยังไม่มีเกรด
      }
    })
  }

  console.log('✅ จำลองข้อมูล (Mock Data) สำเร็จแล้ว!')
  console.log('--- ข้อมูลสำหรับใช้ Login เทสระบบ (รหัสผ่าน: 123456 ทั้งหมด) ---')
  console.log('👉 แอดมิน: username: admin01')
  console.log('👉 อาจารย์: username: teacher01 หรือ teacher02')
  console.log('👉 นักศึกษา: username: 66011234, 66011235, หรือ 66011236')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })