import { NextRequest, NextResponse } from 'next/server'
import { isValidKey } from '@/lib/license-keys'
import { db } from '@/lib/db'

/**
 * POST /api/license/activate
 * Activates a license key. Returns activation details.
 * Stores activation in DB (if available) — on Vercel, the DB may not persist,
 * but the client also stores activation in localStorage as a fallback.
 */
export async function POST(req: NextRequest) {
  const { key } = await req.json()
  if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 })

  const normalized = key.trim().toUpperCase()
  const result = isValidKey(normalized)

  if (!result.valid) {
    return NextResponse.json({ error: 'Invalid license key' }, { status: 400 })
  }

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + result.duration)

  // Try to store in DB (works on local/Electron; may not persist on Vercel)
  try {
    // Mark key as used in DB if it exists
    const dbKey = await db.licenseKey.findUnique({ where: { key: normalized } })
    if (dbKey && !dbKey.used) {
      await db.licenseKey.update({
        where: { id: dbKey.id },
        data: { used: true },
      })
    }

    // Store activation in DB
    const existing = await db.licenseActivation.findFirst()
    if (existing) {
      await db.licenseActivation.delete({ where: { id: existing.id } })
    }
    await db.licenseActivation.create({
      data: {
        key: normalized,
        activatedAt: now,
        expiresAt,
      },
    })
  } catch {
    // DB might not be available on Vercel — that's OK
    // Client will store activation in localStorage
  }

  return NextResponse.json({
    active: true,
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    daysLeft: result.duration,
  })
}
