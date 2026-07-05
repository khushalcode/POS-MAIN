import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/dashboard — comprehensive overview
export async function GET() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [
    todayBills,
    monthBills,
    totalBills,
    menuItemCount,
    customerCount,
    supplierCount,
    recentBills,
    last7Bills,
    todayExpenses,
    todayMoneyIn,
    todayMoneyOut,
    todayPurchases,
    lowStockItems,
    occupiedTables,
    totalTables,
  ] = await Promise.all([
    db.bill.aggregate({ _sum: { total: true }, _count: true, where: { paidAt: { gte: today } } }),
    db.bill.aggregate({ _sum: { total: true }, _count: true, where: { paidAt: { gte: monthStart } } }),
    db.bill.aggregate({ _sum: { total: true }, _count: true }),
    db.menuItem.count(),
    db.customer.count(),
    db.supplier.count(),
    db.bill.findMany({
      take: 6,
      orderBy: { paidAt: 'desc' },
      include: { order: { include: { items: true } } },
    }),
    db.bill.findMany({
      where: { paidAt: { gte: sevenDaysAgo } },
      select: { paidAt: true, total: true },
    }),
    db.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: today } } }),
    db.moneyIn.aggregate({ _sum: { amount: true }, where: { date: { gte: today } } }),
    db.moneyOut.aggregate({ _sum: { amount: true }, where: { date: { gte: today } } }),
    db.purchase.aggregate({ _sum: { total: true }, where: { createdAt: { gte: today } } }),
    db.menuItem.findMany({ where: { stock: { lte: 5 } }, orderBy: { stock: 'asc' }, take: 5 }),
    db.restaurantTable.count({ where: { status: 'occupied' } }),
    db.restaurantTable.count(),
  ])

  // 7-day revenue chart
  const dayMap = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    dayMap.set(d.toISOString().split('T')[0], 0)
  }
  last7Bills.forEach((b) => {
    const key = b.paidAt.toISOString().split('T')[0]
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + b.total)
  })
  const chartData = Array.from(dayMap.entries()).map(([date, total]) => ({ date, total }))

  // Top selling items (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentBillsForTop = await db.bill.findMany({
    where: { paidAt: { gte: thirtyDaysAgo } },
    include: { order: { include: { items: true } } },
  })
  const itemMap = new Map<string, { name: string; qty: number; revenue: number }>()
  recentBillsForTop.forEach((b) => {
    b.order.items.forEach((i) => {
      if (i.status === 'cancelled') return
      const cur = itemMap.get(i.name) || { name: i.name, qty: 0, revenue: 0 }
      cur.qty += i.quantity
      cur.revenue += i.price * i.quantity
      itemMap.set(i.name, cur)
    })
  })
  const topItems = Array.from(itemMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 5)

  // Today's cash flow
  const cashFlow = {
    salesIn: todayBills._sum.total || 0,
    otherIn: todayMoneyIn._sum.amount || 0,
    expenses: todayExpenses._sum.amount || 0,
    purchases: todayPurchases._sum.total || 0,
    otherOut: todayMoneyOut._sum.amount || 0,
    net:
      (todayBills._sum.total || 0) +
      (todayMoneyIn._sum.amount || 0) -
      (todayExpenses._sum.amount || 0) -
      (todayPurchases._sum.total || 0) -
      (todayMoneyOut._sum.amount || 0),
  }

  return NextResponse.json({
    today: {
      revenue: todayBills._sum.total || 0,
      count: todayBills._count,
      expenses: todayExpenses._sum.amount || 0,
      purchases: todayPurchases._sum.total || 0,
    },
    month: {
      revenue: monthBills._sum.total || 0,
      count: monthBills._count,
    },
    allTime: {
      revenue: totalBills._sum.total || 0,
      count: totalBills._count,
    },
    catalog: {
      menuItems: menuItemCount,
      customers: customerCount,
      suppliers: supplierCount,
    },
    tables: {
      occupied: occupiedTables,
      total: totalTables,
    },
    chartData,
    topItems,
    recentBills,
    lowStock: lowStockItems,
    cashFlow,
  })
}
