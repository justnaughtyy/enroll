"use client"

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts"

interface ChartData {
  name: string
  enrollments: number
  capacity: number
}

export default function AdminChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          {/* กราฟแท่งแสดงจำนวนที่รับได้ (สีเทาอ่อน) */}
          <Bar dataKey="capacity" name="จำนวนที่รับได้" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
          {/* กราฟแท่งแสดงจำนวนคนลงทะเบียนจริง (สีฟ้า) */}
          <Bar dataKey="enrollments" name="ลงทะเบียนจริง" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}