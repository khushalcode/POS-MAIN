import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tables — list all tables with their current order
export async function GET() {
  const tables = await db.restaurantTable.findMany({
    orderBy: { number: 'asc' },
    include: {
      currentOrder: {
        include: { items: true },
      },
    },
  })
  return NextResponse.json({ tables })
}

// POST /api/tables — create a new table
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { number, name, capacity } = body
  if (number == null) {
    return NextResponse.json({ error: 'number is required' }, { status: 400 })
  }
  const table = await db.restaurantTable.create({
    data: {
      number: Number(number),
      name: name || `Table ${number}`,
      capacity: capacity ? Number(capacity) : 4,
    },
  })
  return NextResponse.json({ table }, { status: 201 })
}
