import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || ''
  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    : {}
  const suppliers = await db.supplier.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ suppliers })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  if (!b.name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const s = await db.supplier.create({
    data: {
      name: b.name,
      phone: b.phone || null,
      email: b.email || null,
      address: b.address || null,
      notes: b.notes || null,
    },
  })
  return NextResponse.json({ supplier: s }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const b = await req.json()
  if (!b.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const s = await db.supplier.update({
    where: { id: b.id },
    data: {
      ...(b.name != null && { name: b.name }),
      ...(b.phone != null && { phone: b.phone }),
      ...(b.email != null && { email: b.email }),
      ...(b.address != null && { address: b.address }),
      ...(b.notes != null && { notes: b.notes }),
    },
  })
  return NextResponse.json({ supplier: s })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await db.supplier.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
