import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    let where: any = {}
    if (status && status !== 'all') where.status = status
    const orders = await db.order.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(orders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const count = await db.order.count()
    const orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`
    const order = await db.order.create({ data: { ...body, orderNumber } })
    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
