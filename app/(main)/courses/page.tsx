import { prisma } from "@/lib/prisma";
import { Search, Users, BookOpen, Clock } from "lucide-react";
import AddToCartBtn from "./AddToCartBtn";
import CourseSearchBox from "./CourseSearchBox";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  // ดึงคำค้นหาจาก URL (เช่น ?q=com)
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.q || "";

  // ดึงวิชาทั้งหมดที่เปิดสอน และกรองด้วยคำค้นหา (ถ้ามี)
  const courses = await prisma.course.findMany({
    where: {
      isOpen: true,
      ...(searchQuery
        ? {
            OR: [
              { courseCode: { contains: searchQuery } },
              { courseName: { contains: searchQuery } },
            ],
          }
        : {}),
    },
    include: {
      teacher: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { courseCode: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ส่วนหัว */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Search className="text-blue-600" />
            ค้นหารายวิชาที่เปิดสอน
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            เลือกรายวิชาที่คุณต้องการลงทะเบียนเรียนในภาคเรียนนี้
          </p>
        </div>
        <CourseSearchBox />
      </div>

      {/* Grid แสดงวิชา */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            ยังไม่มีรายวิชาที่เปิดรับลงทะเบียนในขณะนี้
          </div>
        ) : (
          courses.map((course) => {
            const isFull = course._count.enrollments >= course.capacity;

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="p-5 border-b border-slate-100 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                      {course.courseCode}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {course.credits} หน่วยกิต
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg mb-1 leading-snug">
                    {course.courseName}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    อ. {course.teacher ? course.teacher.name : "ยังไม่กำหนด"}
                  </p>
                  {/* ✅ เพิ่มบรรทัดเวลาเรียนตรงนี้ */}
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {course.schedule}
                  </p>
                </div>

                <div className="p-5 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> ผู้เรียน
                    </span>
                    <span
                      className={`font-semibold ${isFull ? "text-red-600" : "text-slate-700"}`}
                    >
                      {course._count.enrollments} / {course.capacity}
                    </span>
                  </div>

                  {/* ปุ่มเพิ่มลงตะกร้า */}
                  <AddToCartBtn courseId={course.id} isFull={isFull} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
