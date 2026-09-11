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
  const admin = await prisma.user.create({
    data: {
      username: 'admin01',
      password: hashedPassword,
      name: 'ผู้ดูแลระบบ สูงสุด',
      role: 'admin',
    },
  })

  // 2. สร้างข้อมูล Teacher
  const teacher = await prisma.user.create({
    data: {
      username: 'teacher01',
      password: hashedPassword,
      name: 'อ.สมพงษ์ สอนดี',
      role: 'teacher',
    },
  })

  // 3. สร้างข้อมูล Student
  const student = await prisma.user.create({
    data: {
      username: '66011234',
      password: hashedPassword,
      name: 'สมชาย รักเรียน',
      role: 'student',
    },
  })

  // 4. สร้างข้อมูลรายวิชา (Course) และมอบหมายให้อาจารย์ที่เพิ่งสร้าง
  await prisma.course.create({
    data: {
      courseCode: 'CS101',
      courseName: 'วิทยาการคอมพิวเตอร์เบื้องต้น',
      credits: 3,
      capacity: 30,
      teacherId: teacher.id, // ✅ ผูกวิชานี้กับอาจารย์สมพงษ์
      term: 1,
      year: 2566,
    },
  })

  await prisma.course.create({
    data: {
      courseCode: 'ENG101',
      courseName: 'ภาษาอังกฤษเพื่อการสื่อสาร',
      credits: 3,
      capacity: 40,
      teacherId: teacher.id, // ✅ ผูกวิชานี้กับอาจารย์สมพงษ์
      term: 1,
      year: 2566,
    },
  })

  console.log('✅ จำลองข้อมูล (Mock Data) สำเร็จแล้ว!')
  console.log('--- ข้อมูลสำหรับใช้ Login เทสระบบ ---')
  console.log('👉 แอดมิน: username: admin01 | รหัสผ่าน: 123456')
  console.log('👉 อาจารย์: username: teacher01 | รหัสผ่าน: 123456')
  console.log('👉 นักศึกษา: username: 66011234 | รหัสผ่าน: 123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })