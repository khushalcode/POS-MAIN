import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const users = await db.appUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  })
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const b = await req.json()
  if (!b.name || !b.email || !b.password) {
    return NextResponse.json({ error: 'name, email, password required' }, { status: 400 })
  }
  const exists = await db.appUser.findUnique({ where: { email: b.email } })
  if (exists) return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
  const u = await db.appUser.create({
    data: {
      name: b.name,
      email: b.email,
      password: b.password, // NOTE: plain text for offline single-machine use
      role: b.role || 'staff',
      active: b.active !== false,
    },
  })
  return NextResponse.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const b = await req.json()
  if (!b.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const u = await db.appUser.update({
    where: { id: b.id },
    data: {
      ...(b.name != null && { name: b.name }),
      ...(b.email != null && { email: b.email }),
      ...(b.role != null && { role: b.role }),
      ...(b.active != null && { active: b.active }),
      ...(b.password != null && { password: b.password }),
    },
  })
  return NextResponse.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await db.appUser.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
