'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UtensilsCrossed,
  ChefHat,
  Receipt,
  Wifi,
  WifiOff,
  ArrowRight,
  Store,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import CounterMode from '@/components/counter/CounterMode'
import KitchenMode from '@/components/kitchen/KitchenMode'
import HistoryMode from '@/components/history/HistoryMode'
import ManagementMode from '@/components/management/ManagementMode'

type Mode = 'home' | 'counter' | 'kitchen' | 'history' | 'management'

export default function Home() {
  // Persist current mode across refreshes (handy for kitchen tablets)
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === 'undefined') return 'home'
    const saved = localStorage.getItem('posMode') as Mode | null
    return saved && saved !== 'home' ? saved : 'home'
  })

  const enterMode = (m: Mode) => {
    setMode(m)
    if (typeof window !== 'undefined') localStorage.setItem('posMode', m)
  }

  const backHome = () => {
    setMode('home')
    if (typeof window !== 'undefined') localStorage.removeItem('posMode')
  }

  if (mode === 'counter') return <CounterMode onExit={backHome} />
  if (mode === 'kitchen') return <KitchenMode onExit={backHome} />
  if (mode === 'history') return <HistoryMode onExit={backHome} />
  if (mode === 'management') return <ManagementMode onExit={backHome} />

  return <HomeScreen onSelect={enterMode} />
}

function HomeScreen({ onSelect }: { onSelect: (m: Mode) => void }) {
  const modes = [
    {
      key: 'counter' as Mode,
      title: 'Counter Mode',
      subtitle: 'Take orders, manage tables, print KOT & bills',
      icon: Store,
      gradient: 'from-orange-500 to-rose-500',
      glow: 'shadow-orange-500/30',
      tags: ['Table grid', 'Direct Order', '2-copy print', 'Billing'],
    },
    {
      key: 'kitchen' as Mode,
      title: 'Kitchen Mode',
      subtitle: 'Live KOT display — chefs update item status',
      icon: ChefHat,
      gradient: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/30',
      tags: ['Real-time KOT', 'Item status', 'Ready alerts'],
    },
    {
      key: 'history' as Mode,
      title: 'Bills & History',
      subtitle: 'Search past bills, view daily revenue',
      icon: Receipt,
      gradient: 'from-violet-500 to-fuchsia-500',
      glow: 'shadow-violet-500/30',
      tags: ['Bill search', 'Revenue', 'Day summary'],
    },
    {
      key: 'management' as Mode,
      title: 'Management',
      subtitle: 'Back-office: dashboard, inventory, finance, reports, Zomato orders',
      icon: LayoutDashboard,
      gradient: 'from-slate-700 to-slate-900',
      glow: 'shadow-slate-700/40',
      tags: ['Dashboard', 'Inventory', 'Finance', 'Reports', 'Zomato', 'Backup'],
      span: 'md:col-span-3',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-rose-50/30">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">ServingSync POS</h1>
              <p className="text-xs text-slate-500">Offline-first restaurant system</p>
            </div>
          </div>
          <ConnectionPill />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
            Real-time KOT sync · Counter ↔ Kitchen
          </Badge>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            One system, two screens.
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Pick a mode for this device. The counter takes orders and prints bills. The kitchen tablet
            shows live KOTs and updates chefs when items are ready. Both stay in sync over your local Wi-Fi —
            no internet needed.
          </p>
        </motion.div>
      </section>

      {/* Mode cards */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid gap-6 md:grid-cols-3">
        {modes.map((m, i) => (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            className={m.span}
          >
            <Card
              className={`group cursor-pointer relative overflow-hidden border-0 shadow-xl ${m.glow} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${m.span ? 'min-h-[200px]' : ''}`}
              onClick={() => onSelect(m.key)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-90`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)]" />
              <div className={`relative p-7 text-white ${m.span ? 'md:flex md:items-center md:gap-6' : ''}`}>
                <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30 ${m.span ? 'mb-0 md:shrink-0' : 'mb-5'}`}>
                  <m.icon className="w-7 h-7" />
                </div>
                <div className={m.span ? 'flex-1' : ''}>
                  <h3 className={`font-bold mb-1 ${m.span ? 'text-3xl' : 'text-2xl'}`}>{m.title}</h3>
                  <p className="text-sm text-white/85 mb-4 min-h-[40px]">{m.subtitle}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {m.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-medium px-2 py-1 rounded-md bg-white/15 backdrop-blur-sm ring-1 ring-white/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Launch <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <Card className="p-6 md:p-8 bg-white/70 backdrop-blur border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-5">How the sync works</h3>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { step: '1', title: 'Counter takes order', desc: 'Waiter picks table, adds items from menu, taps Send to Kitchen.' },
              { step: '2', title: 'KOT appears live', desc: 'Kitchen tablet instantly shows the new KOT card with all items.' },
              { step: '3', title: 'Chef updates status', desc: 'Tap items through Pending → Preparing → Ready as they cook.' },
              { step: '4', title: 'Counter bills & clears', desc: 'Counter sees ready items, generates bill, table is released for next guest.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-bold text-sm flex items-center justify-center mb-3">
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

function ConnectionPill() {
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
  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
        online ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
      {online ? 'Online' : 'Offline'}
    </div>
  )
}
