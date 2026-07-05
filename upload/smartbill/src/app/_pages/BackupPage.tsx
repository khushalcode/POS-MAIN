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
export default function BackupPage() {
  const [seeding, setSeeding] = useState(false)
  const qc = useQueryClient()
  const handleSeed = async () => { setSeeding(true); try { const r = await fetch('/api/seed', { method: 'POST' }); const d = await r.json(); toast.success(d.message || 'Seeded!', { icon: '✅' }); qc.invalidateQueries() } catch { toast.error('Failed') } finally { setSeeding(false) } }
  return <div className="space-y-4 sm:space-y-5"><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Backup & Restore</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      <Card className="border-0 shadow-3d-card rounded-2xl"><CardContent className="p-3 sm:p-6 text-center"><Download className="h-6 w-6 sm:h-10 sm:w-10 mx-auto text-blue-600 mb-2 sm:mb-3" /><h3 className="font-semibold text-slate-900 text-xs sm:text-base">Export Data</h3><p className="text-[9px] sm:text-sm text-slate-400 mt-0.5">Download backup file</p><Button variant="outline" className="mt-2 sm:mt-4 gap-1 text-[10px] sm:text-xs h-7 sm:h-9" onClick={() => toast.info('Coming soon')}><Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />Export</Button></CardContent></Card>
      <Card className="border-0 shadow-3d-card rounded-2xl"><CardContent className="p-3 sm:p-6 text-center"><Upload className="h-6 w-6 sm:h-10 sm:w-10 mx-auto text-emerald-600 mb-2 sm:mb-3" /><h3 className="font-semibold text-slate-900 text-xs sm:text-base">Import Data</h3><p className="text-[9px] sm:text-sm text-slate-400 mt-0.5">Restore from backup</p><Button variant="outline" className="mt-2 sm:mt-4 gap-1 text-[10px] sm:text-xs h-7 sm:h-9" onClick={() => toast.info('Coming soon')}><Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5" />Import</Button></CardContent></Card>
    </div>
    <Card className="border-0 shadow-3d-card rounded-2xl"><CardContent className="p-3 sm:p-6"><h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 text-xs sm:text-[15px]"><Database className="h-4 w-4 text-blue-600" />Seed Demo Data</h3><p className="text-[10px] sm:text-sm text-slate-400 mb-2 sm:mb-4">Load sample products, customers & sales</p><Button className="gradient-primary shadow-blue-3d gap-1.5 text-[10px] sm:text-sm h-7 sm:h-9" onClick={handleSeed} disabled={seeding}>{seeding ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Plus className="h-3 w-3 sm:h-4 sm:w-4" />}{seeding ? 'Seeding...' : 'Seed Data'}</Button></CardContent></Card>
  </div>
}

