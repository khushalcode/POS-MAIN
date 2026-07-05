import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/license/status — check if there's a valid active license on this machine
export async function GET() {
  const activation = await db.licenseActivation.findFirst()
  if (!activation) {
    return NextResponse.json({ active: false, reason: 'not_activated' })
  }
  const now = new Date()
  if (activation.expiresAt < now) {
    return NextResponse.json({
      active: false,
      reason: 'expired',
      activatedAt: activation.activatedAt,
      expiresAt: activation.expiresAt,
    })
  }
  return NextResponse.json({
    active: true,
    activatedAt: activation.activatedAt,
    expiresAt: activation.expiresAt,
    daysLeft: Math.ceil((activation.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  })
}
