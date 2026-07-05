'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Search, Bell, ShoppingCart, LayoutGrid,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCartStore, useNavStore } from '@/lib/store'
import { useRealTime, useElectronBridge } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { rs, mainNav, sideMenuSections, moreSections, LiveClock, Logo, CartSidebar } from './_shared'

// ─── Code-split route pages ───
// Each page only loads its JS when the user actually navigates to it,
// instead of all 17 pages being bundled into one client component.
function PageSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 w-40 bg-slate-200 rounded-md" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl" />
    </div>
  )
}

const DashboardPage = dynamic(() => import('./_pages/DashboardPage'), { loading: PageSkeleton })
const ProductsPage = dynamic(() => import('./_pages/ProductsPage'), { loading: PageSkeleton })
const SalesPage = dynamic(() => import('./_pages/SalesPage'), { loading: PageSkeleton })
const HistoryPage = dynamic(() => import('./_pages/HistoryPage'), { loading: PageSkeleton })
const CustomersPage = dynamic(() => import('./_pages/CustomersPage'), { loading: PageSkeleton })
const SuppliersPage = dynamic(() => import('./_pages/SuppliersPage'), { loading: PageSkeleton })
const ReportsPage = dynamic(() => import('./_pages/ReportsPage'), { loading: PageSkeleton })
const UsersPage = dynamic(() => import('./_pages/UsersPage'), { loading: PageSkeleton })
const PurchasesPage = dynamic(() => import('./_pages/PurchasesPage'), { loading: PageSkeleton })
const EstimatesPage = dynamic(() => import('./_pages/EstimatesPage'), { loading: PageSkeleton })
const OrdersPage = dynamic(() => import('./_pages/OrdersPage'), { loading: PageSkeleton })
const ExpensesPage = dynamic(() => import('./_pages/ExpensesPage'), { loading: PageSkeleton })
const MoneyInPage = dynamic(() => import('./_pages/MoneyInPage'), { loading: PageSkeleton })
const MoneyOutPage = dynamic(() => import('./_pages/MoneyOutPage'), { loading: PageSkeleton })
const KotPage = dynamic(() => import('./_pages/KotPage'), { loading: PageSkeleton })
const SettingsPage = dynamic(() => import('./_pages/SettingsPage'), { loading: PageSkeleton })
const BackupPage = dynamic(() => import('./_pages/BackupPage'), { loading: PageSkeleton })

