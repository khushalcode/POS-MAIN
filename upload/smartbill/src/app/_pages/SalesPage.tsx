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
export default function SalesPage() {
  const { data } = useDashboardData()
  return <div className="space-y-3 sm:space-y-4"><div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">New Sale</h1><p className="text-[10px] sm:text-sm text-slate-500 mt-0.5">Add products from the grid to your cart</p></div>
    <Card className="border-0 shadow-3d-card bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl"><CardContent className="p-3 sm:p-5 flex items-center gap-2 sm:gap-4"><div className="h-8 w-8 sm:h-12 sm:w-12 rounded-xl gradient-primary flex items-center justify-center shadow-blue-3d shrink-0"><ShoppingCart className="h-4 w-4 sm:h-6 sm:w-6 text-white" /></div><div><p className="text-[10px] sm:text-sm font-semibold text-blue-900">Add products from the grid</p><p className="text-[9px] sm:text-xs text-blue-600 mt-0.5">Click &quot;Add&quot; on any product to build your cart</p></div></CardContent></Card>
    <div className="grid grid-cols-2 gap-2 sm:gap-3"><Card className="border-0 shadow-3d-card rounded-xl"><CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3"><div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0"><TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-emerald-600" /></div><div><p className="text-[8px] sm:text-xs text-slate-500">Today</p><p className="text-sm sm:text-lg font-bold text-slate-900 tabular-nums">{rs(data?.todayRevenue || 0)}</p></div></CardContent></Card><Card className="border-0 shadow-3d-card rounded-xl"><CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3"><div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><ShoppingBag className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-blue-600" /></div><div><p className="text-[8px] sm:text-xs text-slate-500">Sales</p><p className="text-sm sm:text-lg font-bold text-slate-900 tabular-nums">{data?.todayCount || 0}</p></div></CardContent></Card></div>
  </div>
}

