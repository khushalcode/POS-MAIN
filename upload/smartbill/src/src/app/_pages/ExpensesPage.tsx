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
export default function ExpensesPage() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const { data, isLoading } = useExpenses(catFilter, periodFilter)
  if (isLoading) return <div className="space-y-4"><div className="h-8 shimmer rounded w-40" /><div className="h-64 shimmer rounded" /></div>

  const filtered = (data || []).filter(e => !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
  const activeFilters = (catFilter !== 'all' ? 1 : 0) + (periodFilter !== 'all' ? 1 : 0)
  const totalExp = filtered.reduce((s, e) => s + e.amount, 0)
  const expCategories = ['Rent', 'Utilities', 'Transport', 'Salary', 'Maintenance', 'Marketing', 'Other']
  const catIcons: Record<string, any> = { Rent: Building2, Utilities: Zap, Transport: Truck, Salary: Users, Maintenance: Settings, Marketing: BarChart3, Other: Package }

  return <div className="space-y-4 sm:space-y-5">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Expense List</h1><p className="text-[10px] sm:text-sm text-slate-500 mt-0.5">{filtered.length} expenses &middot; Total: {rs(totalExp)}</p></div>
      <Button variant="outline" size="sm" className="h-7 sm:h-8 text-[9px] sm:text-xs gap-1" onClick={() => setShowFilters(!showFilters)}><FilterIcon className="h-3 w-3" />Filter{activeFilters > 0 && <Badge className="bg-blue-100 text-blue-700 text-[7px] px-1 py-0 h-3.5 border-0 ml-0.5">{activeFilters}</Badge>}</Button>
    </div>
    <div className="relative"><Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 sm:h-9 text-xs sm:text-sm bg-white" placeholder="Search expenses..." /></div>
    <AnimatePresence>{showFilters && (
      <FilterBar onClear={() => { setCatFilter('all'); setPeriodFilter('all') }} activeCount={activeFilters}>
        {['all', ...expCategories].map(v => <FilterChip key={v} label={v === 'all' ? 'All' : v} active={catFilter === v} onClick={() => setCatFilter(v)} color={v === 'Rent' ? 'blue' : v === 'Salary' ? 'emerald' : v === 'Utilities' ? 'amber' : 'violet'} />)}
        <div className="w-full h-px bg-slate-100 my-0.5" />
        {['all', 'today', 'week', 'month', '3months'].map(v => <FilterChip key={v} label={v === 'all' ? 'All Time' : v === '3months' ? '3 Months' : v.charAt(0).toUpperCase() + v.slice(1)} active={periodFilter === v} onClick={() => setPeriodFilter(v)} color="rose" />)}
      </FilterBar>
    )}</AnimatePresence>
    {activeFilters > 0 && <div className="flex items-center gap-1.5 flex-wrap">
      {catFilter !== 'all' && <Badge variant="outline" className="text-[9px] gap-1 bg-violet-50 text-violet-700 border-violet-200"><Tag className="h-2.5 w-2.5" />{catFilter}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setCatFilter('all')} /></Badge>}
      {periodFilter !== 'all' && <Badge variant="outline" className="text-[9px] gap-1 bg-rose-50 text-rose-700 border-rose-200"><CalendarDays className="h-2.5 w-2.5" />{periodFilter}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setPeriodFilter('all')} /></Badge>}
    </div>}
    <div className="space-y-2">{filtered.length ? filtered.map(e => {
      const CI = catIcons[e.category] || Package
      return <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3"><div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0"><CI className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600" /></div><div><p className="text-xs sm:text-sm font-semibold text-slate-800">{e.category}</p><p className="text-[9px] sm:text-xs text-slate-400">{e.description}</p></div></div>
          <div className="text-right"><p className="text-xs sm:text-sm font-bold text-rose-600">-{rs(e.amount)}</p><Badge variant="outline" className="text-[7px] sm:text-[8px] px-1 py-0 h-3.5 bg-slate-50">{e.paymentMode}</Badge></div>
        </div>
        <p className="text-[8px] sm:text-[10px] text-slate-300 mt-1.5">{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
      </motion.div>
    }) : <Empty icon={HandCoins} text="No expenses found" />}</div>
  </div>
}

