'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  Home, Package, ShoppingCart, Clock, Users, Truck, BarChart3, UserCog,
  Settings, Cloud, Search, Bell, Menu, X, Plus, Minus, Trash2, CreditCard,
  Banknote, Smartphone, Wallet, ChevronRight, FileText, Printer, Edit,
  Trash, Check, TrendingUp, ShoppingBag, UserPlus,
  Shield, Database, WifiOff, Bluetooth, Download, Upload,
  MoreHorizontal, RefreshCw, Receipt, Store, Phone,
  Mail, Percent, Zap, CircleCheck, Loader2, LayoutGrid, ArrowUpRight,
  HandCoins, QrCode, Building2, UserCheck, Gauge, HardDrive,
  Volume2, VolumeX, Palette, Lock, Globe, CalendarDays, MessageSquare,
  Image, Type, Columns3, Rows3, List, Grid3X3, Tag, ScanLine,
  Calculator, ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  Keyboard, Eye, EyeOff, Save, RotateCcw, FileDown, FileUp,
  BookOpen, Star, Gift, Heart, Timer, Wifi, Monitor, Tablet, SlidersHorizontal,
  ArrowUpDown, Filter as FilterIcon, RotateCcw as ResetIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCartStore, useNavStore } from '@/lib/store'
import { useRealTime, useElectronBridge } from '@/hooks/use-realtime'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'sonner'

// ─── Shared types, constants, data hooks, and reusable UI pieces ───
// Split out of the original monolithic page.tsx so each route page can be
// code-split with next/dynamic and only load what it needs.
export interface Product { id: string; name: string; category: string; unit: string; price: number; stock: number; image: string | null }
export interface Sale { id: string; invoiceNumber: string; customerName: string | null; subtotal: number; discount: number; tax: number; taxRate: number; grandTotal: number; paymentMode: string; status: string; createdAt: string; items: SaleItem[] }
export interface SaleItem { id: string; saleId: string; productId: string | null; name: string; unit: string; quantity: number; price: number; total: number }
export interface Customer { id: string; name: string; phone: string | null; email: string | null; address: string | null }
export interface Supplier { id: string; name: string; phone: string | null; email: string | null; address: string | null }
export interface AppUser { id: string; name: string; email: string; role: string }
export interface ShopSettings { id: string; shopName: string; address: string | null; phone: string | null; email: string | null; taxRate: number; currency: string; invoicePrefix: string }
export interface DashboardData { todayRevenue: number; todayCount: number; monthRevenue: number; monthCount: number; totalRevenue: number; totalCount: number; productCount: number; customerCount: number; recentSales: Sale[]; chartData: { date: string; total: number }[] }
export interface Purchase { id: string; invoiceNumber: string; supplierName: string | null; subtotal: number; tax: number; grandTotal: number; paymentMode: string; status: string; createdAt: string }
export interface Estimate { id: string; estimateNumber: string; customerName: string | null; subtotal: number; discount: number; tax: number; grandTotal: number; status: string; validUntil: string | null; createdAt: string }
export interface Order { id: string; orderNumber: string; customerName: string | null; subtotal: number; advance: number; balance: number; status: string; deliveryDate: string | null; createdAt: string }
export interface Expense { id: string; category: string; description: string; amount: number; paymentMode: string; date: string; createdAt: string }
export interface MoneyIn { id: string; amount: number; source: string; description: string | null; partyName: string | null; paymentMode: string; date: string; createdAt: string }
export interface MoneyOut { id: string; amount: number; purpose: string; description: string | null; partyName: string | null; paymentMode: string; date: string; createdAt: string }
export interface Kot { id: string; kotNumber: string; tableNumber: string | null; status: string; items: string; createdAt: string }

