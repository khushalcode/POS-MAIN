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
import {
  getEmoji, rs, catColors, emojis, mainNav, sideMenuSections, moreSections, allNavIds,
  useProducts, useSales, useCustomers, useSuppliers, useAppUsers, useShopSettings,
  useDashboardData, usePurchases, useEstimates, useOrders, useExpenses, useMoneyIn,
  useMoneyOut, useKots, useTilt, LiveClock, Logo, StatCard, Empty, EmptyChart,
  FilterChip, FilterBar, SortSelect, SettingToggle, SettingsSection,
  CartSidebar, InvoiceView,
} from '../_shared'
import type {
  Product, Sale, SaleItem, Customer, Supplier, AppUser, ShopSettings,
  DashboardData, Purchase, Estimate, Order, Expense, MoneyIn, MoneyOut, Kot,
} from '../_shared'
export default function ReportsPage() {
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(true)
  const { data: sales } = useSales()
  const { data: dd } = useDashboardData()

  const activeFilters = [dateFilter !== 'all' ? 1 : 0, paymentFilter !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)
  const clearAllFilters = () => { setDateFilter('all'); setPaymentFilter('all') }

  const filteredSales = sales?.filter(s => {
    if (paymentFilter !== 'all' && s.paymentMode !== paymentFilter) return false
    if (dateFilter !== 'all') {
      const d = new Date(s.createdAt)
      const now = new Date()
      if (dateFilter === 'today' && d.toDateString() !== now.toDateString()) return false
      if (dateFilter === 'week') { const weekAgo = new Date(now.getTime() - 7 * 86400000); if (d < weekAgo) return false }
      if (dateFilter === 'month' && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false
      if (dateFilter === '3months') { const m3 = new Date(now.getTime() - 90 * 86400000); if (d < m3) return false }
    }
    return true
  }) || []

  const tr = filteredSales.reduce((s, x) => s + x.grandTotal, 0)
  const tt = filteredSales.reduce((s, x) => s + x.tax, 0)
  const avg = filteredSales.length ? tr / filteredSales.length : 0
  const pm = new Map<string, number>()
  filteredSales.forEach(s => pm.set(s.paymentMode, (pm.get(s.paymentMode) || 0) + s.grandTotal))
  const pd = Array.from(pm.entries()).map(([name, value]) => ({ name, value }))
  const C = ['#2563EB', '#7C3AED', '#059669', '#D97706']

  // Category breakdown
  const catMap = new Map<string, number>()
  filteredSales.forEach(s => s.items?.forEach(i => { catMap.set('Sales', (catMap.get('Sales') || 0) + i.total) }))

  return <div className="space-y-3 sm:space-y-4">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Reports</h1><p className="text-[10px] sm:text-sm text-slate-500">{filteredSales.length} transactions{activeFilters > 0 ? ' (filtered)' : ''}</p></div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowFilters(!showFilters)}
          className={`h-7 sm:h-9 px-2 sm:px-3 rounded-lg border text-[10px] sm:text-xs font-medium flex items-center gap-1 transition-all ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
          <SlidersHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5" /><span className="hidden sm:inline">Filters</span>
          {activeFilters > 0 && <span className="bg-blue-600 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center">{activeFilters}</span>}
        </motion.button>
      </div>
    </div>

    <AnimatePresence>{showFilters && (
      <FilterBar onClear={clearAllFilters} activeCount={activeFilters}>
        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider mr-1 self-center">Period:</span>
        {[
          { value: 'all', label: 'All Time', color: 'blue' as const },
          { value: 'today', label: 'Today', color: 'emerald' as const },
          { value: 'week', label: 'This Week', color: 'violet' as const },
          { value: 'month', label: 'This Month', color: 'amber' as const },
          { value: '3months', label: '3 Months', color: 'rose' as const },
        ].map(f => <FilterChip key={f.value} label={f.label} active={dateFilter === f.value} onClick={() => setDateFilter(dateFilter === f.value ? 'all' : f.value)} color={f.color} />)}
        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider ml-2 mr-1 self-center">Payment:</span>
        {[
          { value: 'all', label: 'All', color: 'blue' as const },
          { value: 'Cash', label: 'Cash', color: 'emerald' as const },
          { value: 'Card', label: 'Card', color: 'violet' as const },
          { value: 'UPI', label: 'UPI', color: 'amber' as const },
        ].map(f => <FilterChip key={f.value} label={f.label} active={paymentFilter === f.value} onClick={() => setPaymentFilter(paymentFilter === f.value ? 'all' : f.value)} color={f.color} />)}
      </FilterBar>
    )}</AnimatePresence>

    {activeFilters > 0 && (
      <div className="flex items-center gap-1.5 flex-wrap">
        {dateFilter !== 'all' && <Badge variant="outline" className="text-[9px] gap-1 bg-blue-50 text-blue-700 border-blue-200"><CalendarDays className="h-2.5 w-2.5" />{dateFilter}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setDateFilter('all')} /></Badge>}
        {paymentFilter !== 'all' && <Badge variant="outline" className="text-[9px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200"><CreditCard className="h-2.5 w-2.5" />{paymentFilter}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setPaymentFilter('all')} /></Badge>}
      </div>
    )}

    <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
      <Card className="border-0 shadow-3d-card rounded-xl"><CardContent className="p-2 sm:p-5 text-center"><TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5 mx-auto text-emerald-600 mb-1 sm:mb-2" /><p className="text-[10px] sm:text-2xl font-bold text-slate-900 tabular-nums">{rs(tr)}</p><p className="text-[8px] sm:text-xs text-slate-400">Revenue</p></CardContent></Card>
      <Card className="border-0 shadow-3d-card rounded-xl"><CardContent className="p-2 sm:p-5 text-center"><Percent className="h-3.5 w-3.5 sm:h-5 sm:w-5 mx-auto text-blue-600 mb-1 sm:mb-2" /><p className="text-[10px] sm:text-2xl font-bold text-slate-900 tabular-nums">{rs(tt)}</p><p className="text-[8px] sm:text-xs text-slate-400">Tax</p></CardContent></Card>
      <Card className="border-0 shadow-3d-card rounded-xl"><CardContent className="p-2 sm:p-5 text-center"><BarChart3 className="h-3.5 w-3.5 sm:h-5 sm:w-5 mx-auto text-violet-600 mb-1 sm:mb-2" /><p className="text-[10px] sm:text-2xl font-bold text-slate-900 tabular-nums">{rs(avg)}</p><p className="text-[8px] sm:text-xs text-slate-400">Avg Sale</p></CardContent></Card>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
      <Card className="border-0 shadow-3d-card rounded-2xl"><CardHeader className="pb-1 px-3 sm:px-4 pt-3 sm:pt-4"><CardTitle className="text-xs sm:text-[15px] font-semibold text-slate-900">Revenue Trend</CardTitle></CardHeader><CardContent className="px-1 sm:px-2 pb-3 sm:pb-4">{dd?.chartData?.length ? <ResponsiveContainer width="100%" height={200}><AreaChart data={dd.chartData}><defs><linearGradient id="rG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v: number) => `Rs.${v}`} axisLine={false} tickLine={false} width={38} /><Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} fill="url(#rG)" /></AreaChart></ResponsiveContainer> : <EmptyChart />}</CardContent></Card>
      <Card className="border-0 shadow-3d-card rounded-2xl"><CardHeader className="pb-1 px-3 sm:px-4 pt-3 sm:pt-4"><CardTitle className="text-xs sm:text-[15px] font-semibold text-slate-900">Payment Breakdown</CardTitle></CardHeader><CardContent className="px-1 sm:px-2 pb-3 sm:pb-4">{pd.length ? <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pd} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} strokeWidth={2} stroke="#fff">{pd.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}</Pie></PieChart></ResponsiveContainer> : <EmptyChart />}</CardContent></Card>
    </div>
  </div>
}

