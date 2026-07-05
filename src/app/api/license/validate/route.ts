import { NextRequest, NextResponse } from 'next/server'
import { isValidKey } from '@/lib/license-keys'

/**
 * POST /api/license/validate
 * Checks if a key is valid. Uses hardcoded list — works on Vercel.
 */
export async function POST(req: NextRequest) {
  const { key } = await req.json()
  if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 })

  const result = isValidKey(key)
  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason })
  }
  return NextResponse.json({
    valid: true,
    duration: result.duration,
    durationLabel: `${result.duration} day${result.duration > 1 ? 's' : ''}`,
  })
}
