'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UtensilsCrossed, Wifi, WifiOff, ArrowRight,
  Store, LayoutDashboard, Zap, Store as StoreIcon, ChevronDown, CheckCircle2,
  Receipt, ChefHat, Bike, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/lib/session'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { LicenseActivationScreen, LicenseExpiredScreen, useLicenseCheck } from '@/components/auth/LicenseScreen'
import CounterMode from '@/components/counter/CounterMode'
import KitchenMode from '@/components/kitchen/KitchenMode'
import HistoryMode from '@/components/history/HistoryMode'
import ManagementMode from '@/components/management/ManagementMode'
import ZomatoMode from '@/components/zomato/ZomatoMode'

type Mode = 'home' | 'counter' | 'kitchen' | 'history' | 'management' | 'direct' | 'zomato'

const STAFF_MODES: Mode[] = ['counter', 'direct', 'kitchen', 'history', 'zomato']
const ADMIN_MODES: Mode[] = ['counter', 'direct', 'kitchen', 'history', 'zomato', 'management']

export default function Home() {
  const { user, currentShop, loading } = useSession()
  const { status: licenseStatus, expiresAt, daysLeft, recheck } = useLicenseCheck()
  const [mode, setMode] = useState<Mode>('home')
  const [showLicenseScreen, setShowLicenseScreen] = useState(false)

  useEffect(() => {
    if (loading || !user) return
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('posMode') as Mode | null
    if (saved && saved !== 'home') setMode(saved)
  }, [loading, user])

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

  if (licenseStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center img-bg">
        <div className="w-12 h-12 rounded-xl bg-brand-gradient animate-pulse" />
      </div>
    )
  }
  if (licenseStatus === 'not_activated' || showLicenseScreen) {
    return (
      <LicenseActivationScreen
        onActivated={() => { recheck(); setShowLicenseScreen(false) }}
      />
    )
  }
  if (licenseStatus === 'expired') {
    return (
      <LicenseExpiredScreen
        expiresAt={expiresAt || ''}
        onReactivate={() => setShowLicenseScreen(true)}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center img-bg">
        <div className="w-12 h-12 rounded-xl bg-brand-gradient animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onLoggedOut={() => setMode('home')} />
  }

  const allowedModes = user.role === 'admin' ? ADMIN_MODES : STAFF_MODES

  if (mode !== 'home' && allowedModes.includes(mode)) {
    if (mode === 'counter') return <CounterMode onExit={backHome} />
    if (mode === 'kitchen') return <KitchenMode onExit={backHome} />
    if (mode === 'history') return <HistoryMode onExit={backHome} />
    if (mode === 'management') return <ManagementMode onExit={backHome} />
    if (mode === 'direct') return <CounterMode onExit={backHome} directMode />
    if (mode === 'zomato') return <ZomatoMode onExit={backHome} />
  }

  return <HomeScreen onSelect={enterMode} daysLeft={daysLeft} onReactivate={() => setShowLicenseScreen(true)} />
}

