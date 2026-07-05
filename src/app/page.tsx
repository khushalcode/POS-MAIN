'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UtensilsCrossed, ChefHat, Receipt, Wifi, WifiOff, ArrowRight,
  Store, LayoutDashboard, Zap, Store as StoreIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/lib/session'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { ShopPicker } from '@/components/auth/ShopPicker'
import CounterMode from '@/components/counter/CounterMode'
import KitchenMode from '@/components/kitchen/KitchenMode'
import HistoryMode from '@/components/history/HistoryMode'
import ManagementMode from '@/components/management/ManagementMode'

type Mode = 'home' | 'counter' | 'kitchen' | 'history' | 'management' | 'direct'

export default function Home() {
  const { user, currentShop, loading } = useSession()
  const [mode, setMode] = useState<Mode>('home')

  // Restore saved mode once session is loaded
  useEffect(() => {
    if (loading || !user) return
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('posMode') as Mode | null
    if (saved && saved !== 'home') setMode(saved)
  }, [loading, user])

  // When user logs out (user becomes null), reset to home
  useEffect(() => {
    if (!loading && !user) {
      setMode('home')
      localStorage.removeItem('posMode')
    }
  }, [loading, user])

  const enterMode = (m: Mode) => {
    setMode(m)
    if (typeof window !== 'undefined') localStorage.setItem('posMode', m)
  }

  const backHome = () => {
    setMode('home')
    if (typeof window !== 'undefined') localStorage.removeItem('posMode')
  }

  // Loading splash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 rounded-xl bg-brand-gradient animate-pulse" />
      </div>
    )
  }

  // Not logged in → show login screen
  if (!user) {
    return <LoginScreen onLoggedOut={() => setMode('home')} />
  }

  // Logged in but no shop selected (multi-shop user) → show shop picker
  if (!currentShop) {
    return <ShopPicker onPick={() => setMode('home')} />
  }

  // Render selected mode
  if (mode === 'counter') return <CounterMode onExit={backHome} />
  if (mode === 'kitchen') return <KitchenMode onExit={backHome} />
  if (mode === 'history') return <HistoryMode onExit={backHome} />
  if (mode === 'management') return <ManagementMode onExit={backHome} />
  if (mode === 'direct') return <CounterMode onExit={backHome} directMode />

  return <HomeScreen onSelect={enterMode} />
}

function HomeScreen({ onSelect }: { onSelect: (m: Mode) => void }) {
  const { user, currentShop, shops, logout, theme } = useSession()
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  const modes = [
    {
      key: 'counter' as Mode,
      title: 'Counter Mode',
      subtitle: 'Take orders, manage tables, print KOT & bills',
      icon: Store,
      tags: ['Table grid', 'Direct Order', '2-copy print', 'Billing'],
    },
    {
      key: 'direct' as Mode,
      title: 'Direct Order',
      subtitle: 'Quick takeaway — skip table assignment',
      icon: Zap,
      tags: ['Fast checkout', 'Takeaway', 'Walk-in'],
      featured: true,
    },
    {
      key: 'kitchen' as Mode,
      title: 'Kitchen Mode',
      subtitle: 'Live KOT display — chefs update item status',
      icon: ChefHat,
      tags: ['Real-time KOT', 'Item status', 'Ready alerts'],
    },
    {
      key: 'history' as Mode,
      title: 'Bills & History',
      subtitle: 'Search past bills, view daily revenue',
      icon: Receipt,
      tags: ['Bill search', 'Revenue', 'Day summary'],
    },
    {
      key: 'management' as Mode,
      title: 'Management',
      subtitle: 'Back-office: dashboard, inventory, finance, Zomato, reports',
      icon: LayoutDashboard,
      tags: ['Dashboard', 'Inventory', 'Finance', 'Reports', 'Zomato', 'Backup'],
      span: 'md:col-span-3',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-rose-50/30">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900">ServingSync POS</h1>
              <p className="text-[10px] text-slate-500">
                {currentShop?.name} · {user?.name} ({user?.role})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Shop badge — tap to switch */}
            {shops.length > 1 && (
              <button
                onClick={() => onSelect('home')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-soft text-brand-text border border-brand/20 text-xs font-semibold"
              >
                <StoreIcon className="w-3.5 h-3.5" />
                {currentShop?.name}
              </button>
            )}
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${
              online ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {online ? 'Online' : 'Offline'}
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-xs">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-3 bg-brand-soft text-brand-text border-brand/20 hover:bg-brand-soft">
            {currentShop?.code} · Multi-shop ready
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            Welcome, {user?.name.split(' ')[0]}.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Pick a mode for this device. Counter takes orders & prints bills. Kitchen shows live KOTs.
            Direct Order is the fastest path for takeaways. Management has everything else.
          </p>
        </motion.div>
      </section>

      {/* Mode cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 grid gap-4 sm:gap-6 md:grid-cols-3">
        {modes.map((m, i) => (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            className={m.span}
          >
            <Card
              onClick={() => onSelect(m.key)}
              className={`group cursor-pointer relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                m.featured ? 'ring-2 ring-brand ring-offset-2' : ''
              } ${m.span ? 'min-h-[180px]' : ''}`}
            >
              {m.featured ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 opacity-95 pointer-events-none" />
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <Badge className="bg-white text-orange-700 border-0 text-[10px] font-bold uppercase">Fast</Badge>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-brand-gradient opacity-90 pointer-events-none" />
              )}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)] pointer-events-none" />
              <div className={`relative p-5 sm:p-7 text-white ${m.span ? 'md:flex md:items-center md:gap-6' : ''}`}>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30 ${m.span ? 'mb-0 md:shrink-0' : 'mb-4'}`}>
                  <m.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className={m.span ? 'flex-1' : ''}>
                  <h3 className={`font-bold mb-1 ${m.span ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>{m.title}</h3>
                  <p className="text-xs sm:text-sm text-white/85 mb-3 sm:mb-4 min-h-[36px]">{m.subtitle}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {m.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 sm:py-1 rounded-md bg-white/15 backdrop-blur-sm ring-1 ring-white/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                    Launch <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <Card className="p-5 sm:p-6 md:p-8 bg-white/70 backdrop-blur border-slate-200">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Multi-shop workflow</h3>
          <div className="grid md:grid-cols-4 gap-4 sm:gap-5">
            {[
              { step: '1', title: 'Sign in', desc: `Login as Admin / Staff / Kitchen. Try admin@spice.com / admin123` },
              { step: '2', title: 'Pick your shop', desc: 'Choose which restaurant you\'re operating from. Super Admin sees all shops.' },
              { step: '3', title: 'Work the mode', desc: 'Counter, Kitchen, Direct Order — each scoped to your selected shop.' },
              { step: '4', title: 'Switch anytime', desc: 'Use the shop switcher in the top bar to flip between shops in real time.' },
            ].map((s) => (
              <div key={s.step}>
                <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand-text font-bold text-xs flex items-center justify-center mb-2">
                  {s.step}
                </div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1">{s.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
