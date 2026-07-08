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
export default function SuppliersPage() {
  const [show, setShow] = useState(false)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const { data, isLoading } = useSuppliers()
  const qc = useQueryClient()
  const cMut = useMutation({ mutationFn: async (d: any) => { const r = await fetch('/api/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); if (!r.ok) throw new Error(); return r.json() }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setShow(false); toast.success('Supplier added!', { icon: '✅' }) } })
  const dMut = useMutation({ mutationFn: async (id: string) => { const r = await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' }); if (!r.ok) throw new Error(); return r.json() }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Deleted') } })

  const filteredSuppliers = data?.filter(s => {
    if (search) { const q = search.toLowerCase(); if (!s.name.toLowerCase().includes(q) && !(s.phone || '').includes(q) && !(s.email || '').toLowerCase().includes(q)) return false }
    return true
  }) || []

  return <div className="space-y-3 sm:space-y-4">
    <div className="flex items-center justify-between flex-wrap gap-2"><div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Suppliers</h1><p className="text-[10px] sm:text-sm text-slate-500">{data?.length || 0} total · {filteredSuppliers.length} shown</p></div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative"><Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-7 w-28 sm:w-44 h-7 sm:h-9 bg-white text-[10px] sm:text-sm" /></div>
        <Dialog open={show} onOpenChange={setShow}><DialogTrigger asChild><Button className="gradient-primary shadow-blue-3d gap-1 h-7 sm:h-9 text-[10px] sm:text-xs"><Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />Add</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader><div className="space-y-2.5"><div className="space-y-1.5"><Label className="text-xs">Name</Label><Input id="sn" placeholder="Supplier name" /></div><div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input id="sp" placeholder="+91 98765 43210" /></div><div className="space-y-1.5"><Label className="text-xs">Email</Label><Input id="se" placeholder="email@example.com" /></div><Button className="w-full gradient-primary shadow-blue-3d" onClick={() => { const n = (document.getElementById('sn') as HTMLInputElement)?.value; if (!n) return toast.error('Name required'); cMut.mutate({ name: n, phone: (document.getElementById('sp') as HTMLInputElement)?.value, email: (document.getElementById('se') as HTMLInputElement)?.value }) }} disabled={cMut.isPending}>{cMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Supplier</Button></div></DialogContent></Dialog></div></div>
    {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">{[1,2].map(i => <Card key={i} className="rounded-xl"><CardContent className="p-3"><div className="h-14 shimmer rounded" /></CardContent></Card>)}</div>
     : filteredSuppliers.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">{filteredSuppliers.map(s => <Card key={s.id} className="border border-slate-200/70 shadow-3d-card hover:shadow-3d-card-hover transition-all duration-200 rounded-xl"><CardContent className="p-2.5 sm:p-4"><div className="flex items-start justify-between"><div className="flex items-center gap-2 sm:gap-3"><div className="bg-amber-50 p-1.5 sm:p-2 rounded-lg"><Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" /></div><div><p className="font-semibold text-slate-900 text-[11px] sm:text-sm">{s.name}</p>{s.phone && <p className="text-[8px] sm:text-[11px] text-slate-400 flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" />{s.phone}</p>}{s.email && <p className="text-[8px] sm:text-[11px] text-slate-400 flex items-center gap-0.5"><Mail className="h-2.5 w-2.5" />{s.email}</p>}</div></div><Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500 h-5 w-5 sm:h-6 sm:w-6" onClick={() => dMut.mutate(s.id)}><Trash className="h-2.5 w-2.5 sm:h-3 sm:w-3" /></Button></div></CardContent></Card>)}</div>
     : <Empty icon={Truck} text={search ? "No suppliers match your search" : "No suppliers"} />}
  </div>
}

