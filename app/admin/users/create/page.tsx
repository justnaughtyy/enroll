import UserForm from "./UserForm"

export default function CreateUserPage() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white rounded-xl shadow-sm border border-slate-200 mt-6">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">เพิ่มผู้ใช้ใหม่</h1>
        <p className="text-slate-500 text-sm mt-1">สร้างบัญชีสำหรับผู้ดูแลระบบ อาจารย์ หรือนักศึกษา</p>
      </div>
      
      {/* เรียกใช้งาน Client Component ที่เป็นฟอร์ม */}
      <UserForm />
    </div>
  )
}