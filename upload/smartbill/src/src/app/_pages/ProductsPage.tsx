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
// ─── 3D Product Card ───
function ProductCard3D({ p, onAdd, onEdit, onDelete, justAdded }: { p: Product; onAdd: () => void; onEdit: () => void; onDelete: () => void; justAdded: boolean }) {
  const { style, onMove, onTouch, onLeave } = useTilt()
  return (
    <div className="card-3d" onMouseMove={onMove} onTouchMove={onTouch} onMouseLeave={onLeave} onTouchEnd={onLeave} style={{ ...style, transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease' }}>
      <Card className={`border border-slate-200/70 shadow-3d-card rounded-2xl overflow-hidden group ${justAdded ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}>
        <CardContent className="p-0">
          <div className="h-20 sm:h-28 bg-gradient-to-br from-slate-50 to-slate-100/80 flex items-center justify-center relative overflow-hidden">
            <span className="text-2xl sm:text-4xl drop-shadow-sm float-gentle">{getEmoji(p.name)}</span>
            <Badge className={`absolute top-1 right-1 text-[7px] sm:text-[10px] px-1 py-0 font-medium ${catColors[p.category] || catColors['General']}`}>{p.category}</Badge>
            <div className="absolute bottom-1 left-1"><Badge variant="outline" className={`text-[7px] px-1 py-0 h-3 sm:h-3.5 font-medium ${p.stock > 20 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : p.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{p.stock > 20 ? 'In Stock' : p.stock > 0 ? 'Low' : 'Out'}</Badge></div>
            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-0.5 sm:gap-1">
              <Button size="icon" variant="secondary" className="h-5 w-5 sm:h-6 sm:w-6 bg-white/90 backdrop-blur shadow-sm" onClick={(e) => { e.stopPropagation(); onEdit() }}><Edit className="h-2 w-2 sm:h-2.5 sm:w-2.5" /></Button>
              <Button size="icon" variant="secondary" className="h-5 w-5 sm:h-6 sm:w-6 bg-white/90 backdrop-blur shadow-sm text-red-500" onClick={(e) => { e.stopPropagation(); onDelete() }}><Trash className="h-2 w-2 sm:h-2.5 sm:w-2.5" /></Button>
            </div>
          </div>
          <div className="p-2 sm:p-3">
            <h3 className="font-semibold text-[11px] sm:text-[13px] text-slate-900 truncate">{p.name}</h3>
            <div className="flex items-center justify-between mt-1 sm:mt-2">
              <p className="text-[11px] sm:text-base font-bold text-blue-600">{rs(p.price)}<span className="text-[8px] sm:text-[11px] font-normal text-slate-400">/{p.unit}</span></p>
              <motion.div whileTap={{ scale: 0.85 }}>
                <Button size="sm" className={`h-6 sm:h-7 text-[9px] sm:text-xs px-1.5 sm:px-3 rounded-lg transition-all duration-200 ${justAdded ? 'bg-emerald-600 hover:bg-emerald-600 shadow-green-3d' : 'gradient-primary shadow-blue-3d'}`} onClick={onAdd} disabled={justAdded}>
                  {justAdded ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5 mr-0.5" />}{justAdded ? 'Done' : 'Add'}
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Products Page ───
export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editP, setEditP] = useState<Product | null>(null)
  const [delP, setDelP] = useState<Product | null>(null)
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const cart = useCartStore()
  const qc = useQueryClient()
  const { data: products, isLoading } = useProducts(search)

  const cMut = useMutation({ mutationFn: async (d: any) => { const r = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); if (!r.ok) throw new Error(); return r.json() }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setShowAdd(false); toast.success('Product added!', { icon: '✅' }) } })
  const uMut = useMutation({ mutationFn: async (d: any) => { const r = await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); if (!r.ok) throw new Error(); return r.json() }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setEditP(null); toast.success('Product updated!', { icon: '✅' }) } })
  const dMut = useMutation({ mutationFn: async (id: string) => { const r = await fetch(`/api/products?id=${id}`, { method: 'DELETE' }); if (!r.ok) throw new Error(); return r.json() }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDelP(null); toast.success('Deleted') } })

  const handleAdd = useCallback((p: Product) => {
    cart.addItem({ productId: p.id, name: p.name, unit: p.unit, price: p.price })
    setJustAdded(p.id)
    setTimeout(() => setJustAdded(null), 1000)
    toast.success(`${p.name} added`, { duration: 1200, icon: '🛒' })
  }, [cart])

  const activeFilters = [categoryFilter !== 'all' ? 1 : 0, stockFilter !== 'all' ? 1 : 0, search ? 1 : 0].reduce((a, b) => a + b, 0)
  const clearAllFilters = () => { setCategoryFilter('all'); setStockFilter('all'); setSearch(''); setSortBy('name') }

  const filteredProducts = products?.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
    if (stockFilter === 'instock' && p.stock <= 20) return false
    if (stockFilter === 'low' && (p.stock > 20 || p.stock === 0)) return false
    if (stockFilter === 'out' && p.stock > 0) return false
    return true
  }) || []

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'stock-low') return a.stock - b.stock
    if (sortBy === 'stock-high') return b.stock - a.stock
    if (sortBy === 'newest') return 0
    return 0
  })

  const categories = ['Grocery', 'Dairy', 'Personal Care', 'Household', 'General']

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div><h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Item List</h1><p className="text-[10px] sm:text-sm text-slate-500">{products?.length || 0} total · {sortedProducts.length} shown</p></div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative"><Search className="h-3 w-3 sm:h-3.5 sm:w-3.5 absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-7 sm:pl-8 w-28 sm:w-48 lg:w-64 h-7 sm:h-9 bg-white text-[10px] sm:text-sm" /></div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowFilters(!showFilters)}
            className={`h-7 sm:h-9 px-2 sm:px-3 rounded-lg border text-[10px] sm:text-xs font-medium flex items-center gap-1 transition-all ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <SlidersHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5" /><span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && <span className="bg-blue-600 text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center">{activeFilters}</span>}
          </motion.button>
          <div className="hidden sm:flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className={`h-6 w-6 p-0 ${viewMode === 'grid' ? 'gradient-primary' : ''}`} onClick={() => setViewMode('grid')}><Grid3X3 className="h-3 w-3" /></Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className={`h-6 w-6 p-0 ${viewMode === 'list' ? 'gradient-primary' : ''}`} onClick={() => setViewMode('list')}><List className="h-3 w-3" /></Button>
          </div>
          <SortSelect value={sortBy} onChange={setSortBy} options={[{ value: 'name', label: 'Name A-Z' }, { value: 'price-low', label: 'Price: Low-High' }, { value: 'price-high', label: 'Price: High-Low' }, { value: 'stock-low', label: 'Stock: Low-High' }, { value: 'stock-high', label: 'Stock: High-Low' }]} />
          <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogTrigger asChild><Button className="gradient-primary shadow-blue-3d gap-1 h-7 sm:h-9 text-[10px] sm:text-sm"><Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" /><span className="hidden sm:inline">Add</span> Item</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add Item</DialogTitle></DialogHeader><ProductForm onSubmit={(d) => cMut.mutate(d)} isLoading={cMut.isPending} /></DialogContent></Dialog>
        </div>
      </div>

      <AnimatePresence>{showFilters && (
        <FilterBar onClear={clearAllFilters} activeCount={activeFilters}>
          <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider mr-1 self-center">Category:</span>
          {[{ value: 'all', label: 'All', color: 'blue' as const }, ...categories.map(c => ({ value: c, label: c, color: (c === 'Grocery' ? 'amber' : c === 'Dairy' ? 'blue' : c === 'Personal Care' ? 'rose' : c === 'Household' ? 'emerald' : 'violet') as const }))].map(f =>
            <FilterChip key={f.value} label={f.label} active={categoryFilter === f.value} onClick={() => setCategoryFilter(categoryFilter === f.value ? 'all' : f.value)} color={f.color} />
          )}
          <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider ml-2 mr-1 self-center">Stock:</span>
          {[
            { value: 'all', label: 'All', color: 'blue' as const },
            { value: 'instock', label: 'In Stock', color: 'emerald' as const },
            { value: 'low', label: 'Low Stock', color: 'amber' as const },
            { value: 'out', label: 'Out of Stock', color: 'rose' as const },
          ].map(f => <FilterChip key={f.value} label={f.label} active={stockFilter === f.value} onClick={() => setStockFilter(stockFilter === f.value ? 'all' : f.value)} color={f.color} />)}
        </FilterBar>
      )}</AnimatePresence>

      {activeFilters > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {categoryFilter !== 'all' && <Badge variant="outline" className="text-[9px] gap-1 bg-amber-50 text-amber-700 border-amber-200"><Tag className="h-2.5 w-2.5" />{categoryFilter}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setCategoryFilter('all')} /></Badge>}
          {stockFilter !== 'all' && <Badge variant="outline" className={`text-[9px] gap-1 ${stockFilter === 'instock' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : stockFilter === 'low' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}><Package className="h-2.5 w-2.5" />{stockFilter === 'instock' ? 'In Stock' : stockFilter === 'low' ? 'Low' : 'Out'}<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setStockFilter('all')} /></Badge>}
          {search && <Badge variant="outline" className="text-[9px] gap-1 bg-violet-50 text-violet-700 border-violet-200"><Search className="h-2.5 w-2.5" />"{search}"<X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setSearch('')} /></Badge>}
        </div>
      )}

      {isLoading ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">{[1,2,3,4,5,6].map(i => <Card key={i} className="rounded-2xl"><CardContent className="p-0"><div className="h-20 shimmer" /><div className="p-2.5 space-y-1.5"><div className="h-3 shimmer rounded w-3/4" /><div className="h-5 shimmer rounded w-1/2" /></div></CardContent></Card>)}</div>
       : sortedProducts.length === 0 ? <Empty icon={Package} text={activeFilters > 0 ? "No items match your filters" : "No items found"} />
       : viewMode === 'list' ? (
        <div className="space-y-1.5 sm:space-y-2">
          {sortedProducts.map(p => (
            <Card key={p.id} className="border border-slate-200/70 shadow-3d-card hover:shadow-3d-card-hover transition-all duration-200 rounded-xl">
              <CardContent className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="text-lg sm:text-xl shrink-0">{getEmoji(p.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] sm:text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge className={`text-[7px] sm:text-[9px] px-1 py-0 font-medium ${catColors[p.category] || catColors['General']}`}>{p.category}</Badge>
                      <Badge variant="outline" className={`text-[7px] px-1 py-0 h-3 sm:h-3.5 font-medium ${p.stock > 20 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : p.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{p.stock > 20 ? `${p.stock} In Stock` : p.stock > 0 ? `${p.stock} Low` : 'Out'}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <p className="text-[11px] sm:text-base font-bold text-blue-600">{rs(p.price)}<span className="text-[8px] sm:text-[11px] font-normal text-slate-400">/{p.unit}</span></p>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="secondary" className="h-6 w-6 p-0" onClick={() => setEditP(p)}><Edit className="h-2.5 w-2.5" /></Button>
                    <Button size="sm" variant="secondary" className="h-6 w-6 p-0 text-red-500" onClick={() => setDelP(p)}><Trash className="h-2.5 w-2.5" /></Button>
                    <motion.div whileTap={{ scale: 0.85 }}><Button size="sm" className={`h-6 sm:h-7 text-[9px] sm:text-xs px-2 sm:px-3 rounded-lg ${justAdded === p.id ? 'bg-emerald-600 hover:bg-emerald-600 shadow-green-3d' : 'gradient-primary shadow-blue-3d'}`} onClick={() => handleAdd(p)} disabled={justAdded === p.id}>{justAdded === p.id ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}</Button></motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
       ) : <LayoutGroup><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3"><AnimatePresence mode="popLayout">{sortedProducts.map(p => <motion.div key={p.id} layout layoutId={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}><ProductCard3D p={p} onAdd={() => handleAdd(p)} onEdit={() => setEditP(p)} onDelete={() => setDelP(p)} justAdded={justAdded === p.id} /></motion.div>)}</AnimatePresence></div></LayoutGroup>
      }
      <Dialog open={!!editP} onOpenChange={() => setEditP(null)}><DialogContent><DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>{editP && <ProductForm product={editP} onSubmit={(d) => uMut.mutate({ ...d, id: editP.id })} isLoading={uMut.isPending} />}</DialogContent></Dialog>
      <Dialog open={!!delP} onOpenChange={() => setDelP(null)}><DialogContent><DialogHeader><DialogTitle>Delete</DialogTitle></DialogHeader><p>Delete <strong>{delP?.name}</strong>?</p><DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button variant="destructive" onClick={() => delP && dMut.mutate(delP.id)} disabled={dMut.isPending}>Delete</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

function ProductForm({ product, onSubmit, isLoading }: { product?: Product; onSubmit: (d: any) => void; isLoading: boolean }) {
  const [f, setF] = useState({ name: product?.name || '', category: product?.category || 'General', unit: product?.unit || 'Pcs', price: product?.price?.toString() || '', stock: product?.stock?.toString() || '0' })
  return (
    <div className="space-y-3">
      <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Basmati Rice" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label className="text-xs">Category</Label><Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Grocery">Grocery</SelectItem><SelectItem value="Dairy">Dairy</SelectItem><SelectItem value="Personal Care">Personal Care</SelectItem><SelectItem value="Household">Household</SelectItem><SelectItem value="General">General</SelectItem></SelectContent></Select></div>
        <div className="space-y-1.5"><Label className="text-xs">Unit</Label><Select value={f.unit} onValueChange={(v) => setF({ ...f, unit: v })}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pcs">Pcs</SelectItem><SelectItem value="Kg">Kg</SelectItem><SelectItem value="Ltr">Ltr</SelectItem><SelectItem value="250g">250g</SelectItem><SelectItem value="500g">500g</SelectItem></SelectContent></Select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label className="text-xs">Price (Rs.)</Label><Input type="number" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="0.00" /></div>
        <div className="space-y-1.5"><Label className="text-xs">Stock</Label><Input type="number" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} placeholder="0" /></div>
      </div>
      <Button className="w-full gradient-primary shadow-blue-3d h-10" onClick={() => onSubmit(f)} disabled={isLoading || !f.name || !f.price}>{isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{product ? 'Update' : 'Add Item'}</Button>
    </div>
  )
}

