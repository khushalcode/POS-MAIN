import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getShopId } from '@/lib/shop-context'

// GET /api/audit?action=&userId=&from=&to=
export async function GET(req: NextRequest) {
  const shopId = getShopId(req)
  const action = req.nextUrl.searchParams.get('action')
  const userId = req.nextUrl.searchParams.get('userId')
  const from = req.nextUrl.searchParams.get('from')
  const to = req.nextUrl.searchParams.get('to')
  const limit = Number(req.nextUrl.searchParams.get('limit') || 200)

  const where: any = {}
  // Super admin (no shopId) sees all; shop-scoped sees own shop only
  if (shopId) where.shopId = shopId
  if (action) where.action = action
  if (userId) where.userId = userId
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  }

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({ logs })
}

// DELETE /api/audit?before=ISO_DATE — clear logs older than the given date
export async function DELETE(req: NextRequest) {
  const before = req.nextUrl.searchParams.get('before')
  if (!before) {
    return NextResponse.json({ error: 'before date required' }, { status: 400 })
  }
  const result = await db.auditLog.deleteMany({
    where: { createdAt: { lt: new Date(before) } },
  })
  return NextResponse.json({ deleted: result.count })
}
