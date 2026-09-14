"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function EditCourseForm({
  course,
  teachers,
}: {
  course: any;
  teachers: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  let defaultDay = "จันทร์";
  let defaultStartTime = "09:00";
  let defaultEndTime = "12:00";

  if (course.schedule && course.schedule !== "ยังไม่กำหนดเวลา") {
    const match = course.schedule.match(
      /^([^\s]+)\s+([0-9]{2}:[0-9]{2})\s*-\s*([0-9]{2}:[0-9]{2})$/,
    );
    if (match) {
      defaultDay = match[1];
      defaultStartTime = match[2];
      defaultEndTime = match[3];
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (data.startTime >= data.endTime) {
      toast.error("เวลาเลิกเรียนต้องมากกว่าเวลาเริ่มเรียน")
      setLoading(false)
      return // เบรกการทำงาน ไม่ให้ส่ง API
    }

    data.schedule = `${data.day} ${data.startTime} - ${data.endTime}`;
    delete data.day;
    delete data.startTime;
    delete data.endTime;

    try {
      // เรียก API ด้วย Method PUT สำหรับการอัปเดต
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      toast.success("อัปเดตรายวิชาสำเร็จ!");
      router.push("/admin/courses");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">รหัสวิชา</label>
          <Input name="courseCode" defaultValue={course.courseCode} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            ชื่อรายวิชา
          </label>
          <Input name="courseName" defaultValue={course.courseName} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">หน่วยกิต</label>
          <Input
            name="credits"
            type="number"
            min="1"
            max="6"
            defaultValue={course.credits}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            จำนวนรับ (ที่นั่ง)
          </label>
          <Input
            name="capacity"
            type="number"
            min="1"
            defaultValue={course.capacity}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            เทอมที่เปิดสอน
          </label>
          <Input
            name="term"
            type="number"
            min="1"
            max="3"
            defaultValue={course.term}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            ปีการศึกษา
          </label>
          <Input
            name="year"
            type="number"
            defaultValue={course.year}
            required
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-sm font-medium text-slate-700">
          มอบหมายอาจารย์ผู้สอน
        </label>
        <select
          name="teacherId"
          defaultValue={course.teacherId || ""}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        >
          <option value="">-- ยังไม่ระบุอาจารย์ผู้สอน --</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>

      {/* ช่องสำหรับแก้ไขเวลาเรียน */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            วันที่เรียน
          </label>
          <select
            name="day"
            required
            defaultValue={defaultDay}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
          >
            <option value="จันทร์">จันทร์</option>
            <option value="อังคาร">อังคาร</option>
            <option value="พุธ">พุธ</option>
            <option value="พฤหัสบดี">พฤหัสบดี</option>
            <option value="ศุกร์">ศุกร์</option>
            <option value="เสาร์">เสาร์</option>
            <option value="อาทิตย์">อาทิตย์</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            เวลาเริ่มเรียน
          </label>
          <input
            type="time"
            name="startTime"
            required
            defaultValue={defaultStartTime}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            เวลาเลิกเรียน
          </label>
          <input
            type="time"
            name="endTime"
            required
            defaultValue={defaultEndTime}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* ช่องสำหรับเลือกสถานะ เปิด/ปิด */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-sm font-medium text-slate-700">
          สถานะการลงทะเบียน
        </label>
        <select
          name="isOpen"
          // ถ้าเป็นหน้า Edit ให้ใช้ defaultValue={course.isOpen ? "true" : "false"}
          defaultValue={course.isOpen ? "true" : "false"}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        >
          <option value="true">🟢 เปิดรับการลงทะเบียน</option>
          <option value="false">🔴 ปิดการลงทะเบียน</option>
        </select>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/courses")}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "กำลังบันทึก..." : "อัปเดตข้อมูล"}
        </Button>
      </div>
    </form>
  );
}
