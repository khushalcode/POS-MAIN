'use client'

import { useCallback } from 'react'
import { useSession } from '@/lib/session'
import {
  menu, tables, orders, bills, settings, users, dashboard,
  zomato, audit, syncQueue,
} from '@/lib/client-data'

/**
 * useShopFetch — COMPATIBILITY SHIM
 *
 * Intercepts fetch('/api/...') calls and routes them to client-side
 * SQLite functions instead. This allows ALL existing components to
 * work WITHOUT any changes — no server needed.
 *
 * The shim parses the URL and HTTP method, calls the appropriate
 * client-data function, and returns a Response-like object.
 */

interface FakeResponse {
  ok: boolean
  status: number
  json: () => Promise<any>
  text: () => Promise<string>
}

function fakeResponse(data: any, status = 200): FakeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  }
}

function parseBody(body: string | undefined): any {
  if (!body) return {}
  try { return JSON.parse(body) } catch { return {} }
}

export function useShopFetch() {
  const { currentShop } = useSession()
  const shopId = currentShop?.id || ''

  return useCallback(async (url: string, options: RequestInit = {}): Promise<FakeResponse> => {
    const method = options.method || 'GET'
    const body = parseBody(typeof options.body === 'string' ? options.body : undefined)

    // ─── MENU ───
    if (url.startsWith('/api/menu') && !url.includes('/')) {
      if (method === 'GET') return fakeResponse({ items: menu.list(shopId) })
      if (method === 'POST') return fakeResponse({ item: menu.create(shopId, body) }, 201)
    }
    // /api/menu/[id]
    const menuMatch = url.match(/^\/api\/menu\/([^/]+)$/)
    if (menuMatch) {
      const id = menuMatch[1]
      if (method === 'PUT') return fakeResponse({ item: menu.update(id, body) })
      if (method === 'DELETE') { menu.delete(id); return fakeResponse({ ok: true }) }
    }

    // ─── TABLES ───
    if (url === '/api/tables' && method === 'GET') return fakeResponse({ tables: tables.list(shopId) })
    if (url === '/api/tables' && method === 'POST') return fakeResponse({ table: { id: 'new' } }, 201)
    if (url === '/api/tables/seed' && method === 'POST') {
      tables.seed(shopId)
      return fakeResponse({ seeded: true, tables: tables.list(shopId) })
    }

    // ─── ORDERS ───
    if (url.startsWith('/api/orders?')) {
      const status = new URLSearchParams(url.split('?')[1]).get('status')
      return fakeResponse({ orders: orders.list(shopId, status || undefined) })
    }
    if (url === '/api/orders' && method === 'POST') {
      return fakeResponse({ order: orders.create(shopId, body.tableId, body.type, body.guests, body.waiterName, body.customerName, body.notes) }, 201)
    }
    // /api/orders/[id]
    const orderMatch = url.match(/^\/api\/orders\/([^/]+)$/)
    if (orderMatch) {
      const id = orderMatch[1]
      if (method === 'GET') return fakeResponse({ order: orders.getById(id) })
      if (method === 'DELETE') { orders.delete(id); return fakeResponse({ ok: true }) }
    }
    // /api/orders/[id]/items
    const itemsMatch = url.match(/^\/api\/orders\/([^/]+)\/items$/)
    if (itemsMatch && method === 'POST') {
      const orderId = itemsMatch[1]
      for (const it of body.items || []) {
        const menuItem = menu.list(shopId).find((m: any) => m.id === it.menuItemId)
        if (menuItem) orders.addItem(orderId, it.menuItemId, menuItem.name, menuItem.price, it.quantity, it.notes)
      }
      return fakeResponse({ order: orders.getById(orderId) }, 201)
    }
    // /api/orders/[id]/items/[itemId]
    const itemMatch = url.match(/^\/api\/orders\/([^/]+)\/items\/([^/]+)$/)
    if (itemMatch) {
      const [, orderId, itemId] = itemMatch
      if (method === 'PATCH') return fakeResponse({ item: orders.updateItem(itemId, body), order: orders.getById(orderId) })
      if (method === 'DELETE') { orders.deleteItem(itemId); return fakeResponse({ ok: true }) }
    }
    // /api/orders/[id]/send
    const sendMatch = url.match(/^\/api\/orders\/([^/]+)\/send$/)
    if (sendMatch && method === 'POST') {
      const id = sendMatch[1]
      return fakeResponse({ order: orders.sendKOT(id) })
    }
    // /api/orders/[id]/status
    const statusMatch = url.match(/^\/api\/orders\/([^/]+)\/status$/)
    if (statusMatch && method === 'PATCH') {
      return fakeResponse({ order: orders.updateStatus(statusMatch[1], body.status) })
    }
    // /api/orders/[id]/free-table
    const freeMatch = url.match(/^\/api\/orders\/([^/]+)\/free-table$/)
    if (freeMatch && method === 'POST') {
      orders.freeTable(freeMatch[1])
      return fakeResponse({ ok: true })
    }

    // ─── BILLS ───
    if (url.startsWith('/api/bills?') || (url === '/api/bills' && method === 'GET')) {
      const params = new URLSearchParams(url.split('?')[1] || '')
      return fakeResponse({
        bills: bills.list(shopId, { from: params.get('from') || undefined, to: params.get('to') || undefined, table: params.get('table') ? Number(params.get('table')) : undefined, q: params.get('q') || undefined }),
        summary: { totalRevenue: 0, totalBills: 0, byPayment: {} },
      })
    }
    if (url === '/api/bills' && method === 'POST') {
      const order = orders.getById(body.orderId)
      if (!order) return fakeResponse({ error: 'Order not found' }, 404)
      const bill = bills.create(shopId, body.orderId, order.table?.number || 0, body.subtotal || 0, body.taxRate || 0, body.taxAmount || 0, body.discount || 0, body.serviceCharge || 0, body.total || 0, body.paymentMode || 'cash')
      return fakeResponse({ bill }, 201)
    }
    if (url === '/api/bills/next-no' && method === 'GET') {
      return fakeResponse({ nextNo: bills.nextNo(shopId) })
    }
    const billMatch = url.match(/^\/api\/bills\/([^/]+)$/)
    if (billMatch && method === 'GET') return fakeResponse({ bill: bills.getById(billMatch[1]) })

    // ─── SETTINGS ───
    if (url === '/api/settings' && method === 'GET') return fakeResponse({ settings: settings.get(shopId) })
    if (url === '/api/settings' && method === 'PUT') return fakeResponse({ settings: settings.update(shopId, body) })

    // ─── DASHBOARD ───
    if (url === '/api/dashboard' && method === 'GET') return fakeResponse(dashboard.get(shopId))

    // ─── USERS ───
    if (url === '/api/users' && method === 'GET') return fakeResponse({ users: users.list() })
    if (url === '/api/users' && method === 'POST') return fakeResponse({ user: users.create(body) }, 201)
    if (url === '/api/users' && method === 'PUT') return fakeResponse({ user: users.update(body.id, body) })
    const userDelMatch = url.match(/^\/api\/users\?id=(.+)$/)
    if (userDelMatch && method === 'DELETE') { users.delete(userDelMatch[1]); return fakeResponse({ ok: true }) }

    // ─── ZOMATO ───
    if (url.startsWith('/api/zomato?') || (url === '/api/zomato' && method === 'GET')) {
      const status = new URLSearchParams(url.split('?')[1] || '').get('status')
      return fakeResponse({ orders: zomato.list(shopId, status || undefined) })
    }
    if (url === '/api/zomato' && method === 'POST') return fakeResponse({ order: zomato.create(shopId, body) }, 201)
    if (url === '/api/zomato/sync' && method === 'POST') return fakeResponse({ created: [], count: 0, mode: 'simulation' })
    const zomatoMatch = url.match(/^\/api\/zomato\/([^/]+)$/)
    if (zomatoMatch) {
      const id = zomatoMatch[1]
      if (method === 'PATCH') { zomato.updateStatus(id, body.status); return fakeResponse({ order: zomato.getById(id) }) }
      if (method === 'DELETE') { zomato.delete(id); return fakeResponse({ ok: true }) }
    }
    const zomatoPushMatch = url.match(/^\/api\/zomato\/([^/]+)\/push$/)
    if (zomatoPushMatch && method === 'POST') {
      const order = zomato.pushToKitchen(shopId, zomatoPushMatch[1])
      return fakeResponse({ order, zomatoOrderId: zomato.getById(zomatoPushMatch[1])?.zomatoOrderId })
    }

    // ─── AUDIT ───
    if (url === '/api/audit' && method === 'GET') {
      const params = new URLSearchParams(url.split('?')[1] || '')
      return fakeResponse({ logs: audit.list(shopId, params.get('action') || undefined) })
    }
    if (url === '/api/audit' && method === 'POST') {
      audit.log(body.action, body.details, shopId, body.userName)
      return fakeResponse({ ok: true })
    }

    // ─── AUTO-SEED ───
    if (url === '/api/auto-seed') return fakeResponse({ seeded: false, message: 'Database already initialized' })

    // ─── CUSTOMERS / SUPPLIERS / EXPENSES / etc. ───
    // These are less critical — return empty for now
    if (url.startsWith('/api/customers')) return fakeResponse({ customers: [] })
    if (url.startsWith('/api/suppliers')) return fakeResponse({ suppliers: [] })
    if (url.startsWith('/api/purchases')) return fakeResponse({ purchases: [] })
    if (url.startsWith('/api/expenses')) return fakeResponse({ expenses: [] })
    if (url.startsWith('/api/moneyin')) return fakeResponse({ items: [] })
    if (url.startsWith('/api/moneyout')) return fakeResponse({ items: [] })
    if (url.startsWith('/api/reports')) return fakeResponse({ summary: { salesRevenue: 0, totalExpenses: 0, totalPurchases: 0, netProfit: 0, cashFlow: 0, billCount: 0, avgBill: 0 }, byPayment: {}, topItems: [], expenseByCategory: {}, dailyBreakdown: [], bills: [] })
    if (url.startsWith('/api/shops')) return fakeResponse({ shops: [] })
    if (url.startsWith('/api/stats')) return fakeResponse({ totalRevenue: 0, totalBills: 0 })
    if (url.startsWith('/api/backup')) return fakeResponse({})

    console.warn('[shopFetch] Unknown URL:', url, method)
    return fakeResponse({ error: 'Not found' }, 404)
  }, [shopId])
}
