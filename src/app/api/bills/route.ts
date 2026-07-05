import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/bills?from=&to=&table=&q=
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const from = sp.get('from')
  const to = sp.get('to')
  const table = sp.get('table')
  const q = sp.get('q')

  const bills = await db.bill.findMany({
    where: {
      ...(from || to
        ? {
            paidAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(table ? { tableNumber: Number(table) } : {}),
    },
    include: { order: { include: { items: true } } },
    orderBy: { paidAt: 'desc' },
  })

  let filtered = bills
  if (q) {
    const term = q.toLowerCase()
    filtered = bills.filter(
      (b) =>
        String(b.billNo).includes(term) ||
        b.order.items.some((i) => i.name.toLowerCase().includes(term))
    )
  }

  // Summary
  const totalRevenue = filtered.reduce((s, b) => s + b.total, 0)
  const totalBills = filtered.length
  const byPayment = filtered.reduce<Record<string, number>>((acc, b) => {
    acc[b.paymentMode] = (acc[b.paymentMode] || 0) + b.total
    return acc
  }, {})

  return NextResponse.json({
    bills: filtered,
    summary: { totalRevenue, totalBills, byPayment },
  })
}

// POST /api/bills — generate a bill from an order and mark it paid
// Body: { orderId, taxRate?, discount?, serviceCharge?, paymentMode? }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { orderId, taxRate = 0, discount = 0, serviceCharge = 0, paymentMode = 'cash' } = body

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, table: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.status === 'paid') {
    return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
  }

  const activeItems = order.items.filter((i) => i.status !== 'cancelled')
  const subtotal = activeItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const taxAmount = subtotal * (Number(taxRate) / 100)
  const total = Math.max(0, subtotal + taxAmount + Number(serviceCharge) - Number(discount))

  // Pick next bill number
  const last = await db.bill.findFirst({ orderBy: { billNo: 'desc' } })
  const billNo = last ? last.billNo + 1 : 1001

  const bill = await db.$transaction(async (tx) => {
    const created = await tx.bill.create({
      data: {
        billNo,
        orderId,
        tableNumber: order.table.number,
        subtotal,
        taxRate: Number(taxRate),
        taxAmount,
        discount: Number(discount),
        serviceCharge: Number(serviceCharge),
        total,
        paymentMode,
        paymentStatus: 'paid',
        paidAt: new Date(),
      },
    })
    // Mark order as paid
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'paid', billPrinted: true },
    })
    // Release the table
    await tx.restaurantTable.update({
      where: { id: order.tableId },
      data: { status: 'available', currentOrderId: null },
    })
    return created
  })

  const full = await db.bill.findUnique({
    where: { id: bill.id },
    include: { order: { include: { items: true } } },
  })

  return NextResponse.json({ bill: full }, { status: 201 })
}
