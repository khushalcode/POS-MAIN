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
export default function HistoryPage() {
  const [period, setPeriod] = useState('all')
  const [viewSale, setViewSale] = useState<Sale | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(true)
  const { data: sales, isLoading } = useSales(period)

  const activeFilters = [paymentFilter !== 'all' ? 1 : 0, dateFilter !== 'all' ? 1 : 0, searchTerm ? 1 : 0].reduce((a, b) => a + b, 0)

  const clearAllFilters = () => { setPaymentFilter('all'); setDateFilter('all'); setSearchTerm(''); setSortBy('newest') }

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
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!s.invoiceNumber.toLowerCase().includes(q) && !(s.customerName || '').toLowerCase().includes(q)) return false
    }
    return true
  }) || []

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    if (sortBy === 'highest') return b.grandTotal - a.grandTotal
    if (sortBy === 'lowest') return a.grandTotal - b.grandTotal
    return 0
  })

  const totalFiltered = sortedSales.reduce((s, x) => s + x.grandTotal, 0)

  return <div className="space-y-3 sm:space-y-4">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Sale List</h1><p className="text-[10px] sm:text-sm text-slate-500">{sales?.length || 0} total · {sortedSales.length} shown{activeFilters > 0 && ` · ${rs(totalFiltered)}`}</p></div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative"><Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Invoice / Customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-7 w-28 sm:w-44 h-7 sm:h-9 bg-white text-[10px] sm:text-sm" /></div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowFilters(!showFilters)}
          className={`h-7 sm:h-9 px-2 sm:px-3 rounded-lg border text-[10px] sm:text-xs font-medium flex items-center gap-1 transition-all ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
          <SlidersHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5" /><span className="hidden sm:inline">Filters</span>
          {activeFilters > 0 && <span className="bg-blue-600 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center">{activeFilters}</span>}
        </motion.button>
        <SortSelect value={sortBy} onChange={setSortBy} options={[{ value: 'newest', label: 'Newest First' }, { value: 'oldest', label: 'Oldest First' }, { value: 'highest', label: 'Highest Amount' }, { value: 'lowest', label: 'Lowest Amount' }]} />
      </div>
    </div>

    <AnimatePresence>{showFilters && (
      <FilterBar onClear={clearAllFilters} activeCount={activeFilters}>
        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider mr-1 self-center">Date:</span>
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
          { value: 'Wallet', label: 'Wallet', color: 'rose' as const },
        ].map(f => <FilterChip key={f.value} label={f.label} active={paymentFilter === f.value} onClick={() => setPaymentFilter(paymentFilter === f.value ? 'all' : f.value)} color={f.color} />)}
      </FilterBar>
    )}</AnimatePresence>

    {activeFilters > 0 && (
      <div className="flex items-center gap-1.5 flex-wrap">
        {dateFilter !== 'all' && <Badge variant="outline" className="text-[9px] gap-1 bg-blue-50 text-blue-700 border-blue-200"><CalendarDays className="h-2.5 w-2.5" />{dateFilter}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setDateFilter('all')} /></Badge>}
        {paymentFilter !== 'all' && <Badge variant="outline" className="text-[9px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200"><CreditCard className="h-2.5 w-2.5" />{paymentFilter}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setPaymentFilter('all')} /></Badge>}
        {searchTerm && <Badge variant="outline" className="text-[9px] gap-1 bg-violet-50 text-violet-700 border-violet-200"><Search className="h-2.5 w-2.5" />"{searchTerm}"<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setSearchTerm('')} /></Badge>}
      </div>
    )}

    {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <Card key={i} className="rounded-xl"><CardContent className="p-3"><div className="h-12 shimmer rounded" /></CardContent></Card>)}</div>
     : sortedSales.length ? <div className="space-y-1.5 sm:space-y-2">{sortedSales.map(s => <Card key={s.id} className="border-0 shadow-3d-card hover:shadow-3d-card-hover transition-all duration-200 cursor-pointer rounded-xl" onClick={() => setViewSale(s)}><CardContent className="p-2.5 sm:p-4 flex items-center justify-between"><div className="flex items-center gap-1.5 sm:gap-3"><div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${s.paymentMode === 'Cash' ? 'bg-emerald-50' : s.paymentMode === 'Card' ? 'bg-violet-50' : s.paymentMode === 'UPI' ? 'bg-amber-50' : 'bg-blue-50'}`}><Receipt className={`h-3 w-3 sm:h-4 sm:w-4 ${s.paymentMode === 'Cash' ? 'text-emerald-600' : s.paymentMode === 'Card' ? 'text-violet-600' : s.paymentMode === 'UPI' ? 'text-amber-600' : 'text-blue-600'}`} /></div><div><p className="text-[10px] sm:text-sm font-semibold text-slate-900 font-mono">{s.invoiceNumber}</p><p className="text-[8px] sm:text-[11px] text-slate-400">{new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {s.customerName || 'Walk-in'}</p></div></div><div className="text-right flex items-center gap-1 sm:gap-3"><div><p className="text-[10px] sm:text-sm font-bold text-slate-900">{rs(s.grandTotal)}</p><Badge variant="outline" className={`text-[7px] sm:text-[9px] px-1 py-0 h-3 sm:h-4 ${s.paymentMode === 'Cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : s.paymentMode === 'Card' ? 'bg-violet-50 text-violet-700 border-violet-200' : s.paymentMode === 'UPI' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{s.paymentMode}</Badge></div><ChevronRight className="h-3 w-3 text-slate-300 hidden sm:block" /></div></CardContent></Card>)}</div>
     : <Empty icon={Clock} text={activeFilters > 0 ? "No sales match your filters" : "No sales history"} />}
    <Dialog open={!!viewSale} onOpenChange={() => setViewSale(null)}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />Invoice</DialogTitle></DialogHeader>{viewSale && <InvoiceView sale={viewSale} />}</DialogContent></Dialog>
  </div>
}

