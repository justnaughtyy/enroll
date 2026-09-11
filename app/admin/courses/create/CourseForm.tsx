"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CourseForm({ teachers }: { teachers: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      toast.success("เพิ่มรายวิชาสำเร็จ!");
      router.push("/admin/courses"); // กลับไปหน้าตารางวิชา
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">รหัสวิชา</label>
          <Input name="courseCode" placeholder="เช่น CS102" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            ชื่อรายวิชา
          </label>
          <Input
            name="courseName"
            placeholder="เช่น โครงสร้างข้อมูล"
            required
          />
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
            defaultValue="3"
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
            defaultValue="30"
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
            defaultValue="1"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            ปีการศึกษา
          </label>
          <Input name="year" type="number" defaultValue="2566" required />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-sm font-medium text-slate-700">
          มอบหมายอาจารย์ผู้สอน
        </label>
        <select
          name="teacherId"
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

      {/* ช่องสำหรับกรอกเวลาเรียน */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          เวลาเรียน (วันและเวลา)
        </label>
        <input
          type="text"
          name="schedule"
          // ถ้าเป็นหน้า Edit ให้ใช้ defaultValue={course.schedule}
          defaultValue="ยังไม่กำหนดเวลา"
          placeholder="เช่น จ. 09:00 - 12:00"
          required
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        />
      </div>

      {/* ช่องสำหรับเลือกสถานะ เปิด/ปิด */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-sm font-medium text-slate-700">
          สถานะการลงทะเบียน
        </label>
        <select
          name="isOpen"
          // ถ้าเป็นหน้า Edit ให้ใช้ defaultValue={course.isOpen ? "true" : "false"}
          defaultValue="true"
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        >
          <option value="true">🟢 เปิดรับการลงทะเบียน</option>
          <option value="false">🔴 ปิดการลงทะเบียน</option>
        </select>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          ยกเลิก
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "กำลังบันทึก..." : "บันทึกรายวิชา"}
        </Button>
      </div>
    </form>
  );
}