// Per-card color schemes (restored from previous design)
const CARD_COLORS: Record<string, { gradient: string; glow: string }> = {
  direct: { gradient: 'from-amber-400 via-orange-500 to-rose-500', glow: 'shadow-orange-500/40' },
  counter: { gradient: 'from-orange-500 to-rose-500', glow: 'shadow-orange-500/30' },
  zomato: { gradient: 'from-rose-500 to-red-600', glow: 'shadow-rose-500/30' },
  kitchen: { gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/30' },
  history: { gradient: 'from-violet-500 to-fuchsia-600', glow: 'shadow-violet-500/30' },
  management: { gradient: 'from-slate-700 to-slate-900', glow: 'shadow-slate-700/40' },
}

function HomeScreen({ onSelect, daysLeft, onReactivate }: { onSelect: (m: Mode) => void; daysLeft: number | null; onReactivate: () => void }) {
  const { user, currentShop, shops, selectShop, logout } = useSession()
  const [online, setOnline] = useState(true)
  const [shopPickerOpen, setShopPickerOpen] = useState(false)

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

  const isAdmin = user?.role === 'admin'

  if (!currentShop) {
    return <ShopSelectorInline shops={shops} onPick={(s) => selectShop(s)} onLogout={logout} />
  }

  const allModes = [
    {
      key: 'direct' as Mode,
      title: 'Direct Order',
      subtitle: 'Quick takeaway — skip table assignment',
      icon: Zap,
      tags: ['Fast checkout', 'Takeaway', 'Walk-in'],
      featured: true,
      roles: ['admin', 'staff'] as const,
    },
    {
      key: 'counter' as Mode,
      title: 'Counter Mode',
      subtitle: 'Take orders, manage tables, print KOT & bills',
      icon: Store,
      tags: ['Table grid', '2-copy print', 'Billing'],
      roles: ['admin', 'staff'] as const,
    },
    {
      key: 'zomato' as Mode,
      title: 'Zomato Orders',
      subtitle: 'Live Zomato orders — push to kitchen in 1 click',
      icon: Bike,
      tags: ['Sync', 'Push to kitchen', 'Status flow'],
      roles: ['admin', 'staff'] as const,
    },
    {
      key: 'kitchen' as Mode,
      title: 'Kitchen Mode',
      subtitle: 'Live KOT display — chefs update item status',
      icon: ChefHat,
      tags: ['Real-time KOT', 'Item status', 'Ready alerts'],
      roles: ['admin', 'staff'] as const,
    },
    {
      key: 'history' as Mode,
      title: 'Bills & History',
      subtitle: 'Search past bills, view daily revenue',
      icon: Receipt,
      tags: ['Bill search', 'Revenue', 'Day summary'],
      roles: ['admin', 'staff'] as const,
    },
    {
      key: 'management' as Mode,
      title: 'Management',
      subtitle: 'Back-office: dashboard, inventory, finance, reports, audit',
      icon: LayoutDashboard,
      tags: ['Dashboard', 'Inventory', 'Finance', 'Reports', 'Audit'],
      span: 'md:col-span-3',
      roles: ['admin'] as const,
    },
  ]

  const visibleModes = allModes.filter((m) => m.roles.includes(user?.role as any))

  return (
    <div className="min-h-screen img-bg">
      {/* Header — glassmorphism on image background */}
      <header className="border-b border-white/10 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">ServingSync POS</h1>
              <p className="text-[10px] text-slate-400">
                {user?.name} ({isAdmin ? 'Admin' : 'Staff'})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {daysLeft !== null && (
              <Badge
                variant="outline"
                className={`text-[10px] ${daysLeft < 30 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                {daysLeft}d
              </Badge>
            )}
            {shops.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShopPickerOpen(!shopPickerOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20"
                >
                  <StoreIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline truncate max-w-[140px]">{currentShop?.name}</span>
                  <span className="sm:hidden">{currentShop?.code}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {shopPickerOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-slate-800 rounded-xl shadow-2xl border border-white/10 py-1 z-50">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">Switch shop</p>
                    {shops.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { selectShop(s); setShopPickerOpen(false) }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-700 ${currentShop?.id === s.id ? 'bg-slate-700' : ''}`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-white">{s.name}</span>
                          <span className="text-[10px] text-slate-400">{s.code}</span>
                        </div>
                        {currentShop?.id === s.id && <CheckCircle2 className="w-4 h-4 text-brand" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${
              online ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{online ? 'Online' : 'Offline'}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-xs text-slate-300 hover:text-white hover:bg-white/10">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Badge variant="secondary" className="mb-2 bg-white/10 text-white border-white/20 backdrop-blur">
            {currentShop?.name}
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 drop-shadow-lg">
            Welcome, {user?.name.split(' ')[0]}.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            {isAdmin
              ? 'Full access to all modes including Management.'
              : 'Counter, Direct Order, Zomato, Kitchen & History access.'}
          </p>
        </motion.div>
      </section>

      {/* Mode cards — redesigned: bigger, more visual, less boring */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 grid gap-4 sm:gap-5 md:grid-cols-3">
        {visibleModes.map((m, i) => {
          const colors = CARD_COLORS[m.key] || CARD_COLORS.counter
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.35, delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={m.span}
            >
              <Card
                onClick={() => onSelect(m.key)}
                className={`group cursor-pointer relative overflow-hidden border-0 shadow-2xl ${colors.glow} transition-shadow duration-300 ${
                  m.featured ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''
                } ${m.span ? 'min-h-[200px]' : 'min-h-[220px]'}`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} pointer-events-none`} />
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
                  backgroundSize: '40px 40px, 60px 60px',
                }} />
                {/* Glow accent */}
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-black/10 blur-2xl pointer-events-none" />

                {m.featured && (
                  <div className="absolute top-3 right-3 pointer-events-none z-10">
                    <Badge className="bg-white text-orange-700 border-0 text-[10px] font-bold uppercase shadow-lg">⚡ Fast</Badge>
                  </div>
                )}
                {m.key === 'zomato' && (
                  <div className="absolute top-3 right-3 pointer-events-none z-10">
                    <Badge className="bg-white text-rose-700 border-0 text-[10px] font-bold uppercase shadow-lg">Zomato</Badge>
                  </div>
                )}

                <div className={`relative p-5 sm:p-6 text-white h-full flex flex-col ${m.span ? 'md:flex-row md:items-center md:gap-6' : ''}`}>
                  {/* Large icon with pulse */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center ring-1 ring-white/40 shadow-xl mb-4 ${m.span ? 'md:shrink-0 md:mb-0' : ''}`}
                  >
                    <m.icon className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2.2} />
                  </motion.div>

                  <div className={m.span ? 'flex-1' : 'flex-1 flex flex-col'}>
                    <h3 className={`font-extrabold mb-1 tracking-tight ${m.span ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                      {m.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/90 mb-3 leading-relaxed">{m.subtitle}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {m.tags.slice(0, m.span ? 6 : 4).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/30"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center gap-2 text-sm font-bold">
                      <span className="px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-sm group-hover:bg-white/35 transition-colors flex items-center gap-1.5">
                        Launch
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
          {daysLeft !== null && (
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> License: {daysLeft} days
            </span>
          )}
          <button onClick={onReactivate} className="hover:text-white underline">
            Enter new key
          </button>
        </div>
      </footer>
    </div>
  )
}

function ShopSelectorInline({ shops, onPick, onLogout }: { shops: any[]; onPick: (s: any) => void; onLogout: () => void }) {
  return (
    <div className="min-h-screen img-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">Select your shop</h1>
          <p className="text-sm text-slate-300 mt-1">All orders, bills and KOTs will be filtered for the selected shop</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shops.map((shop, i) => {
            const colors: Record<string, string> = {
              orange: 'from-orange-500 to-rose-500',
              emerald: 'from-emerald-500 to-teal-500',
              violet: 'from-violet-500 to-fuchsia-500',
            }
            const c = colors[shop.color] || colors.orange
            return (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Card
                  onClick={() => onPick(shop)}
                  className="cursor-pointer relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${c} opacity-95 pointer-events-none`} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)] pointer-events-none" />
                  <div className="relative p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30">
                        <Store className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className="bg-white/20 border-white/30 text-white text-[10px] uppercase tracking-wider">
                        {shop.code}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{shop.name}</h3>
                    {shop.address && <p className="text-xs text-white/80 mb-3 line-clamp-2">{shop.address}</p>}
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      Open <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
        <div className="text-center mt-6">
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-300 hover:text-white">
            Sign out
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
