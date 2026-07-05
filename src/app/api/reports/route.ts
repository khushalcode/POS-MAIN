import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reports?type=daily|monthly|range&from=&to=
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const type = sp.get('type') || 'daily'
  const from = sp.get('from')
  const to = sp.get('to')

  let startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  if (type === 'monthly') {
    startDate = new Date()
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)
  } else if (type === 'range' && from) {
    startDate = new Date(from)
    startDate.setHours(0, 0, 0, 0)
  }
  const endDate = to ? new Date(to) : new Date()
  endDate.setHours(23, 59, 59, 999)

  const [bills, expenses, moneyIn, moneyOut, purchases] = await Promise.all([
    db.bill.findMany({
      where: { paidAt: { gte: startDate, lte: endDate } },
      include: { order: { include: { items: true } } },
      orderBy: { paidAt: 'desc' },
    }),
    db.expense.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
    db.moneyIn.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
    db.moneyOut.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
    db.purchase.findMany({ where: { createdAt: { gte: startDate, lte: endDate } } }),
  ])

  const salesRevenue = bills.reduce((s, b) => s + b.total, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalPurchases = purchases.reduce((s, p) => s + p.total, 0)
  const totalMoneyIn = moneyIn.reduce((s, m) => s + m.amount, 0)
  const totalMoneyOut = moneyOut.reduce((s, m) => s + m.amount, 0)

  // Payment mode breakdown
  const byPayment: Record<string, { count: number; total: number }> = {}
  bills.forEach((b) => {
    byPayment[b.paymentMode] = byPayment[b.paymentMode] || { count: 0, total: 0 }
    byPayment[b.paymentMode].count++
    byPayment[b.paymentMode].total += b.total
  })

  // Top items
  const itemMap = new Map<string, { name: string; qty: number; revenue: number }>()
  bills.forEach((b) => {
    b.order.items.forEach((i) => {
      if (i.status === 'cancelled') return
      const cur = itemMap.get(i.name) || { name: i.name, qty: 0, revenue: 0 }
      cur.qty += i.quantity
      cur.revenue += i.price * i.quantity
      itemMap.set(i.name, cur)
    })
  })
  const topItems = Array.from(itemMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 10)

  // Expense breakdown by category
  const expenseByCategory: Record<string, number> = {}
  expenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount
  })

  // Per-day breakdown (for charts)
  const dayMap = new Map<string, { sales: number; expenses: number }>()
  bills.forEach((b) => {
    const k = b.paidAt.toISOString().split('T')[0]
    dayMap.set(k, { sales: (dayMap.get(k)?.sales || 0) + b.total, expenses: dayMap.get(k)?.expenses || 0 })
  })
  expenses.forEach((e) => {
    const k = e.date.toISOString().split('T')[0]
    const cur = dayMap.get(k) || { sales: 0, expenses: 0 }
    cur.expenses += e.amount
    dayMap.set(k, cur)
  })
  const dailyBreakdown = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }))

  return NextResponse.json({
    period: { from: startDate, to: endDate, type },
    summary: {
      salesRevenue,
      totalExpenses,
      totalPurchases,
      totalMoneyIn,
      totalMoneyOut,
      netProfit: salesRevenue - totalExpenses - totalPurchases,
      cashFlow: salesRevenue + totalMoneyIn - totalExpenses - totalPurchases - totalMoneyOut,
      billCount: bills.length,
      avgBill: bills.length > 0 ? salesRevenue / bills.length : 0,
    },
    byPayment,
    topItems,
    expenseByCategory,
    dailyBreakdown,
    bills,
  })
}
