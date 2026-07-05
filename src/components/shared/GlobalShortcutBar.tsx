'use client'

import { motion } from 'framer-motion'
import {
  Zap, Store, ChefHat, Receipt, Bike, LayoutDashboard,
} from 'lucide-react'
import { useSession } from '@/lib/session'

type ShortcutMode = 'home' | 'counter' | 'kitchen' | 'history' | 'management' | 'direct' | 'zomato'

interface GlobalShortcutBarProps {
  currentMode: ShortcutMode
  onNavigate: (mode: ShortcutMode) => void
}

/**
 * GlobalShortcutBar
 * Sticky bar at top of every page for one-click navigation between modes.
 * Shows 5 shortcuts: Dashboard, Direct, Counter, Kitchen, Bills (+ Zomato for all).
 * Adapts to the active theme via brand-gradient.
 */
export function GlobalShortcutBar({ currentMode, onNavigate }: GlobalShortcutBarProps) {
  const { user } = useSession()
  const isAdmin = user?.role === 'admin'

  const shortcuts: Array<{ mode: ShortcutMode; label: string; icon: any; color: string }> = [
    { mode: 'home', label: 'Home', icon: LayoutDashboard, color: 'from-slate-600 to-slate-800' },
    { mode: 'direct', label: 'Direct', icon: Zap, color: 'from-amber-400 to-orange-500' },
    { mode: 'counter', label: 'Counter', icon: Store, color: 'from-orange-500 to-rose-500' },
    { mode: 'zomato', label: 'Zomato', icon: Bike, color: 'from-rose-500 to-red-600' },
    { mode: 'kitchen', label: 'Kitchen', icon: ChefHat, color: 'from-emerald-500 to-teal-600' },
    { mode: 'history', label: 'Bills', icon: Receipt, color: 'from-violet-500 to-fuchsia-600' },
  ]

  return (
    <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
        {shortcuts.map((s) => {
          const isActive = currentMode === s.mode
          return (
            <motion.button
              key={s.mode}
              onClick={() => onNavigate(s.mode)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? `bg-gradient-to-r ${s.color} text-white shadow-lg`
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{s.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
