import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  ShieldAlert,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import DeleteUserBtn from "./DeleteUserBtn";

export default async function AdminUsersPage() {
  // ดึงข้อมูลผู้ใช้งานทั้งหมดเรียงตาม Role (แอดมินขึ้นก่อน ตามด้วยอาจารย์ และนักศึกษา)
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  // ฟังก์ชันช่วยแสดงผล Role ให้สวยงาม
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-medium text-xs border border-purple-100">
            <ShieldAlert className="w-3.5 h-3.5" />
            ผู้ดูแลระบบ
          </span>
        );
      case "teacher":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium text-xs border border-blue-100">
            <Briefcase className="w-3.5 h-3.5" />
            อาจารย์
          </span>
        );
      case "student":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium text-xs border border-emerald-100">
            <GraduationCap className="w-3.5 h-3.5" />
            นักศึกษา
          </span>
        );
      default:
        return <span className="text-slate-500">{role}</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* ส่วนหัว */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600" />
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            ดูรายชื่อ เพิ่ม แก้ไข และลบบัญชีผู้ใช้งานในระบบ
          </p>
        </div>
        <Link href="/admin/users/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 transition-all">
            <Plus className="w-4 h-4" />
            เพิ่มผู้ใช้ใหม่
          </Button>
        </Link>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">ชื่อ-นามสกุล</th>
              <th className="px-6 py-4 font-medium">สิทธิ์การใช้งาน (Role)</th>
              <th className="px-6 py-4 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  ยังไม่มีข้อมูลผู้ใช้งานในระบบ
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {u.name}
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/admin/users/${u.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                        title="แก้ไขผู้ใช้งาน"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    {/* ซ่อนปุ่มลบ ถ้าเป็นบัญชี admin เพื่อป้องกันการเผลอลบตัวเอง */}
                    {u.role !== "admin" && (
                      <DeleteUserBtn id={u.id} name={u.name} />
                    )}
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
