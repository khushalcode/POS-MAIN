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
export default function SettingsPage() {
  const { data: settings, isLoading } = useShopSettings()
  const qc = useQueryClient()
  const [init, setInit] = useState(false)
  const [f, setF] = useState({ shopName: '', address: '', phone: '', email: '', taxRate: '5', currency: 'Rs.', invoicePrefix: 'INV' })
  const [disc1On, setDisc1On] = useState(true)
  const [disc2On, setDisc2On] = useState(false)
  if (settings && !init) { setInit(true); setF({ shopName: settings.shopName || '', address: settings.address || '', phone: settings.phone || '', email: settings.email || '', taxRate: String(settings.taxRate || 5), currency: settings.currency || 'Rs.', invoicePrefix: settings.invoicePrefix || 'INV' }) }
  const saveMut = useMutation({ mutationFn: async () => { const r = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) }); if (!r.ok) throw new Error(); return r.json() }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved!', { icon: '✅' }) } })
  if (isLoading) return <div className="space-y-4"><div className="h-8 shimmer rounded w-40" /><div className="h-80 shimmer rounded" /></div>

  return <div className="space-y-4 sm:space-y-5"><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>

    {/* Current Profile */}
    <Card className="border-0 shadow-3d-card rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-blue-3d">{f.shopName ? f.shopName[0].toUpperCase() : 'S'}</div>
          <div><p className="font-semibold text-slate-900 text-sm sm:text-base">{f.shopName || 'SmartBill'}</p><p className="text-[10px] sm:text-xs text-slate-400">{f.phone || '+91 XXXXX XXXXX'}</p></div>
        </div>
        <Badge variant="outline" className="text-[8px] sm:text-[10px] px-2 bg-blue-50 text-blue-700 border-blue-200">Free Plan</Badge>
      </CardContent>
    </Card>

    {/* Shop Details */}
    <SettingsSection title="Shop Details" icon={Store} color="text-blue-600 bg-blue-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label className="text-xs">Shop Name</Label><Input value={f.shopName} onChange={(e) => setF({ ...f, shopName: e.target.value })} className="h-8 sm:h-9 text-xs sm:text-sm" /></div>
        <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="h-8 sm:h-9 text-xs sm:text-sm" /></div>
        <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="h-8 sm:h-9 text-xs sm:text-sm" /></div>
        <div className="space-y-1.5"><Label className="text-xs">Address</Label><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className="h-8 sm:h-9 text-xs sm:text-sm" /></div>
      </div>
    </SettingsSection>

    {/* Bill Settings - Full Ezo 2.1-2.33 */}
    <SettingsSection title="Bill Settings" icon={Receipt} color="text-emerald-600 bg-emerald-50">
      {/* 2.1 Item Selector Style */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Grid3X3 className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Item Selector Style</p><p className="text-[10px] sm:text-xs text-slate-400">2.1 - How items appear when billing</p></div></div>
        <Select defaultValue="grid"><SelectTrigger className="w-28 sm:w-36 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="list">List</SelectItem><SelectItem value="grid">Restaurant w/ Image</SelectItem><SelectItem value="restaurant">Restaurant</SelectItem><SelectItem value="clothing">Clothing Store</SelectItem></SelectContent></Select>
      </div>
      {/* 2.2 Barcode Scanner */}
      <SettingToggle label="Item Barcode Scanner" desc="2.2 - Scan barcodes to add items to bill" defaultOn={true} icon={ScanLine} />
      {/* 2.3 Calculator Billing */}
      <SettingToggle label="Calculator Billing for Retail" desc="2.3 - Quick calculator-style billing" defaultOn={false} icon={Calculator} />
      {/* 2.4 Cash Sale by Default */}
      <SettingToggle label="Cash Sale by Default" desc="2.4 - Skip customer/party for new bills" defaultOn={true} icon={Calculator} />
      {/* 2.5 Amount Received by Default */}
      <SettingToggle label="Amount Received by Default" desc="2.5 - Auto-fill payment as received" defaultOn={true} icon={Check} />
      {/* 2.6 Next Bill after Save */}
      <SettingToggle label="Next Bill after Save" desc="2.6 - Auto-reset for next bill after saving" defaultOn={true} icon={Zap} />
      {/* 2.10 Sort by Item Code */}
      <SettingToggle label="Sort by Item Code" desc="2.10 - Sort items by code in selector" defaultOn={false} icon={List} />
      {/* 2.12 Show Bookmark List */}
      <SettingToggle label="Show Bookmark List" desc="2.12 - Show categories on left side for quick selection" defaultOn={true} icon={BookOpen} />
      {/* 2.13 Sell Price Lock */}
      <SettingToggle label="Sell Price Lock" desc="2.13 - Prevent changing price during billing" defaultOn={false} icon={Lock} />
      {/* 2.14 Negative Stock Lock */}
      <SettingToggle label="Negative Stock Lock" desc="2.14 - Block selling zero/negative stock items" defaultOn={true} icon={Shield} />
      {/* 2.17 Restaurant Columns */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Columns3 className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Restaurant Item Columns</p><p className="text-[10px] sm:text-xs text-slate-400">2.17 - Number of columns in item grid</p></div></div>
        <Select defaultValue="3"><SelectTrigger className="w-16 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem><SelectItem value="5">5</SelectItem></SelectContent></Select>
      </div>
      {/* 2.18 Barcode Scanner Speed */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><ScanLine className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Barcode Scanner Speed</p><p className="text-[10px] sm:text-xs text-slate-400">2.18 - Scan speed setting</p></div></div>
        <Select defaultValue="fast"><SelectTrigger className="w-20 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fast">Fast</SelectItem><SelectItem value="normal">Normal</SelectItem></SelectContent></Select>
      </div>
      {/* 2.20 Item Category List Width */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Columns3 className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Category List Width</p><p className="text-[10px] sm:text-xs text-slate-400">2.20 - Width of category sidebar</p></div></div>
        <Select defaultValue="20"><SelectTrigger className="w-20 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15%</SelectItem><SelectItem value="20">20%</SelectItem><SelectItem value="25">25%</SelectItem><SelectItem value="30">30%</SelectItem></SelectContent></Select>
      </div>
      {/* 2.21 Multiple Price Options */}
      <SettingToggle label="Item Price - Multiple Options" desc="2.21 - Allow multiple price tiers per item" defaultOn={false} icon={Tag} />
      {/* 2.22 Alpha Numeric Barcodes */}
      <SettingToggle label="Alpha Numeric Barcodes" desc="2.22 - Support letters+numbers in barcodes" defaultOn={false} icon={ScanLine} />
      {/* 2.23 Round Off Total */}
      <SettingToggle label="Round Off Total Amount" desc="2.23 - Round bill total to nearest whole number" defaultOn={true} icon={Calculator} />
      {/* 2.24 Always Show Previous Balance */}
      <SettingToggle label="Always Show Previous Balance" desc="2.24 - Display customer past due balance" defaultOn={true} icon={Eye} />
      {/* 2.25 Service Charge */}
      <SettingToggle label="Service Charge (%)" desc="2.25 - Add a service charge percentage to bills" defaultOn={false} icon={Percent} />
      {/* 2.26 Party Wise Item Price */}
      <SettingToggle label="Party Wise Item Price" desc="2.26 - Different prices per customer/party" defaultOn={false} icon={Users} />
      {/* 2.27 Hide Out of Stock */}
      <SettingToggle label="Hide Out of Stock Items" desc="2.27 - Hide zero-stock items from selector" defaultOn={false} icon={EyeOff} />
      {/* 2.28 Bill Quick Save */}
      <SettingToggle label="Bill Quick Save" desc="2.28 - Faster save with fewer confirmations" defaultOn={false} icon={Zap} />
      {/* 2.29 Show Current Stock in Bill */}
      <SettingToggle label="Show Current Stock in Bill" desc="2.29 - Display stock quantity while billing" defaultOn={false} icon={Package} />
      {/* 2.30 Abbreviation Match */}
      <SettingToggle label="Abbreviation Match" desc="2.30 - Search items using abbreviations" defaultOn={false} icon={Keyboard} />
      {/* 2.31 Select Item Filter Priority */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Search className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Item Filter Priority</p><p className="text-[10px] sm:text-xs text-slate-400">2.31 - Search matching method</p></div></div>
        <Select defaultValue="contains"><SelectTrigger className="w-28 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="starts">Starts With</SelectItem><SelectItem value="contains">Contains In</SelectItem></SelectContent></Select>
      </div>
      {/* 2.32 Restrict Payment Mode */}
      <SettingToggle label="Restrict Payment Mode" desc="2.32 - Lock payment mode on dashboard" defaultOn={false} icon={Lock} />
      {/* 2.33 Get Item Details from Barcode */}
      <SettingToggle label="Get Item Details from Barcode" desc="2.33 - Fetch item info locally when scanning" defaultOn={false} icon={ScanLine} />
    </SettingsSection>

    {/* Printer Settings - Full Ezo 3.x-5.x */}
    <SettingsSection title="Printer Settings" icon={Printer} color="text-violet-600 bg-violet-50">
      <p className="text-[9px] text-slate-400 px-1 -mt-1 mb-1">3.x Primary &middot; 4.x Secondary &middot; 5.x Print Settings</p>
      {/* 3.1 Primary Printer */}
      <SettingToggle label="Primary Printer" desc="3.1 - Enable printer for Bill & KOT" defaultOn={true} icon={Printer} />
      {/* 3.2 Printer Type */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Bluetooth className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Printer Type</p><p className="text-[10px] sm:text-xs text-slate-400">3.2 - 80% Ezo machines use Bluetooth</p></div></div>
        <Select defaultValue="bluetooth"><SelectTrigger className="w-28 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bluetooth">Bluetooth</SelectItem><SelectItem value="usb">USB</SelectItem></SelectContent></Select>
      </div>
      {/* 3.3-3.6 Characters Per Line */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Type className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Characters Per Line</p><p className="text-[10px] sm:text-xs text-slate-400">3.3 - Print layout width</p></div></div>
        <Select defaultValue="32"><SelectTrigger className="w-20 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="32">32</SelectItem><SelectItem value="40">40</SelectItem><SelectItem value="48">48</SelectItem></SelectContent></Select>
      </div>
      {/* 3.7 Dots Per Line */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><HardDrive className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Dots Per Line</p><p className="text-[10px] sm:text-xs text-slate-400">3.7 - Printer resolution</p></div></div>
        <Select defaultValue="384"><SelectTrigger className="w-20 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="384">384</SelectItem><SelectItem value="576">576</SelectItem></SelectContent></Select>
      </div>
      {/* 4.1 Secondary Printer */}
      <SettingToggle label="Secondary Printer" desc="4.1 - Second printer for KOT in kitchen" defaultOn={false} icon={Printer} />
      {/* 5.1 Auto Print Sale */}
      <SettingToggle label="Auto Print Sale" desc="5.1 - Automatically print bill after saving" defaultOn={true} icon={Zap} />
      {/* 5.2 Print Logo */}
      <SettingToggle label="Print Logo on Bill" desc="5.2 - Show business logo on receipt" defaultOn={false} icon={Image} />
      {/* 5.2.1 Logo Size */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Image className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Logo Size</p><p className="text-[10px] sm:text-xs text-slate-400">5.2.1 - Logo dimensions on bill</p></div></div>
        <Select defaultValue="medium"><SelectTrigger className="w-24 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select>
      </div>
      {/* 5.3 Print UPI QR */}
      <SettingToggle label="Print UPI QR on Bill" desc="5.3 - Display UPI payment QR code" defaultOn={true} icon={QrCode} />
      {/* 5.3.2 QR Size */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><QrCode className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">QR Size</p><p className="text-[10px] sm:text-xs text-slate-400">5.3.2 - QR code dimensions</p></div></div>
        <Select defaultValue="medium"><SelectTrigger className="w-24 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select>
      </div>
      {/* 5.3.1 Always Print UPI QR */}
      <SettingToggle label="Always Print UPI QR" desc="5.3.1 - Show QR even if already paid" defaultOn={false} icon={QrCode} />
      {/* 5.4 Bill Printing Customization */}
      <p className="text-[9px] text-slate-400 px-1 mt-1">5.4 - Bill Printing Customization</p>
      <SettingToggle label="Print Token No." desc="5.4.1 - Print token number on bill" defaultOn={false} icon={Tag} />
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Type className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Business Name Size</p><p className="text-[10px] sm:text-xs text-slate-400">5.4.2 - Font size on bill</p></div></div>
        <Select defaultValue="large"><SelectTrigger className="w-24 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select>
      </div>
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Type className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Total Amount Size</p><p className="text-[10px] sm:text-xs text-slate-400">5.4.3 - Font size of total</p></div></div>
        <Select defaultValue="large"><SelectTrigger className="w-24 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select>
      </div>
      <SettingToggle label="Google Review QR on Bill" desc="5.4.6 - Print Google review QR" defaultOn={false} icon={Star} />
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Tag className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">GST Print Format</p><p className="text-[10px] sm:text-xs text-slate-400">5.4.8 - How GST appears</p></div></div>
        <Select defaultValue="both"><SelectTrigger className="w-24 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="both">Both</SelectItem><SelectItem value="summary">Summary Only</SelectItem><SelectItem value="item">Item Wise</SelectItem></SelectContent></Select>
      </div>
      {/* 5.5 Print TAX, MRP, HSN */}
      <SettingToggle label="Print TAX, MRP, HSN" desc="5.5 - Show tax/MRP/HSN codes on bill" defaultOn={true} icon={Tag} />
      {/* 5.6 Print Regional Languages */}
      <SettingToggle label="Print Regional Languages" desc="5.6 - Hindi, Marathi, Gujarati support" defaultOn={false} icon={Globe} />
      {/* 5.7 Regional Language Font Size */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Globe className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Regional Font Size</p><p className="text-[10px] sm:text-xs text-slate-400">5.7 - Regional language size</p></div></div>
        <Select defaultValue="medium"><SelectTrigger className="w-24 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="small">Small</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="large">Large</SelectItem></SelectContent></Select>
      </div>
      {/* 5.8 PDF Font Size */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><FileText className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">PDF Font Size</p><p className="text-[10px] sm:text-xs text-slate-400">5.8 - Font size in PDF bills</p></div></div>
        <Select defaultValue="10"><SelectTrigger className="w-20 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="8">8px</SelectItem><SelectItem value="10">10px</SelectItem><SelectItem value="12">12px</SelectItem><SelectItem value="14">14px</SelectItem></SelectContent></Select>
      </div>
      {/* 5.9 Print Footer */}
      <SettingToggle label="Print Footer" desc="5.9 - Custom text at bottom of bill" defaultOn={true} icon={Type} />
      <div className="pl-1"><Label className="text-[9px] text-slate-400">Footer Text</Label><Input defaultValue="Thank You! Visit Again!" className="h-7 sm:h-8 text-[9px] sm:text-xs mt-0.5" /></div>
      {/* 5.10 Printer Spacing Fix */}
      <SettingToggle label="Printer Spacing Fix" desc="5.10 - Remove extra blank lines" defaultOn={false} icon={Rows3} />
      {/* 5.11 Bottom Padding Lines */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Rows3 className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Bottom Padding Lines</p><p className="text-[10px] sm:text-xs text-slate-400">5.11 - Blank lines at bottom (0-10)</p></div></div>
        <Select defaultValue="3"><SelectTrigger className="w-16 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent>{[0,1,2,3,4,5,6,7,8,9,10].map(n=><SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent></Select>
      </div>
      {/* 5.12 Print Item Multi Line */}
      <SettingToggle label="Print Item Multi Line" desc="5.12 - Allow long names to wrap" defaultOn={true} icon={Rows3} />
      {/* 5.13 Print Bill in Parts */}
      <SettingToggle label="Print Bill in Parts" desc="5.13 - Split long bills across prints" defaultOn={false} icon={FileDown} />
      {/* 5.14 Print Bill Created Info */}
      <SettingToggle label="Print Bill Created Info" desc="5.14 - Show who/when created bill" defaultOn={false} icon={Clock} />
      {/* 5.15 Item Order in Bill */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><List className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Item Order in Bill</p><p className="text-[10px] sm:text-xs text-slate-400">5.15 - How items are sorted</p></div></div>
        <Select defaultValue="alpha"><SelectTrigger className="w-28 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="alpha">Alphabetical</SelectItem><SelectItem value="added">As Added</SelectItem><SelectItem value="price">By Price</SelectItem></SelectContent></Select>
      </div>
    </SettingsSection>

    {/* Discount Settings - Full Ezo Discount-1 & Discount-2 */}
    <SettingsSection title="Discount Settings" icon={Percent} color="text-amber-600 bg-amber-50">
      <p className="text-[9px] text-slate-400 px-1 -mt-1 mb-1">Discount-1 & Discount-2 with T&C</p>
      {/* Discount-1 */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-amber-50 shrink-0"><Percent className="h-3.5 w-3.5 text-amber-600" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Discount-1 Status</p><p className="text-[10px] sm:text-xs text-slate-400">Enable first discount rule</p></div></div>
        <button onClick={() => setDisc1On(!disc1On)} className={`relative h-6 w-11 rounded-full transition-all duration-200 shrink-0 ${disc1On ? 'bg-amber-500' : 'bg-slate-200'}`}><motion.div animate={{ x: disc1On ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm" /></button>
      </div>
      {disc1On && <div className="space-y-2.5 pl-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-0.5"><Label className="text-[9px] sm:text-[10px]">1.3 Discount Name</Label><Input defaultValue="Basic Discount" className="h-7 sm:h-8 text-[9px] sm:text-xs" /></div>
          <div className="space-y-0.5"><Label className="text-[9px] sm:text-[10px]">Discount Percent</Label><Input type="number" defaultValue="2" className="h-7 sm:h-8 text-[9px] sm:text-xs" /></div>
          <div className="space-y-0.5"><Label className="text-[9px] sm:text-[10px]">Max Amount (Rs.)</Label><Input type="number" defaultValue="20" className="h-7 sm:h-8 text-[9px] sm:text-xs" /></div>
          <div className="space-y-0.5"><Label className="text-[9px] sm:text-[10px]">Min Bill Amount (Rs.)</Label><Input type="number" defaultValue="1" className="h-7 sm:h-8 text-[9px] sm:text-xs" /></div>
        </div>
        <div className="flex items-center justify-between py-2.5 px-1"><div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Users className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Offer To</p><p className="text-[10px] sm:text-xs text-slate-400">1.2 - Repeat or All customers</p></div></div>
          <Select defaultValue="repeat"><SelectTrigger className="w-28 h-7 text-[9px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Customers</SelectItem><SelectItem value="repeat">Repeat Only</SelectItem></SelectContent></Select>
        </div>
        <div className="flex items-center justify-between py-2.5 px-1"><div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><CalendarDays className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Repeat Cycle</p><p className="text-[10px] sm:text-xs text-slate-400">Days to qualify as repeat</p></div></div>
          <Select defaultValue="365"><SelectTrigger className="w-24 h-7 text-[9px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">30 Days</SelectItem><SelectItem value="90">90 Days</SelectItem><SelectItem value="180">180 Days</SelectItem><SelectItem value="365">365 Days</SelectItem></SelectContent></Select>
        </div>
        <SettingToggle label="Print Discount T&C" desc="1.4 - Print terms on bill" defaultOn={true} icon={FileText} />
        {true && <Card className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-2.5"><p className="text-[8px] sm:text-[9px] text-amber-800 font-medium mb-1">T&C Preview:</p><p className="text-[7px] sm:text-[8px] text-amber-700 leading-relaxed">2% off on bill amount. Max discount Rs. 20.0. Min bill Rs. 1.0. Valid for repeat customers within 365 days.</p></Card>}
      </div>}
      <Separator className="my-2" />
      {/* Discount-2 */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-rose-50 shrink-0"><Percent className="h-3.5 w-3.5 text-rose-600" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Discount-2 Status</p><p className="text-[10px] sm:text-xs text-slate-400">Enable second discount rule</p></div></div>
        <button onClick={() => setDisc2On(!disc2On)} className={`relative h-6 w-11 rounded-full transition-all duration-200 shrink-0 ${disc2On ? 'bg-rose-500' : 'bg-slate-200'}`}><motion.div animate={{ x: disc2On ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm" /></button>
      </div>
      {disc2On && <div className="space-y-2.5 pl-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-0.5"><Label className="text-[9px] sm:text-[10px]">Discount Name</Label><Input defaultValue="Loyalty Discount" className="h-7 sm:h-8 text-[9px] sm:text-xs" /></div>
          <div className="space-y-0.5"><Label className="text-[9px] sm:text-[10px]">Discount Percent</Label><Input type="number" defaultValue="5" className="h-7 sm:h-8 text-[9px] sm:text-xs" /></div>
          <div className="space-y-1"><Label className="text-[9px] sm:text-[10px]">Max Amount (Rs.)</Label><Input type="number" defaultValue="100" className="h-7 sm:h-8 text-[9px] sm:text-xs" /></div>
          <div className="space-y-0.5"><Label className="text-[9px] sm:text-[10px]">Min Bill Amount (Rs.)</Label><Input type="number" defaultValue="500" className="h-7 sm:h-8 text-[9px] sm:text-xs" /></div>
        </div>
        <div className="flex items-center justify-between py-2.5 px-1"><div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Users className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Offer To</p></div></div>
          <Select defaultValue="all"><SelectTrigger className="w-28 h-7 text-[9px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Customers</SelectItem><SelectItem value="repeat">Repeat Only</SelectItem></SelectContent></Select>
        </div>
        <div className="flex items-center justify-between py-2.5 px-1"><div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><CalendarDays className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Repeat Cycle</p></div></div>
          <Select defaultValue="30"><SelectTrigger className="w-24 h-7 text-[9px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">30 Days</SelectItem><SelectItem value="90">90 Days</SelectItem><SelectItem value="180">180 Days</SelectItem><SelectItem value="365">365 Days</SelectItem></SelectContent></Select>
        </div>
        <SettingToggle label="Print Discount-2 T&C" desc="Print terms on bill" defaultOn={false} icon={FileText} />
      </div>}
    </SettingsSection>

    {/* Security Settings - Full Ezo 6.x */}
    <SettingsSection title="Security Settings" icon={Shield} color="text-red-600 bg-red-50">
      <SettingToggle label="Pin Access" desc="6.1 - Require PIN to edit/delete transactions" defaultOn={false} icon={Lock} />
      <SettingToggle label="Fixed Login OTP" desc="6.2 - Set static OTP for login instead of changing one" defaultOn={false} icon={Shield} />
    </SettingsSection>

    {/* App Settings - Full Ezo 7.x */}
    <SettingsSection title="App Settings" icon={Smartphone} color="text-sky-600 bg-sky-50">
      {/* 7.1 Horizontal View */}
      <SettingToggle label="Horizontal View" desc="7.1 - Landscape mode for 10 inch+ tablets" defaultOn={false} icon={Monitor} />
      {/* 7.3 Powered by Ezo */}
      <SettingToggle label="Powered by SmartBill" desc="7.3 - Show branding in app" defaultOn={true} icon={Star} />
      {/* 7.4 Domain */}
      <SettingToggle label="Custom Domain" desc="7.4 - Custom domain option" defaultOn={false} icon={Globe} />
      {/* 7.6 Bill Amount Sound */}
      <SettingToggle label="Bill Amount Sound" desc="7.6 - Sound announcing bill amount" defaultOn={true} icon={Volume2} />
      {/* 7.7 Pending KOT Sound */}
      <SettingToggle label="Pending KOT Sound" desc="7.7 - Alert for pending kitchen orders" defaultOn={true} icon={Volume2} />
      {/* 7.11 Printer Instructor Sound */}
      <SettingToggle label="Printer Instructor Sound" desc="7.11 - Audio feedback from printer" defaultOn={false} icon={Volume2} />
      {/* 7.12 Configure App Colors */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><Palette className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Configure App Colors</p><p className="text-[10px] sm:text-xs text-slate-400">7.12 - Customize app theme colors</p></div></div>
        <div className="flex gap-1"><div className="h-5 w-5 rounded-full bg-blue-600 cursor-pointer ring-2 ring-blue-200" /><div className="h-5 w-5 rounded-full bg-emerald-600 cursor-pointer" /><div className="h-5 w-5 rounded-full bg-violet-600 cursor-pointer" /><div className="h-5 w-5 rounded-full bg-rose-600 cursor-pointer" /><div className="h-5 w-5 rounded-full bg-amber-600 cursor-pointer" /></div>
      </div>
      {/* 7.13 Cut Off Day */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><CalendarDays className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Cut Off Day Status</p><p className="text-[10px] sm:text-xs text-slate-400">7.13 - Business day boundary</p></div></div>
        <Select defaultValue="midnight"><SelectTrigger className="w-28 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="midnight">Midnight</SelectItem><SelectItem value="5am">5:00 AM</SelectItem><SelectItem value="6am">6:00 AM</SelectItem></SelectContent></Select>
      </div>
      {/* 7.14 Discount Sound */}
      <SettingToggle label="Discount Sound" desc="7.14 - Sound when discount applied" defaultOn={false} icon={Volume2} />
      {/* 7.15 Item Selection Sound */}
      <SettingToggle label="Item Selection Sound" desc="7.15 - Sound when adding items" defaultOn={true} icon={Volume2} />
      {/* 7.16 Daily Email Report */}
      <SettingToggle label="Receive Daily Report on Email" desc="7.16 - Daily summary via email" defaultOn={false} icon={Mail} />
      {/* 7.17 Hourly Report */}
      <SettingToggle label="Business Report Notification (Hourly)" desc="7.17 - Push notification with hourly stats" defaultOn={false} icon={Bell} />
    </SettingsSection>

    {/* Other Settings - Full Ezo 8.x */}
    <SettingsSection title="Other Settings" icon={MessageSquare} color="text-green-600 bg-green-50">
      {/* 8.1 Send Bill to Party on WhatsApp */}
      <SettingToggle label="Send Bill to Party on WhatsApp" desc="8.1 - Auto-send bill to customer" defaultOn={true} icon={MessageSquare} />
      {/* 8.2 Send Bill to Owner on WhatsApp */}
      <SettingToggle label="Send Bill to Owner on WhatsApp" desc="8.2 - Send copy to owner" defaultOn={false} icon={MessageSquare} />
      {/* 8.3 Choose Days for Reminder */}
      <div className="flex items-center justify-between py-2.5 px-1">
        <div className="flex items-center gap-2.5 min-w-0"><div className="p-1.5 rounded-lg bg-slate-50 shrink-0"><CalendarDays className="h-3.5 w-3.5 text-slate-500" /></div><div><p className="text-xs sm:text-sm font-medium text-slate-900">Reminder Days</p><p className="text-[10px] sm:text-xs text-slate-400">8.3 - Follow-up reminder schedule</p></div></div>
        <Select defaultValue="deactivated"><SelectTrigger className="w-28 h-7 text-[10px] sm:text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="deactivated">Deactivated</SelectItem><SelectItem value="3">3 Days</SelectItem><SelectItem value="7">7 Days</SelectItem><SelectItem value="14">14 Days</SelectItem><SelectItem value="30">30 Days</SelectItem></SelectContent></Select>
      </div>
      {/* 8.4 Show Upcoming Birthday */}
      <SettingToggle label="Show Upcoming Birthday" desc="8.4 - Flag customers with upcoming birthdays" defaultOn={true} icon={Gift} />
    </SettingsSection>

    {/* Save Button */}
    <motion.div whileTap={{ scale: 0.98 }}><Button className="w-full sm:w-auto gradient-primary shadow-blue-3d h-10 sm:h-11 text-sm font-semibold rounded-xl" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>{saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save All Settings</Button></motion.div>
  </div>
}

