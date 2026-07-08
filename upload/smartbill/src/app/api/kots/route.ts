import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    let where: any = {}
    if (status && status !== 'all') where.status = status
    const kots = await db.kot.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(kots)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const count = await db.kot.count()
    const kotNumber = `KOT-${String(count + 1).padStart(6, '0')}`
    const kot = await db.kot.create({ data: { ...body, kotNumber } })
    return NextResponse.json(kot, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
