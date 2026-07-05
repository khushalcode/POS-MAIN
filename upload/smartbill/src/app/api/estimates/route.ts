import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    let where: any = {}
    if (status && status !== 'all') where.status = status
    const estimates = await db.estimate.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(estimates)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const count = await db.estimate.count()
    const estimateNumber = `EST-${String(count + 1).padStart(6, '0')}`
    const estimate = await db.estimate.create({ data: { ...body, estimateNumber } })
    return NextResponse.json(estimate, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
