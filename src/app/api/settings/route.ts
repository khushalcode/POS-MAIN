import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET — return singleton shop settings (create default if missing)
export async function GET() {
  let settings = await db.shopSetting.findFirst()
  if (!settings) {
    settings = await db.shopSetting.create({ data: {} })
  }
  return NextResponse.json({ settings })
}

// PUT — update shop settings
export async function PUT(req: NextRequest) {
  const b = await req.json()
  let settings = await db.shopSetting.findFirst()
  if (!settings) {
    settings = await db.shopSetting.create({ data: {} })
  }
  const updated = await db.shopSetting.update({
    where: { id: settings.id },
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
