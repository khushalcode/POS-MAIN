import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const moneyIn = await db.moneyIn.findMany({ orderBy: { date: 'desc' } })
    return NextResponse.json(moneyIn)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const moneyIn = await db.moneyIn.create({ data: body })
    return NextResponse.json(moneyIn, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