// ─── Indian Currency Format ───
export const catColors: Record<string, string> = {
  'Grocery': 'bg-amber-50 text-amber-700 border-amber-200',
  'Dairy': 'bg-sky-50 text-sky-700 border-sky-200',
  'Personal Care': 'bg-pink-50 text-pink-700 border-pink-200',
  'Household': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'General': 'bg-slate-50 text-slate-700 border-slate-200',
}
export const emojis: Record<string, string> = { 'rice': '🍚', 'oil': '🫒', 'flour': '🌾', 'sugar': '🍬', 'tea': '☕', 'milk': '🥛', 'dal': '🫘', 'salt': '🧂', 'shampoo': '🧴', 'soap': '🧼', 'toothpaste': '🪥', 'detergent': '🧹' }
export function getEmoji(n: string) { const l = n.toLowerCase(); for (const [k, e] of Object.entries(emojis)) { if (l.includes(k)) return e } return '📦' }
export function rs(a: number) { return `Rs. ${a.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

// ─── Nav Structure (Ezo-inspired) ───
export const mainNav = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
  { id: 'products' as const, label: 'Items', icon: Package },
  { id: 'sales' as const, label: 'Sale', icon: ShoppingCart },
  { id: 'history' as const, label: 'Sale List', icon: Clock },
]
export const sideMenuSections = [
  { title: 'Main', items: [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home, desc: 'Business overview', color: 'text-blue-600 bg-blue-50' },
    { id: 'products' as const, label: 'Item List', icon: Package, desc: 'Product catalog', color: 'text-violet-600 bg-violet-50' },
  ]},
  { title: 'Transactions', items: [
    { id: 'sales' as const, label: 'New Sale', icon: ShoppingCart, desc: 'Create bill', color: 'text-emerald-600 bg-emerald-50' },
    { id: 'history' as const, label: 'Sale List', icon: Clock, desc: 'Past bills', color: 'text-sky-600 bg-sky-50' },
    { id: 'purchases' as const, label: 'Purchase List', icon: ShoppingBag, desc: 'Purchase records', color: 'text-orange-600 bg-orange-50' },
    { id: 'estimates' as const, label: 'Estimate List', icon: FileText, desc: 'Quotations', color: 'text-teal-600 bg-teal-50' },
    { id: 'orders' as const, label: 'Order List', icon: Receipt, desc: 'Pending orders', color: 'text-indigo-600 bg-indigo-50' },
    { id: 'expenses' as const, label: 'Expense List', icon: HandCoins, desc: 'Business expenses', color: 'text-rose-600 bg-rose-50' },
    { id: 'moneyin' as const, label: 'Money In List', icon: ArrowUpRight, desc: 'Incoming payments', color: 'text-emerald-600 bg-emerald-50' },
    { id: 'moneyout' as const, label: 'Money Out List', icon: ArrowUpRight, desc: 'Outgoing payments', color: 'text-red-600 bg-red-50' },
  ]},
  { title: 'People', items: [
    { id: 'customers' as const, label: 'Party List', icon: Users, desc: 'Customers & vendors', color: 'text-blue-600 bg-blue-50' },
    { id: 'suppliers' as const, label: 'Suppliers', icon: Truck, desc: 'Manage suppliers', color: 'text-amber-600 bg-amber-50' },
    { id: 'kot' as const, label: 'Kot List', icon: Printer, desc: 'Kitchen orders', color: 'text-fuchsia-600 bg-fuchsia-50' },
    { id: 'users' as const, label: 'Staff List', icon: UserCog, desc: 'Admin & staff', color: 'text-violet-600 bg-violet-50' },
  ]},
  { title: 'Analytics', items: [
    { id: 'reports' as const, label: 'Reports', icon: BarChart3, desc: 'Sales analytics', color: 'text-emerald-600 bg-emerald-50' },
  ]},
  { title: 'System', items: [
    { id: 'settings' as const, label: 'Settings', icon: Settings, desc: 'Shop & billing', color: 'text-slate-600 bg-slate-50' },
    { id: 'backup' as const, label: 'Backup', icon: Cloud, desc: 'Data safety', color: 'text-sky-600 bg-sky-50' },
  ]},
]
export const moreSections = sideMenuSections.slice(2) // People, Analytics, System for mobile "More"
export const allNavIds = [...mainNav.map(n => n.id), ...sideMenuSections.flatMap(s => s.items.map(i => i.id))]

// ─── API Hooks ───
export function useProducts(s?: string) { return useQuery({ queryKey: ['products', s], queryFn: async () => { const r = await fetch(`/api/products${s ? `?search=${encodeURIComponent(s)}` : ''}`); return r.json() as Promise<Product[]> }, staleTime: 30000 }) }
export function useSales(p?: string) { return useQuery({ queryKey: ['sales', p], queryFn: async () => { const r = await fetch(`/api/sales${p ? `?period=${p}` : ''}`); return r.json() as Promise<Sale[]> }, staleTime: 15000 }) }
export function useCustomers() { return useQuery({ queryKey: ['customers'], queryFn: async () => { const r = await fetch('/api/customers'); return r.json() as Promise<Customer[]> }, staleTime: 30000 }) }
export function useSuppliers() { return useQuery({ queryKey: ['suppliers'], queryFn: async () => { const r = await fetch('/api/suppliers'); return r.json() as Promise<Supplier[]> }, staleTime: 30000 }) }
export function useAppUsers() { return useQuery({ queryKey: ['users'], queryFn: async () => { const r = await fetch('/api/users'); return r.json() as Promise<AppUser[]> }, staleTime: 30000 }) }
export function useShopSettings() { return useQuery({ queryKey: ['settings'], queryFn: async () => { const r = await fetch('/api/settings'); return r.json() as Promise<ShopSettings> }, staleTime: 60000 }) }
export function useDashboardData() { return useQuery({ queryKey: ['dashboard'], queryFn: async () => { const r = await fetch('/api/dashboard'); return r.json() as Promise<DashboardData> }, refetchInterval: 10000, staleTime: 5000 }) }
export function usePurchases(p?: string) { return useQuery({ queryKey: ['purchases', p], queryFn: async () => { const r = await fetch(`/api/purchases${p ? `?period=${p}` : ''}`); return r.json() as Promise<Purchase[]> }, staleTime: 15000 }) }
export function useEstimates(s?: string) { return useQuery({ queryKey: ['estimates', s], queryFn: async () => { const r = await fetch(`/api/estimates${s ? `?status=${s}` : ''}`); return r.json() as Promise<Estimate[]> }, staleTime: 15000 }) }
export function useOrders(s?: string) { return useQuery({ queryKey: ['orders', s], queryFn: async () => { const r = await fetch(`/api/orders${s ? `?status=${s}` : ''}`); return r.json() as Promise<Order[]> }, staleTime: 15000 }) }
export function useExpenses(c?: string, p?: string) { return useQuery({ queryKey: ['expenses', c, p], queryFn: async () => { const params = new URLSearchParams(); if (c && c !== 'all') params.set('category', c); if (p && p !== 'all') params.set('period', p); const r = await fetch(`/api/expenses?${params}`); return r.json() as Promise<Expense[]> }, staleTime: 15000 }) }
export function useMoneyIn() { return useQuery({ queryKey: ['moneyin'], queryFn: async () => { const r = await fetch('/api/moneyin'); return r.json() as Promise<MoneyIn[]> }, staleTime: 15000 }) }
export function useMoneyOut() { return useQuery({ queryKey: ['moneyout'], queryFn: async () => { const r = await fetch('/api/moneyout'); return r.json() as Promise<MoneyOut[]> }, staleTime: 15000 }) }
export function useKots(s?: string) { return useQuery({ queryKey: ['kots', s], queryFn: async () => { const r = await fetch(`/api/kots${s ? `?status=${s}` : ''}`); return r.json() as Promise<Kot[]> }, staleTime: 10000 }) }

// ─── 3D Tilt Card Hook (with touch support) ───
export function useTilt() {
  const [style, setStyle] = useState<React.CSSProperties>({})
  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setStyle({ transform: `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(12px) scale(1.03)` })
  }, [])
  const onTouch = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const t = e.touches[0]
    const x = (t.clientX - rect.left) / rect.width - 0.5
    const y = (t.clientY - rect.top) / rect.height - 0.5
    setStyle({ transform: `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(8px) scale(1.02)` })
  }, [])
  const onLeave = useCallback(() => setStyle({ transform: 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }), [])
  return { style, onMove, onTouch, onLeave }
}

// ─── Live Clock ───
export function LiveClock() {
  const [t, setT] = useState<Date | null>(null)
  useEffect(() => {
    setT(new Date())
    const i = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(i)
  }, [])
  return (
    <span className="text-[11px] text-slate-400 tabular-nums font-medium">
      {t ? t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : '--:--:-- --'}
    </span>
  )
}

// ─── Logo ───
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const s = { sm: 'h-7 w-7 text-[11px]', md: 'h-9 w-9 text-sm' }
  return <div className={`${s[size]} gradient-primary rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 shadow-blue-3d`}>S</div>
}

// ─── 3D Stat Card ───
export function StatCard({ title, value, sub, icon: Icon, color, bg, delay, trend }: { title: string; value: string; sub: string; icon: any; color: string; bg: string; delay: number; trend?: string }) {
  const { style, onMove, onTouch, onLeave } = useTilt()
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card-3d" onMouseMove={onMove} onTouchMove={onTouch} onMouseLeave={onLeave} onTouchEnd={onLeave} style={style}>
      <Card className="border border-slate-200/70 shadow-3d-card hover:shadow-3d-card-hover transition-shadow duration-300 group cursor-default overflow-hidden rounded-2xl">
        <CardContent className="p-3 sm:p-5 relative">
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-[0.06]" style={{ background: color.includes('emerald') ? '#059669' : color.includes('blue') ? '#2563EB' : color.includes('violet') ? '#7C3AED' : '#D97706' }} />
          <div className="flex items-center justify-between relative z-10">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[13px] font-medium text-slate-500 tracking-wide uppercase">{title}</p>
              <p className="text-lg sm:text-[26px] font-bold text-slate-900 mt-0.5 tracking-tight">{value}</p>
              <p className="text-[9px] sm:text-xs text-slate-400 mt-0.5 flex items-center gap-1">{trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}{sub}</p>
            </div>
            <div className={`${bg} p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-300 shrink-0`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Empty & Skeleton ───
export function Empty({ icon: I, text }: { icon: any; text: string }) { return <div className="text-center py-12 text-slate-400"><I className="h-10 w-10 mx-auto mb-2 opacity-20" /><p className="text-sm">{text}</p></div> }
export function EmptyChart() { return <div className="h-[200px] sm:h-[280px] flex items-center justify-center text-slate-400"><div className="text-center"><BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-20" /><p className="text-sm">No data yet</p></div></div> }

// ─── Reusable Filter Components ───
export function FilterChip({ label, active, onClick, color = 'blue' }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  const colors: Record<string, { active: string; inactive: string }> = {
    blue: { active: 'bg-blue-100 text-blue-700 border-blue-300', inactive: 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-200' },
    emerald: { active: 'bg-emerald-100 text-emerald-700 border-emerald-300', inactive: 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200' },
    amber: { active: 'bg-amber-100 text-amber-700 border-amber-300', inactive: 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-200' },
    violet: { active: 'bg-violet-100 text-violet-700 border-violet-300', inactive: 'bg-white text-slate-600 border-slate-200 hover:bg-violet-50 hover:border-violet-200' },
    rose: { active: 'bg-rose-100 text-rose-700 border-rose-300', inactive: 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:border-rose-200' },
  }
  const c = colors[color] || colors.blue
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border text-[9px] sm:text-[11px] font-medium transition-all duration-200 ${active ? c.active : c.inactive}`}>
      {label}
      {active && <X className="h-2.5 w-2.5 ml-0.5" />}
    </motion.button>
  )
}

