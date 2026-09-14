import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShoppingCart, BookOpen, AlertCircle, Clock } from "lucide-react";
import { RemoveCartBtn, ConfirmEnrollmentBtn } from "./CartActions";
import { Button } from "@/components/ui/button";

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let userId = "";
  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret123",
    );
    userId = decoded.userId;
  } catch (err) {
    redirect("/login");
  }

  // ดึงข้อมูลตะกร้า
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: userId },
    include: {
      course: { include: { teacher: true } },
    },
    orderBy: { id: "asc" }, // ถ้า error createdAt ให้ลบ orderBy ทิ้ง หรือแก้เป็น id ครับ
  });

  const totalCredits = cartItems.reduce(
    (sum, item) => sum + item.course.credits,
    0,
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <ShoppingCart className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            ตะกร้าการลงทะเบียน
          </h1>
          <p className="text-sm text-slate-500">
            ตรวจสอบรายวิชาและยืนยันการลงทะเบียน
          </p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            ไม่มีรายวิชาในตะกร้า
          </h3>
          <p className="text-slate-500">
            คุณยังไม่ได้เลือกรายวิชาใดๆ ลงในตะกร้าการลงทะเบียน
          </p>
          <Link href="/courses">
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              ไปค้นหารายวิชา
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-200">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 hidden sm:block">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">
                          {item.course.courseCode}
                        </span>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.course.credits} หน่วยกิต
                        </span>
                      </div>
                      <h3 className="text-base text-slate-700 font-medium">
                        {item.course.courseName}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        อ.{" "}
                        {item.course.teacher
                          ? item.course.teacher.name
                          : "ยังไม่กำหนด"}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-600">
                          {item.course.schedule}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end sm:justify-center">
                    <RemoveCartBtn cartItemId={item.id} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* กล่องสรุปผล */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">สรุปการลงทะเบียน</p>
              <p className="text-2xl font-bold text-slate-800">
                รวมทั้งหมด <span className="text-blue-600">{totalCredits}</span>{" "}
                หน่วยกิต
              </p>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />{" "}
                ตรวจสอบความถูกต้องก่อนกดยืนยัน
              </p>
            </div>
            <ConfirmEnrollmentBtn />
          </div>
        </div>
      )}
    </div>
  );
}
