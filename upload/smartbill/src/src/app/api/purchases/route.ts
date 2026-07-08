import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period')
    let where: any = {}
    if (period && period !== 'all') {
      const now = new Date()
      const from = new Date()
      if (period === 'today') from.setHours(0, 0, 0, 0)
      else if (period === 'week') from.setDate(now.getDate() - 7)
      else if (period === 'month') from.setMonth(now.getMonth() - 1)
      else if (period === '3months') from.setMonth(now.getMonth() - 3)
      where.createdAt = { gte: from }
    }
    const purchases = await db.purchase.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(purchases)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const count = await db.purchase.count()
    const invoiceNumber = `PUR-${String(count + 1).padStart(6, '0')}`
    const purchase = await db.purchase.create({ data: { ...body, invoiceNumber } })
    return NextResponse.json(purchase, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
