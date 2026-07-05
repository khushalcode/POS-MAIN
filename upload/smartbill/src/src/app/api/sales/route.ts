import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const period = req.nextUrl.searchParams.get('period') || 'all'
    const where: any = {}
    if (period === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      where.createdAt = { gte: today }
    } else if (period === 'month') {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      where.createdAt = { gte: monthStart }
    }
    const sales = await db.sale.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}

async function createSaleWithInvoice(body: any, attempt = 0): Promise<any> {
  if (attempt > 5) {
    throw new Error('Failed to generate unique invoice number after 5 attempts')
  }

  const lastSale = await db.sale.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  })

  let invoiceNum = 1
  if (lastSale?.invoiceNumber) {
    const match = lastSale.invoiceNumber.match(/(\d+)$/)
    if (match) invoiceNum = parseInt(match[1]) + 1 + attempt
  }
  const invoiceNumber = `INV-${String(invoiceNum).padStart(6, '0')}`

  try {
    return await db.sale.create({
      data: {
        invoiceNumber,
        customerName: body.customerName || null,
        subtotal: body.subtotal,
        discount: body.discount || 0,
        tax: body.tax || 0,
        taxRate: body.taxRate || 5,
        grandTotal: body.grandTotal,
        paymentMode: body.paymentMode || 'Cash',
        status: 'completed',
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return createSaleWithInvoice(body, attempt + 1)
    }
    throw err
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sale = await createSaleWithInvoice(body)

    // Update product stock
    for (const item of body.items) {
      if (item.productId) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }
    }

    return NextResponse.json(sale, { status: 201 })
  } catch (error: any) {
    console.error('Sale creation error:', error)
    return NextResponse.json({ error: 'Failed to create sale', details: error.message }, { status: 500 })
  }
}
