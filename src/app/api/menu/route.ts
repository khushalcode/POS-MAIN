import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/menu — list all menu items (optionally filter by ?category=)
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category')
  const items = await db.menuItem.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ items })
}

// POST /api/menu — create a menu item
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, category, price, cost = 0, stock = 0, unit = 'Pcs', image = null, available = true } = body
  if (!name || price == null) {
    return NextResponse.json({ error: 'name and price are required' }, { status: 400 })
  }
  const item = await db.menuItem.create({
    data: {
      name,
      category: category || 'General',
      price: Number(price),
      cost: Number(cost),
      stock: Number(stock),
      unit,
      image,
      available,
    },
  })
  return NextResponse.json({ item }, { status: 201 })
}
