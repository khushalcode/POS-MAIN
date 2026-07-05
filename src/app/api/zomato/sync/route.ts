import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getShopId } from '@/lib/shop-context'

// POST /api/zomato/sync — simulate fetching orders from Zomato for the current shop
export async function POST(req: Request) {
  const shopId = getShopId(req as any)
  if (!shopId) return NextResponse.json({ error: 'Shop ID required' }, { status: 400 })

  const samples = [
    { customer: 'Aarav Patel', phone: '98200 11223', items: [['Butter Chicken', 1, 320], ['Butter Naan', 3, 50]], type: 'delivery', address: '12 Marine Drive, Mumbai', payment: 'prepaid' },
    { customer: 'Diya Sharma', phone: '99300 44556', items: [['Paneer Butter Masala', 1, 280], ['Jeera Rice', 1, 140], ['Sweet Lassi', 2, 90]], type: 'pickup', address: null, payment: 'cod' },
    { customer: 'Vivaan Reddy', phone: '90100 77889', items: [['Mutton Biryani', 2, 360], ['Chicken 65', 1, 240]], type: 'delivery', address: '45 Brigade Road, Bengaluru', payment: 'prepaid' },
    { customer: 'Ananya Iyer', phone: '98765 43210', items: [['Veg Biryani', 1, 240], ['Gulab Jamun', 2, 80], ['Masala Chai', 1, 40]], type: 'delivery', address: '78 Anna Salai, Chennai', payment: 'prepaid' },
  ]

  const created = []
  for (const s of samples) {
    if (Math.random() < 0.5) continue

    const items = s.items.map(([name, qty, price]) => ({ name, qty, price }))
    const subtotal = items.reduce((sum, i) => sum + (i.price as number) * (i.qty as number), 0)
    const packagingCharge = items.length * 5
    const deliveryFee = s.type === 'delivery' ? 35 : 0
    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100
    const total = subtotal + taxAmount + packagingCharge + deliveryFee

    const last = await db.zomatoOrder.findFirst({ where: { shopId }, orderBy: { zomatoOrderId: 'desc' } })
    const nextNum = last ? (parseInt(last.zomatoOrderId.replace(/\D/g, '')) || 1000) + 1 : 1001

    const order = await db.zomatoOrder.create({
      data: {
        shopId,
        zomatoOrderId: `ZOM-${nextNum}`,
        customerName: s.customer,
        customerPhone: s.phone,
        deliveryType: s.type,
        address: s.address,
        items: JSON.stringify(items),
        subtotal,
        taxAmount,
        packagingCharge,
        deliveryFee,
        discount: 0,
        total,
        paymentMode: s.payment,
        status: 'new',
      },
    })
    created.push(order)
  }

  return NextResponse.json({ created, count: created.length })
}