// ─── More Menu (Grid Section System) ───
function MoreMenu() {
  const nav = useNavStore()

  return (
    <Dialog open={nav.moreMenuOpen} onOpenChange={nav.setMoreMenuOpen}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden max-h-[85vh]">
        <div className="gradient-primary p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><LayoutGrid className="h-5 w-5" /><h2 className="font-bold text-sm sm:text-base">More Options</h2></div>
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 h-7 w-7 p-0" onClick={() => nav.setMoreMenuOpen(false)}><X className="h-4 w-4" /></Button>
          </div>
          <p className="text-[10px] sm:text-[11px] text-blue-200 mt-1">Manage your business</p>
        </div>
        <ScrollArea className="max-h-[65vh]">
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-5">
            {moreSections.map(section => (
              <div key={section.title}>
                <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 sm:mb-2.5">{section.title}</p>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {section.items.map(item => (
                    <motion.button key={item.id} whileTap={{ scale: 0.95 }} onClick={() => nav.setCurrentPage(item.id)}
                      className={`flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-xl transition-all duration-200 text-left card-3d-inner nav-item-3d nav-item-3d-light ${nav.currentPage === item.id ? 'bg-blue-50 border-2 border-blue-200 shadow-blue-3d' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:shadow-depth'}`}>
                      <div className={`${item.color} p-1.5 sm:p-2 rounded-lg shrink-0`}><item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></div>
                      <div className="min-w-0"><p className="text-[10px] sm:text-xs font-semibold text-slate-900 truncate">{item.label}</p><p className="text-[8px] sm:text-[9px] text-slate-400">{item.desc}</p></div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

// ─── Mobile Cart Drawer ───
function MobileCartDrawer() {
  const cart = useCartStore()
  const [isOpen, setIsOpen] = useState(false)
  const gt = cart.getGrandTotal()
  const cnt = cart.items.length
  return (
    <>
      <AnimatePresence>{cnt > 0 && !isOpen && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-[52px] left-2 right-2 z-50 lg:hidden">
          <Button className="w-full gradient-primary shadow-blue-3d h-10 sm:h-12 text-xs sm:text-base font-semibold justify-between px-3 sm:px-4 rounded-xl" onClick={() => setIsOpen(true)}>
            <span className="flex items-center gap-1.5"><ShoppingCart className="h-3.5 w-3.5 sm:h-5 sm:w-5" />{cnt} Items</span>
            <span className="tabular-nums">{rs(gt)}</span>
          </Button>
        </motion.div>
      )}</AnimatePresence>
      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="max-w-lg h-[90vh] flex flex-col p-0"><CartSidebar /></DialogContent></Dialog>
    </>
  )
}

// ─── Side Drawer Menu (Ezo-style) ───
function SideDrawerMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavStore()
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-[300px] h-full max-h-[100vh] rounded-none left-0 top-0 translate-x-0 translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-200 sm:max-w-[300px]">
        <div className="gradient-sidebar h-full flex flex-col text-white">
          <div className="p-4 flex items-center gap-3">
            <Logo size="md" />
            <div className="flex-1"><h1 className="text-base font-bold tracking-tight">SmartBill</h1><p className="text-[9px] text-slate-500 tracking-wider">BILLING APP</p></div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white h-7 w-7 p-0"><X className="h-4 w-4" /></Button>
          </div>
          <div className="h-px bg-white/10 mx-2" />
          <ScrollArea className="flex-1 dark-scrollbar">
            <nav className="p-2 space-y-0.5 card-3d">
              {sideMenuSections.map((section, si) => (
                <div key={section.title}>
                  {si > 0 && <Separator className="bg-white/10 my-2" />}
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest px-2.5 py-1.5">{section.title}</p>
                  {section.items.map((item) => (
                    <motion.button key={item.id} whileTap={{ scale: 0.96 }} onClick={() => { nav.setCurrentPage(item.id); onClose() }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-medium transition-all duration-200 nav-item-3d ${nav.currentPage === item.id ? 'gradient-primary text-white shadow-blue-3d nav-item-3d-active' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                      <item.icon className="h-[17px] w-[17px] shrink-0" />
                      <span>{item.label}</span>
                      {nav.currentPage === item.id && <motion.div layoutId="dNav" className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
                    </motion.button>
                  ))}
                </div>
              ))}
            </nav>
          </ScrollArea>
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="gradient-primary h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-bold shadow-blue-3d shrink-0">A</div>
              <div className="min-w-0"><p className="text-xs font-medium truncate">Admin</p><p className="text-[9px] text-slate-500 truncate">admin@smartbill.com</p></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main App ───
export default function SmartBillApp() {
  const nav = useNavStore()
  const rt = useRealTime()
  const { isElectron } = useElectronBridge()
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false)

  // ─── Electron IPC / Keyboard Shortcut Navigation ───
  useEffect(() => {
    const handleNavigate = (e: Event) => { const page = (e as CustomEvent).detail; if (page) nav.setCurrentPage(page as any) }
    const handleFocusSearch = () => { const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement; searchInput?.focus() }
    const handlePrintBill = () => { window.print() }
    const handleKotAlert = (e: Event) => { const data = (e as CustomEvent).detail; toast.warning(`KOT Ready: ${data.kotNumber} - Table ${data.tableNumber}`, { icon: '🔔' }) }
    window.addEventListener('smartbill:navigate', handleNavigate)
    window.addEventListener('smartbill:focus-search', handleFocusSearch)
    window.addEventListener('smartbill:print-bill', handlePrintBill)
    window.addEventListener('smartbill:kot-alert', handleKotAlert)
    return () => { window.removeEventListener('smartbill:navigate', handleNavigate); window.removeEventListener('smartbill:focus-search', handleFocusSearch); window.removeEventListener('smartbill:print-bill', handlePrintBill); window.removeEventListener('smartbill:kot-alert', handleKotAlert) }
  }, [nav])

  useEffect(() => {
    const c = () => {
      const w = window.innerWidth
      setIsMobile(w < 640)
      setIsTablet(w >= 640 && w < 1024)
    }
    c()
    window.addEventListener('resize', c)
    return () => window.removeEventListener('resize', c)
  }, [])

  const [seeded, setSeeded] = useState(false)
  useEffect(() => { if (!seeded) { fetch('/api/seed', { method: 'POST' }).then(() => setSeeded(true)).catch(() => setSeeded(true)) } }, [seeded])

  const renderPage = () => {
    switch (nav.currentPage) {
      case 'dashboard': return <DashboardPage />; case 'products': return <ProductsPage />; case 'sales': return <SalesPage />; case 'history': return <HistoryPage />
      case 'customers': return <CustomersPage />; case 'suppliers': return <SuppliersPage />; case 'reports': return <ReportsPage />; case 'users': return <UsersPage />
      case 'purchases': return <PurchasesPage />; case 'estimates': return <EstimatesPage />; case 'orders': return <OrdersPage />; case 'expenses': return <ExpensesPage />
      case 'moneyin': return <MoneyInPage />; case 'moneyout': return <MoneyOutPage />; case 'kot': return <KotPage />
      case 'settings': return <SettingsPage />; case 'backup': return <BackupPage />; default: return <DashboardPage />
    }
  }

  const showCart = (nav.currentPage === 'products' || nav.currentPage === 'sales') && !isMobile

  // Get current page label for header
  const currentPageLabel = sideMenuSections.flatMap(s => s.items).find(i => i.id === nav.currentPage)?.label || 'Dashboard'

  return (
    <div className="h-screen flex bg-slate-50/80 overflow-hidden">
      {/* Desktop + Tablet Sidebar */}
      {!isMobile && (
        <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`${isTablet ? 'w-[62px]' : 'w-[220px] xl:w-[240px]'} gradient-sidebar text-white flex flex-col shrink-0 shadow-2xl transition-all duration-300`}>
          <div className={`p-3 flex items-center ${isTablet ? 'justify-center' : 'gap-2.5'}`}>
            <Logo size={isTablet ? 'sm' : 'md'} />
            {!isTablet && <div><h1 className="text-sm font-bold tracking-tight">SmartBill</h1><p className="text-[8px] text-slate-500 tracking-wider">BILLING APP</p></div>}
          </div>
          <div className="h-px bg-white/10 mx-2" />
          <ScrollArea className="flex-1 dark-scrollbar">
            <nav className="p-1.5 space-y-0.5 card-3d">
              {sideMenuSections.map((section, si) => (
                <div key={section.title}>
                  {si > 0 && <Separator className="bg-white/10 my-1.5" />}
                  {!isTablet && <p className="text-[8px] font-semibold text-slate-600 uppercase tracking-widest px-2 py-1">{section.title}</p>}
                  {section.items.map((item, i) => (
                    <motion.button key={item.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} whileTap={{ scale: 0.96 }} transition={{ delay: i * 0.02 }} onClick={() => nav.setCurrentPage(item.id)}
                      className={`w-full flex items-center ${isTablet ? 'justify-center' : 'gap-2'} px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 nav-item-3d ${nav.currentPage === item.id ? 'gradient-primary text-white shadow-blue-3d nav-item-3d-active' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                      <item.icon className="h-[16px] w-[16px] shrink-0" />
                      {!isTablet && <span>{item.label}</span>}
                      {!isTablet && nav.currentPage === item.id && <motion.div layoutId="aNav" className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
                    </motion.button>
                  ))}
                </div>
              ))}
            </nav>
          </ScrollArea>
          <div className="p-2 border-t border-white/10">
            <div className={`flex items-center ${isTablet ? 'justify-center' : 'gap-2'}`}>
              <div className="gradient-primary h-7 w-7 rounded-lg flex items-center justify-center text-[9px] font-bold shadow-blue-3d shrink-0">A</div>
              {!isTablet && <div className="min-w-0"><p className="text-[10px] font-medium truncate">Admin</p><p className="text-[8px] text-slate-500 truncate">admin@smartbill.com</p></div>}
            </div>
          </div>
        </motion.aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-11 sm:h-14 glass border-b border-slate-200/50 flex items-center justify-between px-2 sm:px-4 shrink-0 z-20">
          <div className="flex items-center gap-1.5 sm:gap-3">
            {isMobile && <><Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSideDrawerOpen(true)}><Menu className="h-4 w-4 text-slate-600" /></Button><Logo size="sm" /><h1 className="font-bold text-slate-900 tracking-tight text-sm">SmartBill</h1></>}
            {!isMobile && <div className="flex items-center gap-2"><Badge variant="outline" className="text-[9px] sm:text-[11px] px-2 py-0.5 font-medium bg-white">{currentPageLabel}</Badge><LiveClock />{/* Real-Time Status */}<TooltipProvider><Tooltip><TooltipTrigger asChild><div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-white border border-slate-200/60 cursor-default"><span className={`h-1.5 w-1.5 rounded-full ${rt.connected ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-red-400 ring-2 ring-red-400/20'} animate-pulse`} />{rt.connected ? 'LIVE' : 'OFF'}</div></TooltipTrigger><TooltipContent>{rt.connected ? `Real-time connected${rt.latency ? ` (${rt.latency}ms)` : ''}` : 'Real-time disconnected'}</TooltipContent></Tooltip></TooltipProvider>{isElectron && <Badge className="text-[8px] px-1.5 py-0 bg-violet-100 text-violet-700 border-violet-200">Desktop</Badge>}</div>}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {isMobile && <div className="relative flex-1 max-w-[120px] sm:max-w-[180px]"><Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" /><Input className="pl-7 h-7 text-[10px] bg-white/80" placeholder="Search..." /></div>}
            {!isMobile && <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 relative"><Bell className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500" /><span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500 ring-pulse" /></Button></TooltipTrigger><TooltipContent>No notifications</TooltipContent></Tooltip></TooltipProvider>}
          </div>
        </header>

        {/* Content + Cart Split */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 pb-16 sm:pb-6 scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div key={nav.currentPage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}>
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>
          {showCart && <div className={`${isTablet ? 'w-[260px]' : 'w-[330px]'} shrink-0 hidden sm:block`}><CartSidebar /></div>}
        </div>

        {/* Mobile Bottom Nav (4 items + More) */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-slate-200/50 flex items-center justify-around h-[50px] z-40 safe-area-bottom card-3d">
            {mainNav.map((item) => (
              <motion.button key={item.id} whileTap={{ scale: 0.88 }} onClick={() => nav.setCurrentPage(item.id)} className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200 nav-item-3d nav-item-3d-light ${nav.currentPage === item.id ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className="relative"><item.icon className="h-[17px] w-[17px]" />{nav.currentPage === item.id && <motion.div layoutId="mN" className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3.5 h-[2px] rounded-full bg-blue-600" />}</div>
                <span className="text-[7px] mt-0.5 font-medium">{item.label}</span>
              </motion.button>
            ))}
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => nav.setMoreMenuOpen(true)} className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors nav-item-3d nav-item-3d-light ${moreSections.flatMap(s => s.items).some(i => i.id === nav.currentPage) ? 'text-blue-600' : 'text-slate-400'}`}>
              <LayoutGrid className="h-[17px] w-[17px]" /><span className="text-[7px] mt-0.5 font-medium">More</span>
            </motion.button>
          </nav>
        )}
      </div>

      <MobileCartDrawer />
      <MoreMenu />
      {isMobile && <SideDrawerMenu open={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />}
    </div>
  )
}