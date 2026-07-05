import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/license/validate — check if a key is valid (not used, exists)
// Body: { key: string }
export async function POST(req: NextRequest) {
  const { key } = await req.json()
  if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 })

  const normalized = key.trim().toUpperCase()
  const licenseKey = await db.licenseKey.findUnique({ where: { key: normalized } })

  if (!licenseKey) {
    return NextResponse.json({ valid: false, reason: 'invalid_key' })
  }
  if (licenseKey.used) {
    return NextResponse.json({ valid: false, reason: 'already_used' })
  }
  return NextResponse.json({
    valid: true,
    duration: licenseKey.duration,
    durationLabel: `${licenseKey.duration} day${licenseKey.duration > 1 ? 's' : ''}`,
  })
}
