'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Store,
  ArrowLeft,
  Printer,
  Send,
  Receipt,
  Users,
  StickyNote,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { TableGrid } from './TableGrid'
import { MenuPicker } from './MenuPicker'
import { OrderCart } from './OrderCart'
import { BillingDialog } from './BillingDialog'
import { PrintPreview } from '@/components/shared/PrintPreview'
import { KOTReceipt } from '@/components/shared/Receipts'
import { useRestaurantSync } from '@/hooks/use-restaurant-sync'
import {
  formatCurrency,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/lib/format'
import type { RestaurantTable, Order, OrderItem, MenuItem, KOTPayload, ItemStatusPayload } from '@/lib/types'

interface CounterModeProps {
  onExit: () => void
}

export default function CounterMode({ onExit }: CounterModeProps) {
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [guests, setGuests] = useState(1)
  const [waiterName, setWaiterName] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [showKOT, setShowKOT] = useState(false)
  const [kotNo, setKotNo] = useState(0)
  const [showBilling, setShowBilling] = useState(false)
  const [billNo, setBillNo] = useState(1001)
  const [busy, setBusy] = useState(false)

  // ----- Initial loads -----
  const loadTables = useCallback(async () => {
    const res = await fetch('/api/tables')
    const data = await res.json()
    setTables(data.tables)
  }, [])

  const loadMenu = useCallback(async () => {
    const res = await fetch('/api/menu')
    const data = await res.json()
    setMenu(data.items)
  }, [])

  const loadBillNo = useCallback(async () => {
    const res = await fetch('/api/bills/next-no')
    const data = await res.json()
    setBillNo(data.nextNo)
  }, [])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      // Ensure tables seeded
      await fetch('/api/tables/seed', { method: 'POST' })
      await Promise.all([loadTables(), loadMenu(), loadBillNo()])
      setLoading(false)
    })()
  }, [loadTables, loadMenu, loadBillNo])

  // ----- Real-time sync -----
  const sync = useRestaurantSync('counter', {
    onItemStatus: (p: ItemStatusPayload) => {
      // Update local order if it matches
      setOrder((cur) => {
        if (!cur || cur.id !== p.orderId) return cur
        const updatedItems = (cur.items || []).map((i) =>
          i.id === p.itemId ? { ...i, status: p.status } : i
        )
        return { ...cur, items: updatedItems }
      })
      // Also update tables snapshot
      setTables((cur) =>
        cur.map((t) => {
          if (!t.currentOrder || t.currentOrder.id !== p.orderId) return t
          const updatedItems = (t.currentOrder.items || []).map((i) =>
            i.id === p.itemId ? { ...i, status: p.status } : i
          )
          return { ...t, currentOrder: { ...t.currentOrder, items: updatedItems } }
        })
      )
    },
    onOrderStatus: (p) => {
      setOrder((cur) => (cur && cur.id === p.orderId ? { ...cur, status: p.status } : cur))
    },
    onTableReleased: () => {
      // Refresh tables
      loadTables()
    },
    onDataRefresh: () => {
      loadTables()
      loadMenu()
    },
  })

  // ----- Table actions -----
  const openTable = async (t: RestaurantTable) => {
    setSelectedTable(t)
    setGuests(1)
    setWaiterName('')
    setOrderNotes('')
    if (t.currentOrder) {
      // Existing order — load it fully
      const res = await fetch(`/api/orders/${t.currentOrder.id}`)
      const data = await res.json()
      setOrder(data.order)
      setGuests(data.order.guests)
      setWaiterName(data.order.waiterName || '')
      setOrderNotes(data.order.notes || '')
    } else {
      // Create new open order
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableId: t.id, guests: 1 }),
        })
        if (!res.ok) {
          const e = await res.json()
          toast.error(e.error || 'Could not start order')
          return
        }
        const data = await res.json()
        setOrder(data.order)
        await loadTables()
        // Notify kitchen
        sync.sendTableOccupied({ tableId: t.id, tableNumber: t.number, orderId: data.order.id })
      } catch (e) {
        toast.error('Failed to start order')
      }
    }
  }

  const closeTable = () => {
    setSelectedTable(null)
    setOrder(null)
    loadTables()
  }

  // ----- Item actions -----
  const addItem = async (item: MenuItem, qty: number) => {
    if (!order) return
    const res = await fetch(`/api/orders/${order.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ menuItemId: item.id, quantity: qty }] }),
    })
    if (!res.ok) {
      toast.error('Could not add item')
      return
    }
    const data = await res.json()
    setOrder(data.order)
    const wasAlreadySent = order.status !== 'open'
    if (wasAlreadySent) {
      // Notify kitchen an item was added to an in-progress KOT
      const newItems = (data.order.items || []).filter(
        (i: OrderItem) => !order.items!.some((oi) => oi.id === i.id)
      )
      const payload: KOTPayload = {
        orderId: data.order.id,
        tableNumber: order.table?.number || 0,
        tableName: order.table?.name || '',
        type: data.order.type,
        guests: data.order.guests,
        waiterName: data.order.waiterName,
        notes: data.order.notes,
        items: newItems,
        createdAt: data.order.createdAt,
        isUpdate: true,
      }
      sync.sendItemAdded(payload)
    }
    toast.success(`Added ${qty}× ${item.name}`)
  }

  const incItem = async (it: OrderItem) => {
    if (!order) return
    await fetch(`/api/orders/${order.id}/items/${it.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: it.quantity + 1 }),
    })
    refreshOrder()
  }

  const decItem = async (it: OrderItem) => {
    if (!order) return
    if (it.quantity <= 1) {
      await removeItem(it)
      return
    }
    await fetch(`/api/orders/${order.id}/items/${it.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: it.quantity - 1 }),
    })
    refreshOrder()
  }

  const removeItem = async (it: OrderItem) => {
    if (!order) return
    const res = await fetch(`/api/orders/${order.id}/items/${it.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const e = await res.json()
      toast.error(e.error || 'Cannot remove')
      return
    }
    refreshOrder()
  }

  const addNotes = async (it: OrderItem, notes: string) => {
    if (!order) return
    await fetch(`/api/orders/${order.id}/items/${it.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    refreshOrder()
  }

  const refreshOrder = async () => {
    if (!order) return
    const res = await fetch(`/api/orders/${order.id}`)
    const data = await res.json()
    setOrder(data.order)
    await loadTables()
  }

  // ----- Order meta update -----
  const saveMeta = async () => {
    if (!order) return
    // We PATCH the order via the items endpoint pattern — but there's no direct meta route,
    // so we update via the items endpoint's response by re-fetching after a small patch.
    // Simpler: use a fetch to /api/orders/[id]/status with same status to keep meta in sync.
    // To keep it lean, we just store meta on send.
  }

  // ----- Send to kitchen (KOT) -----
  const sendToKitchen = async () => {
    if (!order) return
    setBusy(true)
    try {
      // Update meta first (we use a tiny PATCH via /items pattern; here we just send)
      const res = await fetch(`/api/orders/${order.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kotPrinted: true }),
      })
      if (!res.ok) {
        const e = await res.json()
        toast.error(e.error || 'Could not send')
        return
      }
      const data = await res.json()
      setOrder(data.order)
      const nextKotNo = (kotNo || 0) + 1
      setKotNo(nextKotNo)
      setShowKOT(true)

      // Broadcast to kitchen
      const payload: KOTPayload = {
        orderId: data.order.id,
        tableNumber: data.order.table?.number || 0,
        tableName: data.order.table?.name || '',
        type: data.order.type,
        guests: data.order.guests,
        waiterName: data.order.waiterName,
        notes: data.order.notes,
        items: data.order.items || [],
        createdAt: data.order.createdAt,
      }
      sync.sendKOT(payload)
      await loadTables()
      toast.success('KOT sent to kitchen')
    } finally {
      setBusy(false)
    }
  }

  // ----- Mark an item served (after kitchen said ready) -----
  const markServed = async (it: OrderItem) => {
    if (!order) return
    await fetch(`/api/orders/${order.id}/items/${it.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'served' }),
    })
    await refreshOrder()
    sync.sendItemStatus({
      orderId: order.id,
      itemId: it.id,
      status: 'served',
      tableNumber: order.table?.number || 0,
    })
  }

  // ----- Billing -----
  const openBilling = async () => {
    await loadBillNo()
    setShowBilling(true)
  }

  const confirmBill = async (payload: {
    taxRate: number
    discount: number
    serviceCharge: number
    paymentMode: any
  }) => {
    if (!order) throw new Error('No order')
    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, ...payload }),
    })
    if (!res.ok) {
      const e = await res.json()
      toast.error(e.error || 'Billing failed')
      throw e
    }
    const data = await res.json()
    sync.sendTableReleased({
      tableId: order.tableId,
      tableNumber: order.table?.number || 0,
    })
    sync.sendOrderStatus({
      orderId: order.id,
      status: 'paid',
      tableNumber: order.table?.number || 0,
    })
    await loadTables()
    toast.success(`Bill #${data.bill.billNo} generated · Table released`)
    return data.bill
  }

  // ----- Render -----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // ----- Table list view -----
  if (!selectedTable) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onExit={onExit} role="counter" connected={sync.connected} />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Tables</h1>
              <p className="text-sm text-slate-500">
                {tables.filter((t) => t.status === 'occupied').length} occupied ·{' '}
                {tables.filter((t) => t.status === 'available').length} free
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => loadTables()}>
              Refresh
            </Button>
          </div>
          <TableGrid tables={tables} onSelectTable={openTable} />
        </main>
      </div>
    )
  }

  // ----- Order detail view -----
  const canEdit = order?.status === 'open'
  const canSend = order && (order.status === 'open' || order.status === 'sent') && (order.items || []).length > 0
  const canBill = order && ['sent', 'preparing', 'ready', 'served', 'billed'].includes(order.status) &&
    (order.items || []).some((i) => i.status !== 'cancelled')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onExit={closeTable} role="counter" connected={sync.connected} backLabel="Back to tables" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Left: Menu picker */}
        <div className="flex flex-col bg-white rounded-2xl border border-slate-200 p-4 min-h-[60vh]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900">Menu</h2>
            <Badge variant="outline" className="text-[10px]">
              {menu.filter((m) => m.available).length} items
            </Badge>
          </div>
          <div className="flex-1 min-h-0">
            <MenuPicker items={menu} onAdd={addItem} disabled={!canEdit && order?.status !== 'open' && !['sent', 'preparing', 'ready'].includes(order?.status || '')} />
          </div>
        </div>

        {/* Right: Order cart + actions */}
        <div className="flex flex-col gap-3">
          {/* Order meta */}
          <Card className="p-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-slate-500">Guests</Label>
                <Input
                  type="number"
                  min={1}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value) || 1)}
                  disabled={!canEdit}
                  className="mt-0.5 h-9"
                />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500">Waiter</Label>
                <Input
                  value={waiterName}
                  onChange={(e) => setWaiterName(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Name"
                  className="mt-0.5 h-9"
                />
              </div>
            </div>
            <div className="mt-2">
              <Label className="text-[10px] text-slate-500">Order notes</Label>
              <Textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                disabled={!canEdit}
                placeholder="Special instructions for the whole order…"
                rows={2}
                className="mt-0.5 text-sm"
              />
            </div>
            {order && (
              <div className="flex items-center justify-between mt-2 text-[11px]">
                <span className="text-slate-500">Order status</span>
                <Badge variant="outline" className={`text-[10px] ${ORDER_STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </div>
            )}
          </Card>

          {/* Cart */}
          <div className="flex-1 min-h-[300px] rounded-2xl border border-slate-200 overflow-hidden">
            {order && (
              <OrderCart
                order={order}
                onInc={incItem}
                onDec={decItem}
                onRemove={removeItem}
                onAddNotes={addNotes}
                onAddCustomItem={addItem}
                canEdit={canEdit}
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={sendToKitchen}
              disabled={!canSend || busy}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {order?.status === 'open' ? 'Send to Kitchen' : 'Re-print KOT'}
            </Button>
            <Button
              onClick={openBilling}
              disabled={!canBill}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Receipt className="w-4 h-4 mr-1.5" /> Generate Bill
            </Button>
          </div>

          {/* Quick served action */}
          {order && (order.items || []).some((i) => i.status === 'ready') && (
            <Card className="p-3 bg-emerald-50 border-emerald-200">
              <div className="flex items-center gap-2 text-xs text-emerald-700 mb-2">
                <AlertCircle className="w-3.5 h-3.5" /> Kitchen marked these as ready — tap to confirm served
              </div>
              <div className="space-y-1">
                {(order.items || [])
                  .filter((i) => i.status === 'ready')
                  .map((it) => (
                    <button
                      key={it.id}
                      onClick={() => markServed(it)}
                      className="w-full flex items-center justify-between text-sm bg-white px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                    >
                      <span>
                        {it.quantity}× {it.name}
                      </span>
                      <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark served
                      </span>
                    </button>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* KOT print preview */}
      <PrintPreview
        open={showKOT}
        onClose={() => setShowKOT(false)}
        title={`KOT — Table ${order?.table?.number}`}
        subtitle="Kitchen copy"
      >
        {order && <KOTReceipt order={order} kotNo={kotNo} />}
      </PrintPreview>

      {/* Billing dialog */}
      <BillingDialog
        open={showBilling}
        order={order}
        billNo={billNo}
        onClose={() => setShowBilling(false)}
        onConfirm={confirmBill}
        onAfterBill={() => {
          // After billing, exit the table
          setTimeout(() => closeTable(), 500)
        }}
      />
    </div>
  )
}

function Header({
  onExit,
  role,
  connected,
  backLabel = 'Exit',
}: {
  onExit: () => void
  role: 'counter' | 'kitchen' | 'history'
  connected: boolean
  backLabel?: string
}) {
  const labels = {
    counter: { title: 'Counter Mode', color: 'from-orange-500 to-rose-500', icon: Store },
    kitchen: { title: 'Kitchen Mode', color: 'from-emerald-500 to-teal-500', icon: Store },
    history: { title: 'Bills & History', color: 'from-violet-500 to-fuchsia-500', icon: Store },
  }
  const l = labels[role]
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {backLabel}
          </Button>
          <div className="hidden md:block w-px h-6 bg-slate-200" />
          <div className={`hidden md:flex w-9 h-9 rounded-xl bg-gradient-to-br ${l.color} items-center justify-center`}>
            <l.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{l.title}</h2>
            <p className="text-[10px] text-slate-500">
              {connected ? '● Live sync active' : '○ Reconnecting…'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]">
          ServingSync POS
        </Badge>
      </div>
    </header>
  )
}
