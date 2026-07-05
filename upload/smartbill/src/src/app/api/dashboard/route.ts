import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    
    const [todaySales, monthSales, totalSales, productCount, customerCount, recentSales] = await Promise.all([
      db.sale.aggregate({
        _sum: { grandTotal: true },
        _count: true,
        where: { createdAt: { gte: today } },
      }),
      db.sale.aggregate({
        _sum: { grandTotal: true },
        _count: true,
        where: { createdAt: { gte: monthStart } },
      }),
      db.sale.aggregate({
        _sum: { grandTotal: true },
        _count: true,
      }),
      db.product.count(),
      db.customer.count(),
      db.sale.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
    ])
    
    // Get daily sales for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    
    const dailySales = await db.sale.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, grandTotal: true },
    })
    
    // Aggregate by day
    const dayMap = new Map<string, number>()
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      dayMap.set(key, 0)
    }
    dailySales.forEach((s) => {
      const key = s.createdAt.toISOString().split('T')[0]
      if (dayMap.has(key)) {
        dayMap.set(key, (dayMap.get(key) || 0) + s.grandTotal)
      }
    })
    
    const chartData = Array.from(dayMap.entries()).map(([date, total]) => ({
      date,
      total,
    }))
    
    // Category sales
    const allSaleItems = await db.saleItem.findMany()
    const categoryMap = new Map<string, number>()
    // We'll use product names as proxy since we don't have category in SaleItem
    
    return NextResponse.json({
      todayRevenue: todaySales._sum.grandTotal || 0,
      todayCount: todaySales._count,
      monthRevenue: monthSales._sum.grandTotal || 0,
      monthCount: monthSales._count,
      totalRevenue: totalSales._sum.grandTotal || 0,
      totalCount: totalSales._count,
      productCount,
      customerCount,
      recentSales,
      chartData,
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data', details: error.message }, { status: 500 })
  }
}
