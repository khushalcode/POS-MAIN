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
export default function UsersPage() {
  const [show, setShow] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const { data, isLoading } = useAppUsers()
  const qc = useQueryClient()
  const cMut = useMutation({ mutationFn: async (d: any) => { const r = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); if (!r.ok) throw new Error(); return r.json() }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShow(false); toast.success('User added!', { icon: '✅' }) } })
  const dMut = useMutation({ mutationFn: async (id: string) => { const r = await fetch(`/api/users?id=${id}`, { method: 'DELETE' }); if (!r.ok) throw new Error(); return r.json() }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Deleted') } })

  const filteredUsers = data?.filter(u => {
    if (search) { const q = search.toLowerCase(); if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    return true
  }) || []

  return <div className="space-y-3 sm:space-y-4">
    <div className="flex items-center justify-between flex-wrap gap-2"><div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Staff List</h1><p className="text-[10px] sm:text-sm text-slate-500">{data?.length || 0} total · {filteredUsers.length} shown</p></div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative"><Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-7 w-28 sm:w-44 h-7 sm:h-9 bg-white text-[10px] sm:text-sm" /></div>
        <div className="flex items-center gap-0.5">
          <FilterChip label="All" active={roleFilter === 'all'} onClick={() => setRoleFilter('all')} color="blue" />
          <FilterChip label="Admin" active={roleFilter === 'admin'} onClick={() => setRoleFilter(roleFilter === 'admin' ? 'all' : 'admin')} color="violet" />
          <FilterChip label="Staff" active={roleFilter === 'staff'} onClick={() => setRoleFilter(roleFilter === 'staff' ? 'all' : 'staff')} color="emerald" />
        </div>
        <Dialog open={show} onOpenChange={setShow}><DialogTrigger asChild><Button className="gradient-primary shadow-blue-3d gap-1 h-7 sm:h-9 text-[10px] sm:text-xs"><UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />Add</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add Staff</DialogTitle></DialogHeader><div className="space-y-2.5"><div className="space-y-1.5"><Label className="text-xs">Name</Label><Input id="un" placeholder="Full name" /></div><div className="space-y-1.5"><Label className="text-xs">Email</Label><Input id="ue" placeholder="email@example.com" /></div><div className="space-y-1.5"><Label className="text-xs">Password</Label><Input id="up" type="password" placeholder="Password" /></div><Button className="w-full gradient-primary shadow-blue-3d" onClick={() => { const n = (document.getElementById('un') as HTMLInputElement)?.value; const e = (document.getElementById('ue') as HTMLInputElement)?.value; if (!n || !e) return toast.error('Required'); cMut.mutate({ name: n, email: e, password: (document.getElementById('up') as HTMLInputElement)?.value || 'default123', role: 'staff' }) }} disabled={cMut.isPending}>{cMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Staff</Button></div></DialogContent></Dialog></div></div>
    {isLoading ? <div className="space-y-2">{[1,2].map(i => <Card key={i} className="rounded-xl"><CardContent className="p-3"><div className="h-14 shimmer rounded" /></CardContent></Card>)}</div>
     : filteredUsers.length ? <div className="space-y-1.5 sm:space-y-2">{filteredUsers.map(u => <Card key={u.id} className="border border-slate-200/70 shadow-3d-card rounded-xl"><CardContent className="p-2.5 sm:p-4 flex items-center justify-between"><div className="flex items-center gap-2 sm:gap-3"><div className={`p-1.5 sm:p-2 rounded-lg ${u.role === 'admin' ? 'bg-violet-50' : 'bg-blue-50'}`}><UserCog className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${u.role === 'admin' ? 'text-violet-600' : 'text-blue-600'}`} /></div><div><p className="font-semibold text-slate-900 text-[11px] sm:text-sm">{u.name}</p><p className="text-[8px] sm:text-[11px] text-slate-400">{u.email}</p></div></div><div className="flex items-center gap-1 sm:gap-2"><Badge className={`text-[8px] sm:text-[9px] ${u.role === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>{u.role}</Badge><Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500 h-5 w-5 sm:h-6 sm:w-6" onClick={() => dMut.mutate(u.id)}><Trash className="h-2.5 w-2.5 sm:h-3 sm:w-3" /></Button></div></CardContent></Card>)}</div>
     : <Empty icon={UserCog} text={search || roleFilter !== 'all' ? "No staff match your filters" : "No staff"} />}
  </div>
}


