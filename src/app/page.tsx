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
      <div className="min-h-screen flex items-center justify-center soft-bg">
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
      <div className="min-h-screen flex items-center justify-center soft-bg">
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

  // Unified modes — all use brand-gradient (no per-card colors)
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
    <div className="min-h-screen soft-bg">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900">ServingSync POS</h1>
              <p className="text-[10px] text-slate-500">
                {user?.name} ({isAdmin ? 'Admin' : 'Staff'})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {daysLeft !== null && (
              <Badge
                variant="outline"
                className={`text-[10px] ${daysLeft < 30 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                {daysLeft}d
              </Badge>
            )}
            {shops.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShopPickerOpen(!shopPickerOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-soft text-brand-text border border-brand/20 text-xs font-semibold"
                >
                  <StoreIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline truncate max-w-[140px]">{currentShop?.name}</span>
                  <span className="sm:hidden">{currentShop?.code}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {shopPickerOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-50">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">Switch shop</p>
                    {shops.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { selectShop(s); setShopPickerOpen(false) }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 ${currentShop?.id === s.id ? 'bg-slate-50' : ''}`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-slate-900">{s.name}</span>
                          <span className="text-[10px] text-slate-500">{s.code}</span>
                        </div>
                        {currentShop?.id === s.id && <CheckCircle2 className="w-4 h-4 text-brand" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${
              online ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{online ? 'Online' : 'Offline'}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-xs">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Badge variant="secondary" className="mb-2 bg-brand-soft text-brand-text border-brand/20">
            {currentShop?.name}
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-1">
            Welcome, {user?.name.split(' ')[0]}.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            {isAdmin
              ? 'Full access to all modes including Management.'
              : 'Counter, Direct Order, Zomato, Kitchen & History access.'}
          </p>
        </motion.div>
      </section>

      {/* Mode cards — all unified brand-gradient */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 grid gap-3 sm:gap-4 md:grid-cols-3">
        {visibleModes.map((m, i) => (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.04 + i * 0.04 }}
            className={m.span}
          >
            <Card
              onClick={() => onSelect(m.key)}
              className={`group cursor-pointer relative overflow-hidden border-0 shadow-md card-lift ${
                m.featured ? 'ring-2 ring-brand/40 ring-offset-2' : ''
              } ${m.span ? 'min-h-[150px]' : 'min-h-[140px]'}`}
            >
              {/* Unified brand gradient for ALL cards */}
              <div className="absolute inset-0 bg-brand-gradient opacity-95 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />
              {m.featured && (
                <div className="absolute top-2 right-2 pointer-events-none z-10">
                  <Badge className="bg-white text-brand-text border-0 text-[9px] font-bold uppercase">⚡ Fast</Badge>
                </div>
              )}
              <div className={`relative p-4 sm:p-5 text-white ${m.span ? 'md:flex md:items-center md:gap-5' : ''}`}>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30 ${m.span ? 'mb-0 md:shrink-0' : 'mb-3'}`}>
                  <m.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className={m.span ? 'flex-1' : ''}>
                  <h3 className={`font-bold mb-0.5 ${m.span ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>{m.title}</h3>
                  <p className="text-[11px] sm:text-xs text-white/85 mb-2.5 line-clamp-1">{m.subtitle}</p>
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {m.tags.slice(0, m.span ? 6 : 3).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/15 backdrop-blur-sm ring-1 ring-white/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    Open <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
          {daysLeft !== null && (
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> License: {daysLeft} days
            </span>
          )}
          <button onClick={onReactivate} className="hover:text-slate-700 underline">
            Enter new key
          </button>
        </div>
      </footer>
    </div>
  )
}

function ShopSelectorInline({ shops, onPick, onLogout }: { shops: any[]; onPick: (s: any) => void; onLogout: () => void }) {
  return (
    <div className="min-h-screen soft-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Select your shop</h1>
          <p className="text-sm text-slate-500 mt-1">All orders, bills and KOTs will be filtered for the selected shop</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shops.map((shop, i) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Card
                onClick={() => onPick(shop)}
                className="cursor-pointer relative overflow-hidden border-0 shadow-md card-lift"
              >
                {/* Unified brand gradient */}
                <div className="absolute inset-0 bg-brand-gradient opacity-95 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />
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
          ))}
        </div>
        <div className="text-center mt-6">
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-500">
            Sign out
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
