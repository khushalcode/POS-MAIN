'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Clock, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface LicenseActivationScreenProps {
  onActivated: () => void
}

export function LicenseActivationScreen({ onActivated }: LicenseActivationScreenProps) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<{ valid: boolean; duration?: number; reason?: string } | null>(null)

  // Auto-validate as user types (debounced)
  useEffect(() => {
    if (key.length < 10) {
      setPreview(null)
      return
    }
    const t = setTimeout(async () => {
      setValidating(true)
      try {
        const res = await fetch('/api/license/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        })
        const data = await res.json()
        setPreview(data)
      } catch {
        setPreview(null)
      } finally {
        setValidating(false)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [key])

  const handleActivate = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Activation failed')
        return
      }
      toast.success(`License activated! Valid for ${data.daysLeft} days.`)
      onActivated()
    } catch (e: any) {
      setError(e.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoKey: string) => {
    setKey(demoKey)
  }

  return (
    <div className="min-h-screen img-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-rose-500/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-2xl mx-auto mb-3"
          >
            <ShieldCheck className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">ServingSync POS</h1>
          <p className="text-sm text-slate-400 mt-1">License Activation Required</p>
        </div>

        <Card className="p-6 shadow-2xl border-slate-700 bg-slate-800/90 backdrop-blur">
          <div className="text-center mb-4">
            <Key className="w-10 h-10 text-orange-400 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-white">Enter your license key</h2>
            <p className="text-xs text-slate-400 mt-1">
              Activate your copy to unlock all features. License is valid for 1 year from activation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">License Key</Label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="SSYNC-XXXX-XXXX-XXX"
                className="h-11 font-mono text-sm tracking-wider bg-slate-900 border-slate-600 text-white placeholder-slate-500"
                autoFocus
              />
              {/* Validation preview */}
              <AnimatePresence>
                {preview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {preview.valid ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valid key — {preview.duration} days of access
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {preview.reason === 'already_used' ? 'This key has already been used' : 'Invalid key'}
                      </div>
                    )}
                  </motion.div>
                )}
                {validating && !preview && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking…
                  </div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm text-rose-400 bg-rose-950/50 border border-rose-800 px-3 py-2 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleActivate}
              disabled={loading || !key || !preview?.valid}
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Activating…</>
              ) : (
                <><Key className="w-4 h-4 mr-1.5" /> Activate License</>
              )}
            </Button>
          </div>

          {/* Demo keys */}
          <div className="mt-5 pt-5 border-t border-slate-700">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Demo keys (tap to fill)
            </p>
            <div className="space-y-1">
              <DemoKey label="1 Year License" code="SSYNC-DEMO-2025-365" onClick={fillDemo} />
              <DemoKey label="30 Days" code="SSYNC-DEMO-2025-030" onClick={fillDemo} />
              <DemoKey label="7 Days" code="SSYNC-DEMO-2025-007" onClick={fillDemo} />
            </div>
          </div>
        </Card>

        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 1-year validity</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> One-time activation</span>
        </div>
      </motion.div>
    </div>
  )
}

function DemoKey({ label, code, onClick }: { label: string; code: string; onClick: (c: string) => void }) {
  return (
    <button
      onClick={() => onClick(code)}
      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-700 text-left transition-colors"
    >
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className="text-[10px] font-mono text-orange-400">{code}</span>
    </button>
  )
}

// Expired license screen
export function LicenseExpiredScreen({ expiresAt, onReactivate }: { expiresAt: string; onReactivate: () => void }) {
  return (
    <div className="min-h-screen img-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-4"
        >
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-2">License Expired</h1>
        <p className="text-sm text-slate-400 mb-1">
          Your license expired on
        </p>
        <p className="text-sm font-semibold text-rose-400 mb-6">
          {new Date(expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
        <Card className="p-6 bg-slate-800/90 border-slate-700">
          <p className="text-sm text-slate-300 mb-4">
            To continue using ServingSync POS, please enter a new license key.
          </p>
          <Button
            onClick={onReactivate}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white"
          >
            <Key className="w-4 h-4 mr-1.5" /> Enter New License Key
          </Button>
        </Card>
      </motion.div>
    </div>
  )
}

// License check wrapper hook
export function useLicenseCheck() {
  const [status, setStatus] = useState<'loading' | 'active' | 'not_activated' | 'expired'>('loading')
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/license/status')
        const data = await res.json()
        if (data.active) {
          setStatus('active')
          setExpiresAt(data.expiresAt)
          setDaysLeft(data.daysLeft)
        } else if (data.reason === 'expired') {
          setStatus('expired')
          setExpiresAt(data.expiresAt)
        } else {
          setStatus('not_activated')
        }
      } catch {
        setStatus('not_activated')
      }
    }
    check()
  }, [])

  return { status, expiresAt, daysLeft, recheck: () => setStatus('loading') }
}