export function FilterBar({ children, onClear, activeCount }: { children: React.ReactNode; onClear: () => void; activeCount: number }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 p-2.5 sm:p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] sm:text-xs font-semibold text-slate-700">Filters</span>
          {activeCount > 0 && <Badge className="bg-blue-100 text-blue-700 text-[8px] px-1.5 py-0 h-4 border-0">{activeCount} active</Badge>}
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-6 text-[9px] sm:text-[10px] text-slate-500 hover:text-red-500 gap-1 px-2">
            <RotateCcw className="h-2.5 w-2.5" />Clear All
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1 sm:gap-1.5">{children}</div>
    </motion.div>
  )
}

export function SortSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-1">
      <ArrowUpDown className="h-3 w-3 text-slate-400" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 sm:h-8 w-28 sm:w-36 text-[9px] sm:text-xs border-slate-200 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

// ─── Settings Toggle ───
export function SettingToggle({ label, desc, defaultOn = false, icon: Icon }: { label: string; desc?: string; defaultOn?: boolean; icon?: any }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && <div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Icon className="h-3.5 w-3.5 text-slate-500" /></div>}
        <div className="min-w-0"><p className="text-xs sm:text-sm font-medium text-slate-900">{label}</p>{desc && <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{desc}</p>}</div>
      </div>
      <button onClick={() => setOn(!on)} className={`relative h-6 w-11 rounded-full transition-all duration-200 shrink-0 ${on ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <motion.div animate={{ x: on ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  )
}

// ─── Settings Section Card ───
export function SettingsSection({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <Card className="border border-slate-200/70 shadow-3d-card rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className={`${color} p-2 rounded-xl`}><Icon className="h-4 w-4" /></div>
          <h3 className="font-semibold text-slate-900 text-sm sm:text-[15px]">{title}</h3>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="h-4 w-4 text-slate-400" /></motion.div>
      </button>
      <AnimatePresence initial={false}>{open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-1">{children}</div>
        </motion.div>
      )}</AnimatePresence>
    </Card>
  )
}

// ─── Cart Sidebar ───
export function CartSidebar() {
  const cart = useCartStore()
  const qc = useQueryClient()
  const rt = useRealTime()
  const [showInvoice, setShowInvoice] = useState(false)
  const [lastInvoice, setLastInvoice] = useState<Sale | null>(null)
  const [lastKot, setLastKot] = useState<Kot | null>(null)
  const [step, setStep] = useState<'cart' | 'generating' | 'success'>('cart')
  const [tableNumber, setTableNumber] = useState('')

  // No real payment gateway is used — this app only records the sale.
  // Clicking checkout generates the customer bill (invoice) and, in the
  // same step, fires a KOT (Kitchen Order Ticket) so the kitchen can start prep.
  const checkoutMut = useMutation({
    mutationFn: async () => {
      const itemsSummary = cart.items.map(i => `${i.quantity} x ${i.name}`).join(', ')
      const [saleRes, kotRes] = await Promise.all([
        fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.items, subtotal: cart.getSubtotal(), discount: cart.discount, tax: cart.getTaxAmount(), taxRate: cart.taxRate, grandTotal: cart.getGrandTotal(), paymentMode: cart.paymentMode, customerName: tableNumber ? `Table ${tableNumber}` : undefined }) }),
        fetch('/api/kots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableNumber: tableNumber || null, status: 'pending', items: itemsSummary }) }),
      ])
      if (!saleRes.ok || !kotRes.ok) throw new Error()
      const sale = await saleRes.json() as Sale
      const kot = await kotRes.json() as Kot
      return { sale, kot }
    },
    onSuccess: ({ sale, kot }) => {
      qc.invalidateQueries({ queryKey: ['sales'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); qc.invalidateQueries({ queryKey: ['products'] }); qc.invalidateQueries({ queryKey: ['kots'] })
      setLastInvoice(sale); setLastKot(kot); setStep('success'); cart.clearCart(); setTableNumber('')
      // Push over the real-time socket so other open windows/devices (and the
      // Electron tray/kot-alert) pick this up immediately, instead of waiting
      // on the next poll.
      rt.emitSaleCreated(sale)
      rt.emitKotCreated(kot)
      setTimeout(() => { setStep('cart'); setShowInvoice(true) }, 1200)
    },
    onError: () => { setStep('cart'); toast.error('Could not generate bill, please try again') },
  })

  const sub = cart.getSubtotal(), tax = cart.getTaxAmount(), gt = cart.getGrandTotal(), empty = cart.items.length === 0

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-100/80">
      <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between gradient-primary text-white">
        <div className="flex items-center gap-2"><div className="relative"><ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />{cart.items.length > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-white text-blue-600 text-[8px] font-bold flex items-center justify-center">{cart.items.length}</motion.span>}</div><h2 className="font-bold text-sm sm:text-base">Cart</h2></div>
        {cart.items.length > 0 && <Button variant="ghost" size="sm" onClick={() => cart.clearCart()} className="text-white/80 hover:text-white hover:bg-white/10 h-6 w-6 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'cart' && (
            <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              <ScrollArea className="flex-1">
                {empty ? <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-slate-400"><div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-2"><ShoppingCart className="h-6 w-6 opacity-25" /></div><p className="text-xs sm:text-sm font-medium">Cart is empty</p><p className="text-[10px] sm:text-xs mt-0.5">Add products to start</p></div>
                : <div className="p-2 sm:p-3 space-y-1.5"><AnimatePresence initial={false}>{cart.items.map((item) => (
                    <motion.div key={item.productId} initial={{ opacity: 0, x: 20, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0, x: -20, height: 0 }} transition={{ duration: 0.15 }} layout>
                      <div className="bg-slate-50/80 rounded-xl p-2 sm:p-2.5 nav-item-3d nav-item-3d-light border border-transparent hover:border-slate-200">
                        <div className="flex items-start justify-between"><div className="flex items-center gap-1.5 min-w-0"><span className="text-sm shrink-0">{getEmoji(item.name)}</span><div className="min-w-0"><p className="text-[10px] sm:text-xs font-medium text-slate-900 truncate">{item.name}</p><p className="text-[8px] sm:text-[11px] text-slate-400">{rs(item.price)}/{item.unit}</p></div></div>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-400 hover:text-red-500" onClick={() => cart.removeItem(item.productId)}><X className="h-2.5 w-2.5" /></Button></div>
                        <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                          <div className="flex items-center gap-1"><motion.button whileTap={{ scale: 0.8 }} className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600" onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}><Minus className="h-2 w-2 sm:h-2.5 sm:w-2.5" /></motion.button>
                            <motion.span key={item.quantity} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-[10px] sm:text-xs font-semibold w-6 sm:w-7 text-center tabular-nums">{item.quantity}</motion.span>
                            <motion.button whileTap={{ scale: 0.8 }} className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600" onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}><Plus className="h-2 w-2 sm:h-2.5 sm:w-2.5" /></motion.button></div>
                          <motion.p key={item.total} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-[10px] sm:text-xs font-bold text-slate-900 tabular-nums">{rs(item.total)}</motion.p></div>
                      </div>
                    </motion.div>
                  ))}</AnimatePresence></div>}
              </ScrollArea>

              {!empty && (
                <div className="border-t border-slate-100 p-2.5 sm:p-4 space-y-2 sm:space-y-2.5 bg-white">
                  <div className="flex items-center gap-1.5"><Label className="text-[8px] sm:text-[11px] text-slate-500 shrink-0 uppercase tracking-wider">Table / Order No.</Label><Input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="h-6 sm:h-7 text-[10px] sm:text-[11px] w-20 sm:w-24" placeholder="Optional" /></div>
                  <div className="flex items-center gap-1.5"><Label className="text-[8px] sm:text-[11px] text-slate-500 shrink-0 uppercase tracking-wider">Discount Rs.</Label><Input type="number" value={cart.discount || ''} onChange={(e) => cart.setDiscount(parseFloat(e.target.value) || 0)} className="h-6 sm:h-7 text-[10px] sm:text-[11px] w-16 sm:w-20" placeholder="0" /></div>
                  <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-[13px]">
                    <div className="flex justify-between text-slate-500"><span>Sub Total</span><motion.span key={sub} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="tabular-nums font-medium text-slate-700">{rs(sub)}</motion.span></div>
                    {cart.discount > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span className="tabular-nums">-{rs(cart.discount)}</span></div>}
                    <div className="flex justify-between text-slate-500"><span>Tax ({cart.taxRate}%)</span><motion.span key={tax} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="tabular-nums font-medium text-slate-700">{rs(tax)}</motion.span></div>
                    <Separator />
                    <motion.div layout className="flex justify-between font-bold text-sm sm:text-lg text-slate-900 pt-0.5"><span>Grand Total</span><motion.span key={gt} initial={{ scale: 1.05, color: '#2563EB' }} animate={{ scale: 1, color: '#0f172a' }} className="tabular-nums">{rs(gt)}</motion.span></motion.div>
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label className="text-[8px] sm:text-[11px] text-slate-500 uppercase tracking-wider">Payment Mode</Label>
                    <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                      {[{ m: 'Cash', i: Banknote }, { m: 'Card', i: CreditCard }, { m: 'UPI', i: QrCode }].map(({ m, i: Ic }) => (
                        <motion.button key={m} whileTap={{ scale: 0.9 }} className={`flex flex-col items-center py-1 sm:py-2 rounded-xl text-[7px] sm:text-[10px] font-semibold transition-all duration-200 ${cart.paymentMode === m ? 'gradient-primary text-white shadow-blue-3d' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`} onClick={() => cart.setPaymentMode(m)}>
                          <Ic className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mb-0.5" />{m}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <motion.div whileTap={{ scale: 0.98 }}><Button className="w-full gradient-primary shadow-blue-3d h-8 sm:h-11 text-xs sm:text-[15px] font-semibold rounded-xl" disabled={checkoutMut.isPending} onClick={() => { setStep('generating'); checkoutMut.mutate() }}><Receipt className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />Checkout &middot; {rs(gt)}</Button></motion.div>
                </div>
              )}
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center p-5">
              <div className="relative mb-5"><div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full border-[3px] border-blue-100 border-t-blue-600 animate-spin" /><div className="absolute inset-0 flex items-center justify-center"><Receipt className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600" /></div></div>
              <p className="text-sm sm:text-lg font-semibold text-slate-900">Generating Bill &amp; KOT</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Sending order to kitchen...</p>
              <div className="flex gap-1 mt-3">{[0,1,2].map(i => <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className="h-1.5 w-1.5 rounded-full bg-blue-600" />)}</div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-5">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-3 shadow-green-3d"><CircleCheck className="h-7 w-7 sm:h-10 sm:w-10 text-emerald-600" /></motion.div>
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-sm sm:text-lg font-bold text-slate-900">Bill Generated!</motion.p>
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-[10px] sm:text-sm text-slate-500 mt-0.5">Invoice &amp; KOT sent to kitchen</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center gap-0.5 mt-1.5">
                {lastInvoice && <p className="text-[9px] sm:text-xs text-slate-400 font-mono">{lastInvoice.invoiceNumber}</p>}
                {lastKot && <p className="text-[9px] sm:text-xs text-fuchsia-500 font-mono">{lastKot.kotNumber}</p>}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showInvoice} onOpenChange={setShowInvoice}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />Bill &amp; Kitchen Order</DialogTitle></DialogHeader>{lastInvoice && <InvoiceView sale={lastInvoice} />}{lastKot && <KotTicketView kot={lastKot} />}<DialogFooter className="flex gap-2"><Button variant="outline" onClick={() => setShowInvoice(false)} className="gap-1"><X className="h-4 w-4" />Close</Button><Button className="gradient-primary shadow-blue-3d gap-1" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

// ─── Invoice ───
export function InvoiceView({ sale }: { sale: Sale }) {
  return (
    <div className="border border-slate-200 rounded-xl p-3 sm:p-5 text-sm bg-white shadow-inner-3d">
      <div className="text-center border-b border-dashed border-slate-200 pb-3 mb-3">
        <div className="flex items-center justify-center gap-2 mb-0.5"><Logo size="sm" /><h2 className="text-lg sm:text-xl font-bold text-slate-900">SmartBill</h2></div>
        <p className="text-[11px] text-slate-500">Your Shop Name Here</p><p className="text-[10px] text-slate-400">123 Market Street, City</p><p className="text-[10px] text-slate-400">Phone: +91 98765 43210</p>
      </div>
      <div className="flex justify-between mb-3 text-[11px]"><div><p className="font-semibold">Invoice: <span className="font-normal font-mono">{sale.invoiceNumber}</span></p><p className="font-semibold">Customer: <span className="font-normal">{sale.customerName || 'Walk-in'}</span></p></div><div className="text-right"><p className="font-semibold">Date: <span className="font-normal">{new Date(sale.createdAt).toLocaleDateString('en-IN')}</span></p><p className="font-semibold">Time: <span className="font-normal">{new Date(sale.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></p></div></div>
      <table className="w-full mb-3 text-[11px]"><thead><tr className="border-b border-slate-200"><th className="text-left py-1 font-semibold text-slate-600">Item</th><th className="text-center py-1 font-semibold text-slate-600">Qty</th><th className="text-right py-1 font-semibold text-slate-600">Rate</th><th className="text-right py-1 font-semibold text-slate-600">Amount</th></tr></thead><tbody>{sale.items.map(i => <tr key={i.id} className="border-b border-slate-50"><td className="py-1 text-slate-800">{i.name}</td><td className="py-1 text-center text-slate-600">{i.quantity} {i.unit}</td><td className="py-1 text-right text-slate-600">{rs(i.price)}</td><td className="py-1 text-right font-medium text-slate-900">{rs(i.total)}</td></tr>)}</tbody></table>
      <div className="space-y-0.5 text-[11px] border-t border-dashed border-slate-200 pt-2.5">
        <div className="flex justify-between text-slate-600"><span>Sub Total</span><span>{rs(sale.subtotal)}</span></div>
        {sale.discount > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span>-{rs(sale.discount)}</span></div>}
        <div className="flex justify-between text-slate-600"><span>Tax ({sale.taxRate}%)</span><span>{rs(sale.tax)}</span></div>
        <Separator />
        <div className="flex justify-between font-bold text-base text-slate-900 pt-1"><span>Grand Total</span><span>{rs(sale.grandTotal)}</span></div>
        <div className="flex justify-between text-slate-500 text-[10px]"><span>Payment</span><span>{sale.paymentMode}</span></div>
      </div>
      <div className="text-center mt-3 pt-2.5 border-t border-dashed border-slate-200"><p className="text-[11px] text-slate-500 font-medium">Thank you! Visit Again.</p></div>
    </div>
  )
}

// ─── KOT (Kitchen Order Ticket) ───
export function KotTicketView({ kot }: { kot: Kot }) {
  const items = kot.items.split(',').map(s => s.trim()).filter(Boolean)
  return (
    <div className="border border-dashed border-fuchsia-300 rounded-xl p-3 sm:p-5 text-sm bg-fuchsia-50/40 shadow-inner-3d mt-4">
      <div className="text-center border-b border-dashed border-fuchsia-200 pb-2.5 mb-2.5">
        <div className="flex items-center justify-center gap-1.5 mb-0.5"><Printer className="h-4 w-4 text-fuchsia-600" /><h2 className="text-base sm:text-lg font-bold text-slate-900">Kitchen Order Ticket</h2></div>
        <p className="text-[10px] text-slate-500 font-mono">{kot.kotNumber}</p>
      </div>
      <div className="flex justify-between mb-2.5 text-[11px]">
        <p className="font-semibold">Table: <span className="font-normal">{kot.tableNumber || 'Takeaway'}</span></p>
        <p className="font-semibold">Time: <span className="font-normal">{new Date(kot.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></p>
      </div>
      <ul className="space-y-1 text-[12px] sm:text-[13px] font-medium text-slate-800">
        {items.map((it, i) => <li key={i} className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shrink-0" />{it}</li>)}
      </ul>
      <div className="text-center mt-3 pt-2 border-t border-dashed border-fuchsia-200"><p className="text-[10px] text-fuchsia-500 font-semibold uppercase tracking-wider">No prices &middot; Kitchen Copy</p></div>
    </div>
  )
}