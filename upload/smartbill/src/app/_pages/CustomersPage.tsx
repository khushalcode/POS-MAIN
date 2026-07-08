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
export default function CustomersPage() {
  const [show, setShow] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(true)
  const { data, isLoading } = useCustomers()
  const qc = useQueryClient()
  const cMut = useMutation({ mutationFn: async (d: any) => { const r = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); if (!r.ok) throw new Error(); return r.json() }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setShow(false); toast.success('Customer added!', { icon: '✅' }) } })
  const dMut = useMutation({ mutationFn: async (id: string) => { const r = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' }); if (!r.ok) throw new Error(); return r.json() }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Deleted') } })

  const activeFilters = [typeFilter !== 'all' ? 1 : 0, search ? 1 : 0].reduce((a, b) => a + b, 0)
  const clearAllFilters = () => { setTypeFilter('all'); setSearch(''); setSortBy('name') }

  const filteredCustomers = data?.filter(c => {
    if (search) { const q = search.toLowerCase(); if (!c.name.toLowerCase().includes(q) && !(c.phone || '').includes(q) && !(c.email || '').toLowerCase().includes(q)) return false }
    if (typeFilter === 'withphone' && !c.phone) return false
    if (typeFilter === 'withemail' && !c.email) return false
    if (typeFilter === 'complete' && (!c.phone || !c.email)) return false
    return true
  }) || []

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'newest') return 0
    return 0
  })

  return <div className="space-y-3 sm:space-y-4">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Party List</h1><p className="text-[10px] sm:text-sm text-slate-500">{data?.length || 0} total · {sortedCustomers.length} shown</p></div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative"><Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Search parties..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-7 w-28 sm:w-44 h-7 sm:h-9 bg-white text-[10px] sm:text-sm" /></div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowFilters(!showFilters)}
          className={`h-7 sm:h-9 px-2 sm:px-3 rounded-lg border text-[10px] sm:text-xs font-medium flex items-center gap-1 transition-all ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
          <SlidersHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5" /><span className="hidden sm:inline">Filters</span>
          {activeFilters > 0 && <span className="bg-blue-600 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center">{activeFilters}</span>}
        </motion.button>
        <Dialog open={show} onOpenChange={setShow}><DialogTrigger asChild><Button className="gradient-primary shadow-blue-3d gap-1 h-7 sm:h-9 text-[10px] sm:text-xs"><UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />Add</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add Party</DialogTitle></DialogHeader><div className="space-y-2.5"><div className="space-y-1.5"><Label className="text-xs">Name</Label><Input id="cn" placeholder="Customer name" /></div><div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input id="cp" placeholder="+91 98765 43210" /></div><div className="space-y-1.5"><Label className="text-xs">Email</Label><Input id="ce" placeholder="email@example.com" /></div><Button className="w-full gradient-primary shadow-blue-3d" onClick={() => { const n = (document.getElementById('cn') as HTMLInputElement)?.value; if (!n) return toast.error('Name required'); cMut.mutate({ name: n, phone: (document.getElementById('cp') as HTMLInputElement)?.value, email: (document.getElementById('ce') as HTMLInputElement)?.value }) }} disabled={cMut.isPending}>{cMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Party</Button></div></DialogContent></Dialog>
      </div>
    </div>

    <AnimatePresence>{showFilters && (
      <FilterBar onClear={clearAllFilters} activeCount={activeFilters}>
        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider mr-1 self-center">Type:</span>
        {[
          { value: 'all', label: 'All Parties', color: 'blue' as const },
          { value: 'withphone', label: 'With Phone', color: 'emerald' as const },
          { value: 'withemail', label: 'With Email', color: 'violet' as const },
          { value: 'complete', label: 'Complete Profile', color: 'amber' as const },
        ].map(f => <FilterChip key={f.value} label={f.label} active={typeFilter === f.value} onClick={() => setTypeFilter(typeFilter === f.value ? 'all' : f.value)} color={f.color} />)}
      </FilterBar>
    )}</AnimatePresence>

    {activeFilters > 0 && (
      <div className="flex items-center gap-1.5 flex-wrap">
        {typeFilter !== 'all' && <Badge variant="outline" className="text-[9px] gap-1 bg-blue-50 text-blue-700 border-blue-200"><Users className="h-2.5 w-2.5" />{typeFilter === 'withphone' ? 'With Phone' : typeFilter === 'withemail' ? 'With Email' : 'Complete'}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setTypeFilter('all')} /></Badge>}
        {search && <Badge variant="outline" className="text-[9px] gap-1 bg-violet-50 text-violet-700 border-violet-200"><Search className="h-2.5 w-2.5" />"{search}"<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setSearch('')} /></Badge>}
      </div>
    )}

    {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">{[1,2,3].map(i => <Card key={i} className="rounded-xl"><CardContent className="p-3"><div className="h-14 shimmer rounded" /></CardContent></Card>)}</div>
     : sortedCustomers.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">{sortedCustomers.map(c => <Card key={c.id} className="border-0 shadow-3d-card hover:shadow-3d-card-hover transition-all duration-200 rounded-xl"><CardContent className="p-2.5 sm:p-4"><div className="flex items-start justify-between"><div className="flex items-center gap-2 sm:gap-3"><div className="bg-blue-50 p-1.5 sm:p-2 rounded-lg"><Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" /></div><div><p className="font-semibold text-slate-900 text-[11px] sm:text-sm">{c.name}</p>{c.phone && <p className="text-[8px] sm:text-[11px] text-slate-400 flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" />{c.phone}</p>}{c.email && <p className="text-[8px] sm:text-[11px] text-slate-400 flex items-center gap-0.5"><Mail className="h-2.5 w-2.5" />{c.email}</p>}</div></div><Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500 h-5 w-5 sm:h-6 sm:w-6" onClick={() => dMut.mutate(c.id)}><Trash className="h-2.5 w-2.5 sm:h-3 sm:w-3" /></Button></div></CardContent></Card>)}</div>
     : <Empty icon={Users} text={activeFilters > 0 ? "No parties match your filters" : "No parties"} />}
  </div>
}

