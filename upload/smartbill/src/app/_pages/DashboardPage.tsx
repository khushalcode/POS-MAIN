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
export default function DashboardPage() {
  const { data, isLoading } = useDashboardData()
  if (isLoading) return <div className="space-y-6"><div className="h-8 w-44 shimmer rounded-lg" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1,2,3,4].map(i => <Card key={i}><CardContent className="p-4"><div className="h-16 shimmer rounded" /></CardContent></Card>)}</div></div>

  const stats = [
    { title: "Today's Revenue", value: rs(data?.todayRevenue || 0), sub: `${data?.todayCount || 0} sales`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'up' },
    { title: 'Monthly Revenue', value: rs(data?.monthRevenue || 0), sub: `${data?.monthCount || 0} sales`, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'up' },
    { title: 'Total Products', value: String(data?.productCount || 0), sub: 'In inventory', icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
    { title: 'Customers', value: String(data?.customerCount || 0), sub: 'Total registered', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1><p className="text-[10px] sm:text-sm text-slate-500 mt-0.5">Welcome back! Here&apos;s your business overview.</p></div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LiveClock />
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-1 text-[9px] sm:text-xs font-medium"><WifiOff className="h-3 w-3 mr-1" />Offline</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((s, i) => <StatCard key={s.title} {...s} delay={i * 0.06} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
        <Card className="lg:col-span-2 border-0 shadow-3d-card rounded-2xl">
          <CardHeader className="pb-1 px-3 sm:px-5 pt-3 sm:pt-5"><div className="flex items-center justify-between"><CardTitle className="text-xs sm:text-[15px] font-semibold text-slate-900">Revenue Trend</CardTitle><Badge variant="outline" className="text-[8px] sm:text-[10px] px-2">7 Days</Badge></div></CardHeader>
          <CardContent className="pt-0 px-1 sm:px-4 pb-3 sm:pb-4">
            {data?.chartData?.length ? (
              <>
                <ResponsiveContainer width="100%" height={180} className="sm:hidden"><AreaChart data={data.chartData}><defs><linearGradient id="mG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94a3b8' }} tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 8, fill: '#94a3b8' }} tickFormatter={(v: number) => `Rs.${v}`} axisLine={false} tickLine={false} width={38} /><Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} fill="url(#mG)" dot={false} /></AreaChart></ResponsiveContainer>
                <ResponsiveContainer width="100%" height={280} className="hidden sm:block"><AreaChart data={data.chartData}><defs><linearGradient id="dG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v: number) => `Rs. ${v}`} axisLine={false} tickLine={false} /><Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2.5} fill="url(#dG)" dot={{ fill: '#2563EB', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} /></AreaChart></ResponsiveContainer>
              </>
            ) : <EmptyChart />}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-3d-card rounded-2xl">
          <CardHeader className="pb-1 px-3 sm:px-5 pt-3 sm:pt-5"><CardTitle className="text-xs sm:text-[15px] font-semibold text-slate-900">Recent Sales</CardTitle></CardHeader>
          <CardContent className="px-2 sm:px-4 pb-3 sm:pb-4">
            <div className="space-y-1.5">
              {data?.recentSales?.length ? data.recentSales.map(s => (
                <div key={s.id} className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-1.5 sm:gap-2"><div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><Receipt className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-blue-600" /></div><div><p className="text-[10px] sm:text-sm font-semibold text-slate-800 font-mono">{s.invoiceNumber}</p><p className="text-[8px] sm:text-[11px] text-slate-400">{new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p></div></div>
                  <div className="text-right"><p className="text-[10px] sm:text-sm font-bold text-slate-900">{rs(s.grandTotal)}</p><Badge variant="outline" className="text-[7px] sm:text-[9px] px-1 py-0 h-3 sm:h-4">{s.paymentMode}</Badge></div>
                </div>
              )) : <Empty icon={Receipt} text="No recent sales" />}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-3">
        {[
          { icon: WifiOff, t: '100% Offline', d: 'No internet needed', c: 'text-blue-600 bg-blue-50' },
          { icon: Bluetooth, t: 'BT Print', d: 'Thermal printer', c: 'text-violet-600 bg-violet-50' },
          { icon: Shield, t: 'Secure', d: 'SQLite DB', c: 'text-emerald-600 bg-emerald-50' },
          { icon: Users, t: 'Multi-User', d: 'Admin & Staff', c: 'text-amber-600 bg-amber-50' },
          { icon: BarChart3, t: 'Reports', d: 'Daily/Monthly', c: 'text-rose-600 bg-rose-50' },
          { icon: Cloud, t: 'Backup', d: 'Data safety', c: 'text-sky-600 bg-sky-50' },
        ].map(f => (
          <Card key={f.t} className="border-0 shadow-3d-card hover:shadow-3d-card-hover transition-all duration-300 cursor-default group rounded-xl py-2 sm:py-4 px-1 sm:px-2 text-center">
            <div className={`${f.c} p-1.5 sm:p-2 rounded-lg mx-auto w-fit group-hover:scale-110 transition-transform duration-300`}><f.icon className="h-3 w-3 sm:h-5 sm:w-5" /></div>
            <p className="text-[8px] sm:text-xs font-semibold text-slate-900 mt-1">{f.t}</p>
            <p className="text-[7px] sm:text-[10px] text-slate-400 mt-0.5 hidden sm:block">{f.d}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

