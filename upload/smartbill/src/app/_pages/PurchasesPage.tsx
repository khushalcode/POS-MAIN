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
export default function PurchasesPage() {
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const { data, isLoading } = usePurchases()
  if (isLoading) return <div className="space-y-4"><div className="h-8 shimmer rounded w-40" /><div className="h-64 shimmer rounded" /></div>

  const filtered = (data || []).filter(p => {
    const m1 = !search || (p.supplierName || '').toLowerCase().includes(search.toLowerCase()) || p.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    let m2 = true
    if (dateFilter !== 'all') {
      const d = new Date(p.createdAt), now = new Date()
      if (dateFilter === 'today') m2 = d.toDateString() === now.toDateString()
      else if (dateFilter === 'week') m2 = d > new Date(now.getTime() - 7 * 86400000)
      else if (dateFilter === 'month') m2 = d > new Date(now.getTime() - 30 * 86400000)
      else if (dateFilter === '3months') m2 = d > new Date(now.getTime() - 90 * 86400000)
    }
    const m3 = paymentFilter === 'all' || p.paymentMode === paymentFilter
    return m1 && m2 && m3
  }).sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    if (sort === 'highest') return b.grandTotal - a.grandTotal
    return a.grandTotal - b.grandTotal
  })

  const totalPur = filtered.reduce((s, p) => s + p.grandTotal, 0)
  const activeFilters = (dateFilter !== 'all' ? 1 : 0) + (paymentFilter !== 'all' ? 1 : 0)
  const payIcons: Record<string, any> = { Cash: Banknote, Card: CreditCard, UPI: Smartphone, 'Bank Transfer': Building2 }

  return <div className="space-y-4 sm:space-y-5">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Purchase List</h1><p className="text-[10px] sm:text-sm text-slate-500 mt-0.5">{filtered.length} purchases &middot; Total: {rs(totalPur)}</p></div>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" className="h-7 sm:h-8 text-[9px] sm:text-xs gap-1" onClick={() => setShowFilters(!showFilters)}><FilterIcon className="h-3 w-3" />Filter{activeFilters > 0 && <Badge className="bg-blue-100 text-blue-700 text-[7px] px-1 py-0 h-3.5 border-0 ml-0.5">{activeFilters}</Badge>}</Button>
        <SortSelect value={sort} onChange={setSort} options={[{ value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }, { value: 'highest', label: 'Highest' }, { value: 'lowest', label: 'Lowest' }]} />
      </div>
    </div>
    <div className="relative"><Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 sm:h-9 text-xs sm:text-sm bg-white" placeholder="Search invoice or supplier..." /></div>
    <AnimatePresence>{showFilters && (
      <FilterBar onClear={() => { setDateFilter('all'); setPaymentFilter('all') }} activeCount={activeFilters}>
        {['all', 'today', 'week', 'month', '3months'].map(v => <FilterChip key={v} label={v === 'all' ? 'All' : v === '3months' ? '3 Months' : v.charAt(0).toUpperCase() + v.slice(1)} active={dateFilter === v} onClick={() => setDateFilter(v)} color="blue" />)}
        <div className="w-full h-px bg-slate-100 my-0.5" />
        {['all', 'Cash', 'UPI', 'Card', 'Bank Transfer'].map(v => <FilterChip key={v} label={v === 'all' ? 'All' : v} active={paymentFilter === v} onClick={() => setPaymentFilter(paymentFilter === v ? 'all' : v)} color={v === 'Cash' ? 'emerald' : v === 'UPI' ? 'amber' : v === 'Card' ? 'blue' : 'violet'} />)}
      </FilterBar>
    )}</AnimatePresence>
    {activeFilters > 0 && <div className="flex items-center gap-1.5 flex-wrap">
      {dateFilter !== 'all' && <Badge variant="outline" className="text-[9px] gap-1 bg-blue-50 text-blue-700 border-blue-200"><CalendarDays className="h-2.5 w-2.5" />{dateFilter}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setDateFilter('all')} /></Badge>}
      {paymentFilter !== 'all' && <Badge variant="outline" className="text-[9px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200"><CreditCard className="h-2.5 w-2.5" />{paymentFilter}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setPaymentFilter('all')} /></Badge>}
    </div>}
    <div className="space-y-2">{filtered.length ? filtered.map(p => {
      const PI = payIcons[p.paymentMode] || Banknote
      return <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3"><div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0"><ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" /></div><div><p className="text-xs sm:text-sm font-semibold text-slate-800 font-mono">{p.invoiceNumber}</p><p className="text-[9px] sm:text-xs text-slate-400">{p.supplierName || 'Walk-in'}</p></div></div>
          <div className="text-right"><p className="text-xs sm:text-sm font-bold text-slate-900">{rs(p.grandTotal)}</p><div className="flex items-center gap-1 mt-0.5 justify-end"><PI className="h-2.5 w-2.5 text-slate-400" /><Badge variant="outline" className={`text-[7px] sm:text-[8px] px-1 py-0 h-3.5 ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{p.status}</Badge></div></div>
        </div>
        <p className="text-[8px] sm:text-[10px] text-slate-300 mt-1.5">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} &middot; {p.paymentMode}</p>
      </motion.div>
    }) : <Empty icon={ShoppingBag} text="No purchases found" />}</div>
  </div>
}

