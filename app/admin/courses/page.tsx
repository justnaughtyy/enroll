import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import DeleteCourseBtn from "./DeleteCourseBtn";

export default async function AdminCoursesPage() {
  // ดึงข้อมูลรายวิชาทั้งหมด พร้อมดึงข้อมูล "อาจารย์ผู้สอน" (teacher) ที่ผูกกันอยู่มาด้วย
  const courses = await prisma.course.findMany({
    include: {
      teacher: true,
    },
    orderBy: { courseCode: "asc" },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* ส่วนหัว: ชื่อหน้าและปุ่มเพิ่มวิชา */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            จัดการรายวิชา
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            เพิ่ม ลบ แก้ไข และกำหนดอาจารย์ประจำวิชาสำหรับภาคเรียนปัจจุบัน
          </p>
        </div>
        <Link href="/admin/courses/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 transition-all">
            <Plus className="w-4 h-4" />
            เพิ่มวิชาใหม่
          </Button>
        </Link>
      </div>

      {/* ส่วนตารางแสดงข้อมูล */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">รหัสวิชา</th>
              <th className="px-6 py-4 font-medium">ชื่อวิชา</th>
              <th className="px-6 py-4 font-medium">เวลาเรียน</th>
              <th className="px-6 py-4 font-medium text-center">หน่วยกิต</th>
              <th className="px-6 py-4 font-medium text-center">รับ (คน)</th>
              <th className="px-6 py-4 font-medium">อาจารย์ผู้สอน</th>
              <th className="px-4 py-3 text-center">สถานะ</th>
              <th className="px-6 py-4 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {courses.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  ยังไม่มีข้อมูลรายวิชาในระบบ
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {course.courseCode}
                  </td>
                  <td className="px-6 py-4">{course.courseName}</td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {course.schedule}
                  </td>
                  <td className="px-6 py-4 text-center">{course.credits}</td>
                  <td className="px-6 py-4 text-center">{course.capacity}</td>
                  <td className="px-6 py-4">
                    {course.teacher ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium text-xs border border-emerald-100">
                        {course.teacher.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 font-medium text-xs border border-orange-100">
                        ยังไม่กำหนด
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {course.isOpen ? (
                      <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium">
                        เปิดรับ
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium">
                        ปิดรับ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                        title="แก้ไขวิชา"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DeleteCourseBtn id={course.id} name={course.courseName} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
