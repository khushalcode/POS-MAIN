import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const settings = await db.shopSetting.findFirst()
    if (!settings) {
      const created = await db.shopSetting.create({ data: {} })
      return NextResponse.json(created)
    }
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const settings = await db.shopSetting.findFirst()
    if (!settings) {
      const created = await db.shopSetting.create({ data: body })
      return NextResponse.json(created)
    }
    const updated = await db.shopSetting.update({
      where: { id: settings.id },
      data: {
        shopName: body.shopName,
        address: body.address,
        phone: body.phone,
        email: body.email,
        taxRate: parseFloat(body.taxRate),
        currency: body.currency,
        invoicePrefix: body.invoicePrefix,
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
