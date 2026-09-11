import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: cartItemId } = await params

    // ลบข้อมูลออกจากตาราง CartItem
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    })

    return NextResponse.json({ message: "ลบวิชาออกจากตะกร้าสำเร็จ" }, { status: 200 })
  } catch (error: any) {
    console.error("Delete cart item error:", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาด ไม่สามารถลบได้" }, { status: 500 })
  }
}