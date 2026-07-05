import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/bills/next-no — get the next bill number to display
export async function GET() {
  const last = await db.bill.findFirst({ orderBy: { billNo: 'desc' } })
  const nextNo = last ? last.billNo + 1 : 1001
  return NextResponse.json({ nextNo })
}
