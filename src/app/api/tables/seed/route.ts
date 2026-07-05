import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/tables/seed — seed 10 default tables if none exist
export async function POST() {
  const existing = await db.restaurantTable.count()
  if (existing > 0) {
    const tables = await db.restaurantTable.findMany({ orderBy: { number: 'asc' } })
    return NextResponse.json({ seeded: false, count: existing, tables })
  }
  const created = []
  for (let i = 1; i <= 10; i++) {
    created.push(
      db.restaurantTable.create({
        data: { number: i, name: `Table ${i}`, capacity: 4 },
      })
    )
  }
  const tables = await Promise.all(created)
  return NextResponse.json({ seeded: true, count: tables.length, tables })
}
