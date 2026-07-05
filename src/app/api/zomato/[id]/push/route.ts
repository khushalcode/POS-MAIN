import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

type Ctx = { params: Promise<{ id: string }> }

// POST /api/zomato/[id]/push
// Convert a Zomato order into an internal Order + OrderItems + send to kitchen.
// Uses the virtual "Direct Counter" table (number 0) so the order shows up in
// the kitchen display like any other takeaway order.
export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params
  const zomato = await db.zomatoOrder.findUnique({ where: { id } })
  if (!zomato) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (zomato.internalOrderId) {
    return NextResponse.json({ error: 'Already pushed to kitchen', internalOrderId: zomato.internalOrderId }, { status: 400 })
  }

  // Get the virtual Direct Counter table
  let directTable = await db.restaurantTable.findUnique({ where: { number: 0 } })
  if (!directTable) {
    directTable = await db.restaurantTable.create({
      data: { number: 0, name: 'Direct Counter', capacity: 0, status: 'available' },
    })
  }

  // Parse items
  const items = (() => { try { return JSON.parse(zomato.items) as any[] } catch { return [] } })()
  if (items.length === 0) {
    return NextResponse.json({ error: 'No items to push' }, { status: 400 })
  }

  // Create the internal order in a transaction
  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        tableId: directTable!.id,
        status: 'sent', // immediately sent to kitchen
        type: zomato.deliveryType === 'pickup' ? 'takeaway' : 'direct',
        guests: 1,
        customerName: zomato.customerName,
        notes: `Zomato Order ${zomato.zomatoOrderId}${zomato.notes ? ' — ' + zomato.notes : ''}`,
        kotPrinted: true,
      },
    })

    // Create order items — match against menu by name where possible
    for (const it of items) {
      const menuMatch = await tx.menuItem.findFirst({ where: { name: it.name } })
      await tx.orderItem.create({
        data: {
          orderId: created.id,
          menuItemId: menuMatch?.id || 'unknown',
          name: String(it.name),
          price: Number(it.price),
          quantity: Number(it.qty),
          status: 'pending',
        },
      })
    }

    // Mark the direct table as occupied (briefly, until billed)
    await tx.restaurantTable.update({
      where: { id: directTable!.id },
      data: { status: 'occupied', currentOrderId: created.id },
    })

    // Link Zomato order to internal order + advance status
    await tx.zomatoOrder.update({
      where: { id },
      data: { internalOrderId: created.id, status: 'accepted' },
    })

    return created
  })

  const fullOrder = await db.order.findUnique({
    where: { id: order.id },
    include: { items: true, table: true },
  })

  return NextResponse.json({ order: fullOrder, zomatoOrderId: zomato.zomatoOrderId })
}
