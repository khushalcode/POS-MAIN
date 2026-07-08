import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const period = searchParams.get('period')
    let where: any = {}
    if (category && category !== 'all') where.category = category
    if (period && period !== 'all') {
      const now = new Date()
      const from = new Date()
      if (period === 'today') from.setHours(0, 0, 0, 0)
      else if (period === 'week') from.setDate(now.getDate() - 7)
      else if (period === 'month') from.setMonth(now.getMonth() - 1)
      else if (period === '3months') from.setMonth(now.getMonth() - 3)
      where.date = { gte: from }
    }
    const expenses = await db.expense.findMany({ where, orderBy: { date: 'desc' } })
    return NextResponse.json(expenses)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const expense = await db.expense.create({ data: body })
    return NextResponse.json(expense, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
