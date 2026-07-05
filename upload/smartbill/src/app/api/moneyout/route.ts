import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const moneyOut = await db.moneyOut.findMany({ orderBy: { date: 'desc' } })
    return NextResponse.json(moneyOut)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const moneyOut = await db.moneyOut.create({ data: body })
    return NextResponse.json(moneyOut, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
