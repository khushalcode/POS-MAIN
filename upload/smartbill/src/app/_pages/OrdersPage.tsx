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
export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const { data, isLoading } = useOrders(statusFilter !== 'all' ? statusFilter : undefined)
  if (isLoading) return <div className="space-y-4"><div className="h-8 shimmer rounded w-40" /><div className="h-64 shimmer rounded" /></div>

  const filtered = (data || []).filter(o => !search || (o.customerName || '').toLowerCase().includes(search.toLowerCase()) || o.orderNumber.toLowerCase().includes(search.toLowerCase()))
  const activeFilters = statusFilter !== 'all' ? 1 : 0
  const statusColors: Record<string, string> = { pending: 'bg-amber-50 text-amber-700 border-amber-200', processing: 'bg-blue-50 text-blue-700 border-blue-200', delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200', cancelled: 'bg-red-50 text-red-700 border-red-200' }
  const totalOrd = filtered.reduce((s, o) => s + o.subtotal, 0)
  const totalBal = filtered.reduce((s, o) => s + o.balance, 0)

  return <div className="space-y-4 sm:space-y-5">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Order List</h1><p className="text-[10px] sm:text-sm text-slate-500 mt-0.5">{filtered.length} orders &middot; Total: {rs(totalOrd)} &middot; Balance: {rs(totalBal)}</p></div>
      <Button variant="outline" size="sm" className="h-7 sm:h-8 text-[9px] sm:text-xs gap-1" onClick={() => setShowFilters(!showFilters)}><FilterIcon className="h-3 w-3" />Filter{activeFilters > 0 && <Badge className="bg-blue-100 text-blue-700 text-[7px] px-1 py-0 h-3.5 border-0 ml-0.5">{activeFilters}</Badge>}</Button>
    </div>
    <div className="relative"><Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 sm:h-9 text-xs sm:text-sm bg-white" placeholder="Search order or customer..." /></div>
    <AnimatePresence>{showFilters && (
      <FilterBar onClear={() => setStatusFilter('all')} activeCount={activeFilters}>
        {['all', 'pending', 'processing', 'delivered', 'cancelled'].map(v => <FilterChip key={v} label={v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)} active={statusFilter === v} onClick={() => setStatusFilter(v)} color={v === 'delivered' ? 'emerald' : v === 'cancelled' ? 'rose' : v === 'pending' ? 'amber' : 'blue'} />)}
      </FilterBar>
    )}</AnimatePresence>
    <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
      <Card className="border-0 shadow-3d-card rounded-xl"><CardContent className="p-2 sm:p-5 text-center"><Receipt className="h-3.5 w-3.5 sm:h-5 sm:w-5 mx-auto text-indigo-600 mb-1 sm:mb-2" /><p className="text-[10px] sm:text-2xl font-bold text-slate-900 tabular-nums">{filtered.length}</p><p className="text-[8px] sm:text-xs text-slate-400">Total Orders</p></CardContent></Card>
      <Card className="border-0 shadow-3d-card rounded-xl"><CardContent className="p-2 sm:p-5 text-center"><Banknote className="h-3.5 w-3.5 sm:h-5 sm:w-5 mx-auto text-emerald-600 mb-1 sm:mb-2" /><p className="text-[10px] sm:text-2xl font-bold text-slate-900 tabular-nums">{rs(totalOrd)}</p><p className="text-[8px] sm:text-xs text-slate-400">Total Value</p></CardContent></Card>
      <Card className="border-0 shadow-3d-card rounded-xl"><CardContent className="p-2 sm:p-5 text-center"><HandCoins className="h-3.5 w-3.5 sm:h-5 sm:w-5 mx-auto text-rose-600 mb-1 sm:mb-2" /><p className="text-[10px] sm:text-2xl font-bold text-slate-900 tabular-nums">{rs(totalBal)}</p><p className="text-[8px] sm:text-xs text-slate-400">Balance Due</p></CardContent></Card>
    </div>
    <div className="space-y-2">{filtered.length ? filtered.map(o => (
      <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3"><div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0"><Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" /></div><div><p className="text-xs sm:text-sm font-semibold text-slate-800 font-mono">{o.orderNumber}</p><p className="text-[9px] sm:text-xs text-slate-400">{o.customerName || 'No customer'}</p></div></div>
          <div className="text-right"><p className="text-xs sm:text-sm font-bold text-slate-900">{rs(o.subtotal)}</p><Badge variant="outline" className={`text-[7px] sm:text-[8px] px-1.5 py-0 h-4 ${statusColors[o.status] || ''}`}>{o.status}</Badge></div>
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[8px] sm:text-[10px] text-slate-300"><span>Advance: {rs(o.advance)}</span><span>Balance: {rs(o.balance)}</span>{o.deliveryDate && <span>Delivery: {new Date(o.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}</div>
      </motion.div>
    )) : <Empty icon={Receipt} text="No orders found" />}</div>
  </div>
}

