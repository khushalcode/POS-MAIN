import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/license/activate — activate a license key on this machine
// Body: { key: string, machineId?: string }
export async function POST(req: NextRequest) {
  const { key, machineId } = await req.json()
  if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 })

  const normalized = key.trim().toUpperCase()
  const licenseKey = await db.licenseKey.findUnique({ where: { key: normalized } })

  if (!licenseKey) {
    return NextResponse.json({ error: 'Invalid license key' }, { status: 400 })
  }
  if (licenseKey.used) {
    return NextResponse.json({ error: 'This license key has already been used' }, { status: 400 })
  }

  // Check if there's already an activation (replace it)
  const existing = await db.licenseActivation.findFirst()

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + licenseKey.duration)

  // Transaction: mark key as used + create activation
  const activation = await db.$transaction(async (tx) => {
    await tx.licenseKey.update({
      where: { id: licenseKey.id },
      data: { used: true },
    })
    if (existing) {
      await tx.licenseActivation.delete({ where: { id: existing.id } })
    }
    return tx.licenseActivation.create({
      data: {
        key: normalized,
        activatedAt: now,
        expiresAt,
        machineId: machineId || null,
      },
    })
  })

  return NextResponse.json({
    active: true,
    activatedAt: activation.activatedAt,
    expiresAt: activation.expiresAt,
    daysLeft: licenseKey.duration,
  })
}
