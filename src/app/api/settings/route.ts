import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getShopId } from '@/lib/shop-context'

// GET — return shop-scoped settings (auto-create from Shop if missing)
export async function GET(req: NextRequest) {
  const shopId = getShopId(req)
  if (!shopId) return NextResponse.json({ error: 'Shop ID required' }, { status: 400 })

  let settings = await db.shopSetting.findUnique({ where: { shopId } })
  if (!settings) {
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    settings = await db.shopSetting.create({
      data: {
        shopId,
        shopName: shop?.name || 'Restaurant',
        address: shop?.address || null,
        phone: shop?.phone || null,
        gstin: shop?.gstin || null,
        taxRate: shop?.taxRate || 5,
        currency: shop?.currency || 'Rs.',
      },
    })
  }
  return NextResponse.json({ settings })
}

// PUT — update shop-scoped settings
export async function PUT(req: NextRequest) {
  const shopId = getShopId(req)
  if (!shopId) return NextResponse.json({ error: 'Shop ID required' }, { status: 400 })

  const b = await req.json()
  let settings = await db.shopSetting.findUnique({ where: { shopId } })
  if (!settings) {
    settings = await db.shopSetting.create({ data: { shopId } })
  }
  const updated = await db.shopSetting.update({
    where: { shopId },
    data: {
      ...(b.shopName != null && { shopName: b.shopName }),
      ...(b.address != null && { address: b.address }),
      ...(b.phone != null && { phone: b.phone }),
      ...(b.email != null && { email: b.email }),
      ...(b.gstin != null && { gstin: b.gstin }),
      ...(b.taxRate != null && { taxRate: Number(b.taxRate) }),
      ...(b.serviceRate != null && { serviceRate: Number(b.serviceRate) }),
      ...(b.currency != null && { currency: b.currency }),
      ...(b.invoicePrefix != null && { invoicePrefix: b.invoicePrefix }),
      ...(b.kotPrefix != null && { kotPrefix: b.kotPrefix }),
      ...(b.footerNote != null && { footerNote: b.footerNote }),
    },
  })
  return NextResponse.json({ settings: updated })
}
