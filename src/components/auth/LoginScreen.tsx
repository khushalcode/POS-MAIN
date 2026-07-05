'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UtensilsCrossed, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff,
  Shield, ChefHat, Store, AlertCircle, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useSession, type SessionUser, type Shop } from '@/lib/session'

interface LoginScreenProps {
  onLoggedOut: () => void
}

export function LoginScreen({ onLoggedOut }: LoginScreenProps) {
  const { login } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }
      toast.success(`Welcome back, ${data.user.name}!`)
      login(data.user as SessionUser, data.shops as Shop[])
      onLoggedOut()
    } catch (e: any) {
      setError(e.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const quickFill = (e: string, p: string) => {
    setEmail(e)
    setPassword(p)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-orange-50/40 to-rose-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-rose-200/40 blur-3xl" />
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
            className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-2xl mx-auto mb-3"
          >
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">ServingSync POS</h1>
          <p className="text-sm text-slate-500 mt-1">Multi-shop restaurant management</p>
        </div>

        <Card className="p-6 shadow-2xl border-slate-200 bg-white/95 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  className="pl-9 h-11"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-11 bg-brand-gradient text-white hover:opacity-90 font-semibold"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4 ml-1.5" /></>
              )}
            </Button>
          </form>

          {/* Quick demo logins */}
          <div className="mt-5 pt-5 border-t border-slate-200">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Demo logins (tap to fill)
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <QuickLogin
                icon={Shield}
                label="Admin"
                color="from-sky-500 to-blue-600"
                onClick={() => quickFill('admin@spice.com', 'admin123')}
              />
              <QuickLogin
                icon={Store}
                label="Staff"
                color="from-orange-500 to-rose-500"
                onClick={() => quickFill('staff@spice.com', 'staff123')}
              />
              <QuickLogin
                icon={ChefHat}
                label="Kitchen"
                color="from-emerald-500 to-teal-600"
                onClick={() => quickFill('kitchen@spice.com', 'kitchen123')}
              />
            </div>
            <button
              onClick={() => quickFill('super@servingsync.com', 'super123')}
              className="w-full mt-1.5 text-[10px] text-slate-500 hover:text-slate-800 underline"
            >
              Or use Super Admin (all shops)
            </button>
          </div>
        </Card>

        <p className="text-center text-[10px] text-slate-400 mt-4">
          3 login roles · Admin / Staff / Kitchen · Multi-shop support
        </p>
      </motion.div>
    </div>
  )
}

function QuickLogin({ icon: Icon, label, color, onClick }: { icon: any; label: string; color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2 rounded-lg bg-gradient-to-br ${color} text-white text-[10px] font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}
