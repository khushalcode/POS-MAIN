'use client'

import { query, queryOne, execute, genId } from './client-db'
import { isValidKey } from './license-keys'

/**
 * Client-side data access layer
 * Replaces ALL server-side API routes with direct SQLite queries.
 * No server needed — works in APK, EXE, and browser.
 */

// ═══════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════
export const auth = {
  login(email: string, password: string) {
    const user = queryOne<any>(
      'SELECT * FROM AppUser WHERE email = ? AND password = ? AND active = 1',
      [email.toLowerCase().trim(), password]
    )
    if (!user) return null
    const shops = user.shopId
      ? query('SELECT * FROM Shop WHERE id = ?', [user.shopId])
      : query('SELECT * FROM Shop WHERE active = 1 ORDER BY name')
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, shopId: user.shopId },
      shops: shops.map(convertShop),
    }
  },
}

// ═══════════════════════════════════════
//  LICENSE
// ═══════════════════════════════════════
export const license = {
  validate(key: string) {
    const normalized = key.trim().toUpperCase()
    const result = isValidKey(normalized)
    if (!result.valid) return { valid: false, reason: result.reason }

    // Check if already activated
    const activation = queryOne<any>('SELECT * FROM LicenseActivation WHERE key = ?', [normalized])
    if (activation) {
      const now = new Date()
      const expiry = new Date(activation.expiresAt)
      if (expiry > now) {
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return { valid: true, duration: result.duration, alreadyActivated: true, daysLeft }
      }
      return { valid: false, reason: 'expired' }
    }
    // Check if marked as used
    const dbKey = queryOne<any>('SELECT * FROM LicenseKey WHERE key = ?', [normalized])
    if (dbKey?.used) return { valid: false, reason: 'already_used' }
    return { valid: true, duration: result.duration }
  },

  activate(key: string) {
    const normalized = key.trim().toUpperCase()
    const result = isValidKey(normalized)
    if (!result.valid) return { error: 'Invalid license key' }

    // Check existing
    const existing = queryOne<any>('SELECT * FROM LicenseActivation WHERE key = ?', [normalized])
    if (existing) {
      const now = new Date()
      const expiry = new Date(existing.expiresAt)
      if (expiry > now) {
        return { active: true, activatedAt: existing.activatedAt, expiresAt: existing.expiresAt,
          daysLeft: Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) }
      }
      return { error: 'License expired' }
    }

    // Check if used
    const dbKey = queryOne<any>('SELECT * FROM LicenseKey WHERE key = ?', [normalized])
    if (dbKey?.used) return { error: 'This key has already been used' }

    // Activate
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + result.duration)

    if (dbKey) {
      execute('UPDATE LicenseKey SET used = 1 WHERE id = ?', [dbKey.id])
    } else {
      execute('INSERT INTO LicenseKey (id, key, duration, used) VALUES (?,?,?,?)', [genId(), normalized, result.duration, 1])
    }
    execute('INSERT INTO LicenseActivation (id, key, activatedAt, expiresAt) VALUES (?,?,?,?)',
      [genId(), normalized, now.toISOString(), expiresAt.toISOString()])

    return { active: true, activatedAt: now.toISOString(), expiresAt: expiresAt.toISOString(), daysLeft: result.duration }
  },

  status() {
    const activation = queryOne<any>('SELECT * FROM LicenseActivation LIMIT 1')
    if (!activation) return { active: false, reason: 'not_activated' }
    const now = new Date()
    const expiry = new Date(activation.expiresAt)
    if (expiry < now) return { active: false, reason: 'expired', expiresAt: activation.expiresAt }
    return { active: true, activatedAt: activation.activatedAt, expiresAt: activation.expiresAt,
      daysLeft: Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) }
  },
}

// ═══════════════════════════════════════
//  MENU
// ═══════════════════════════════════════
export const menu = {
  list(shopId: string, category?: string) {
    const sql = category
      ? 'SELECT * FROM MenuItem WHERE shopId = ? AND category = ? ORDER BY category, name'
      : 'SELECT * FROM MenuItem WHERE shopId = ? ORDER BY category, name'
    return query(sql, category ? [shopId, category] : [shopId]).map(convertMenuItem)
  },
  create(shopId: string, data: any) {
    const id = genId()
    execute(`INSERT INTO MenuItem (id, shopId, name, category, price, cost, stock, unit, image, available)
      VALUES (?,?,?,?,?,?,?,?,?,?)`, [id, shopId, data.name, data.category || 'General', Number(data.price),
      Number(data.cost || 0), Number(data.stock || 0), data.unit || 'Pcs', data.image || null, data.available !== false ? 1 : 0])
    return this.getById(id)
  },
  update(id: string, data: any) {
    const sets: string[] = []
    const params: any[] = []
    if (data.name != null) { sets.push('name = ?'); params.push(data.name) }
    if (data.category != null) { sets.push('category = ?'); params.push(data.category) }
    if (data.price != null) { sets.push('price = ?'); params.push(Number(data.price)) }
    if (data.cost != null) { sets.push('cost = ?'); params.push(Number(data.cost)) }
    if (data.stock != null) { sets.push('stock = ?'); params.push(Number(data.stock)) }
    if (data.unit != null) { sets.push('unit = ?'); params.push(data.unit) }
    if (data.image !== undefined) { sets.push('image = ?'); params.push(data.image) }
    if (data.available != null) { sets.push('available = ?'); params.push(data.available ? 1 : 0) }
    if (sets.length === 0) return null
    params.push(id)
    execute(`UPDATE MenuItem SET ${sets.join(', ')} WHERE id = ?`, params)
    return this.getById(id)
  },
  getById(id: string) { return convertMenuItem(queryOne('SELECT * FROM MenuItem WHERE id = ?', [id])) },
  delete(id: string) { execute('DELETE FROM MenuItem WHERE id = ?', [id]) },
}

// ═══════════════════════════════════════
//  TABLES
// ═══════════════════════════════════════
export const tables = {
  list(shopId: string) {
    const t = query('SELECT * FROM RestaurantTable WHERE shopId = ? ORDER BY number', [shopId])
    return t.map((row: any) => {
      const table = convertTable(row)
      if (row.currentOrderId) {
        const order = orders.getById(row.currentOrderId)
        table.currentOrder = order
      }
      return table
    })
  },
  seed(shopId: string) {
    const count = queryOne<any>('SELECT COUNT(*) as c FROM RestaurantTable WHERE shopId = ?', [shopId])
    if (count?.c > 0) return { seeded: false }
    execute('INSERT INTO RestaurantTable (id, shopId, number, name, capacity, status) VALUES (?,?,?,?,?,?)', [genId(), shopId, 0, 'Direct Counter', 0, 'available'])
    for (let i = 1; i <= 10; i++) {
      execute('INSERT INTO RestaurantTable (id, shopId, number, name, capacity, status) VALUES (?,?,?,?,?,?)', [genId(), shopId, i, `Table ${i}`, 4, 'available'])
    }
    return { seeded: true }
  },
}

// ═══════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════
export const orders = {
  list(shopId: string, status?: string) {
    const sql = status
      ? 'SELECT * FROM Orders WHERE shopId = ? AND status = ? ORDER BY createdAt DESC'
      : 'SELECT * FROM Orders WHERE shopId = ? ORDER BY createdAt DESC'
    const rows = query(sql, status ? [shopId, status] : [shopId])
    return rows.map((row: any) => {
      const order = convertOrder(row)
      order.items = query('SELECT * FROM OrderItem WHERE orderId = ?', [row.id]).map(convertOrderItem)
      const table = queryOne<any>('SELECT * FROM RestaurantTable WHERE id = ?', [row.tableId])
      order.table = table ? convertTable(table) : null
      return order
    })
  },
  getById(id: string) {
    const row = queryOne<any>('SELECT * FROM Orders WHERE id = ?', [id])
    if (!row) return null
    const order = convertOrder(row)
    order.items = query('SELECT * FROM OrderItem WHERE orderId = ?', [id]).map(convertOrderItem)
    const table = queryOne<any>('SELECT * FROM RestaurantTable WHERE id = ?', [row.tableId])
    order.table = table ? convertTable(table) : null
    return order
  },
  create(shopId: string, tableId: string, type: string = 'dine_in', guests: number = 1, waiterName?: string, customerName?: string, notes?: string) {
    const id = genId()
    execute(`INSERT INTO Orders (id, shopId, tableId, status, type, guests, waiterName, customerName, notes)
      VALUES (?,?,?,?,?,?,?,?,?)`, [id, shopId, tableId, 'open', type, guests, waiterName || null, customerName || null, notes || null])
    execute('UPDATE RestaurantTable SET status = ?, currentOrderId = ? WHERE id = ?', ['occupied', id, tableId])
    return this.getById(id)
  },
  delete(id: string) {
    execute('DELETE FROM OrderItem WHERE orderId = ?', [id])
    execute('DELETE FROM Bill WHERE orderId = ?', [id])
    execute('DELETE FROM Orders WHERE id = ?', [id])
    execute('UPDATE RestaurantTable SET status = ?, currentOrderId = NULL WHERE currentOrderId = ?', ['available', id])
  },
  sendKOT(id: string) {
    execute('UPDATE Orders SET status = ?, kotPrinted = 1 WHERE id = ?', ['sent', id])
    return this.getById(id)
  },
  updateStatus(id: string, status: string) {
    execute('UPDATE Orders SET status = ? WHERE id = ?', [status, id])
    return this.getById(id)
  },
  freeTable(id: string) {
    const order = this.getById(id)
    if (!order) return
    execute('UPDATE Orders SET status = ? WHERE id = ?', ['billed', id])
    execute('UPDATE RestaurantTable SET status = ?, currentOrderId = NULL WHERE id = ?', ['available', order.tableId])
    return order.table?.number
  },
  // ─── Order Items ───
  addItem(orderId: string, menuItemId: string, name: string, price: number, quantity: number, notes?: string) {
    // Check if there's an existing pending item with same menu item
    const existing = queryOne<any>('SELECT * FROM OrderItem WHERE orderId = ? AND menuItemId = ? AND status = ? AND notes IS ?',
      [orderId, menuItemId, 'pending', notes || null])
    if (existing) {
      execute('UPDATE OrderItem SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id])
    } else {
      execute('INSERT INTO OrderItem (id, orderId, menuItemId, name, price, quantity, status, notes) VALUES (?,?,?,?,?,?,?,?)',
        [genId(), orderId, menuItemId, name, price, quantity, 'pending', notes || null])
    }
    return orders.getById(orderId)
  },
  updateItem(itemId: string, data: any) {
    const sets: string[] = []
    const params: any[] = []
    if (data.status != null) { sets.push('status = ?'); params.push(data.status) }
    if (data.quantity != null) { sets.push('quantity = ?'); params.push(Number(data.quantity)) }
    if (data.notes != null) { sets.push('notes = ?'); params.push(data.notes) }
    if (sets.length === 0) return null
    params.push(itemId)
    execute(`UPDATE OrderItem SET ${sets.join(', ')} WHERE id = ?`, params)
    return queryOne('SELECT * FROM OrderItem WHERE id = ?', [itemId])
  },
  deleteItem(itemId: string) { execute('DELETE FROM OrderItem WHERE id = ?', [itemId]) },
}

// ═══════════════════════════════════════
//  BILLS
// ═══════════════════════════════════════
export const bills = {
  list(shopId: string, filters?: { from?: string; to?: string; table?: number; q?: string }) {
    let sql = 'SELECT * FROM Bill WHERE shopId = ?'
    const params: any[] = [shopId]
    if (filters?.from) { sql += ' AND paidAt >= ?'; params.push(filters.from) }
    if (filters?.to) { sql += ' AND paidAt <= ?'; params.push(filters.to) }
    if (filters?.table) { sql += ' AND tableNumber = ?'; params.push(filters.table) }
    sql += ' ORDER BY paidAt DESC'
    let result = query(sql, params)
    if (filters?.q) {
      const term = filters.q.toLowerCase()
      result = result.filter((b: any) => String(b.billNo).includes(term))
    }
    return result.map((b: any) => {
      const bill = convertBill(b)
      const order = orders.getById(b.orderId)
      bill.order = order
      return bill
    })
  },
  getById(id: string) {
    const row = queryOne<any>('SELECT * FROM Bill WHERE id = ?', [id])
    if (!row) return null
    const bill = convertBill(row)
    bill.order = orders.getById(row.orderId)
    return bill
  },
  nextNo(shopId: string) {
    const last = queryOne<any>('SELECT billNo FROM Bill WHERE shopId = ? ORDER BY billNo DESC LIMIT 1', [shopId])
    return last?.billNo ? last.billNo + 1 : 1001
  },
  create(shopId: string, orderId: string, tableNumber: number, subtotal: number, taxRate: number, taxAmount: number, discount: number, serviceCharge: number, total: number, paymentMode: string) {
    const id = genId()
    const billNo = this.nextNo(shopId)
    execute(`INSERT INTO Bill (id, shopId, billNo, orderId, tableNumber, subtotal, taxRate, taxAmount, discount, serviceCharge, total, paymentMode, paymentStatus, paidAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [id, shopId, billNo, orderId, tableNumber, subtotal, taxRate, taxAmount, discount, serviceCharge, total, paymentMode, 'paid', new Date().toISOString()])
    execute('UPDATE Orders SET status = ?, billPrinted = 1 WHERE id = ?', ['paid', orderId])
    execute('UPDATE RestaurantTable SET status = ?, currentOrderId = NULL WHERE currentOrderId = ?', ['available', orderId])
    return this.getById(id)
  },
}

// ═══════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════
export const settings = {
  get(shopId: string) {
    let row = queryOne<any>('SELECT * FROM ShopSetting WHERE shopId = ?', [shopId])
    if (!row) {
      const shop = queryOne<any>('SELECT * FROM Shop WHERE id = ?', [shopId])
      execute('INSERT INTO ShopSetting (id, shopId, shopName) VALUES (?,?)', [genId(), shopId, shop?.name || 'Restaurant'])
      row = queryOne<any>('SELECT * FROM ShopSetting WHERE shopId = ?', [shopId])
    }
    return convertSettings(row)
  },
  update(shopId: string, data: any) {
    let row = queryOne<any>('SELECT * FROM ShopSetting WHERE shopId = ?', [shopId])
    if (!row) { execute('INSERT INTO ShopSetting (id, shopId) VALUES (?,?)', [genId(), shopId]); row = queryOne('SELECT * FROM ShopSetting WHERE shopId = ?', [shopId]) }
    const sets: string[] = []
    const params: any[] = []
    for (const [key, value] of Object.entries(data)) {
      if (value != null) {
        sets.push(`${key} = ?`)
        params.push(typeof value === 'boolean' ? (value ? 1 : 0) : value)
      }
    }
    if (sets.length === 0) return this.get(shopId)
    params.push(shopId)
    execute(`UPDATE ShopSetting SET ${sets.join(', ')} WHERE shopId = ?`, params)
    return this.get(shopId)
  },
}

// ═══════════════════════════════════════
//  USERS
// ═══════════════════════════════════════
export const users = {
  list() { return query('SELECT id, name, email, role, active, shopId, createdAt FROM AppUser ORDER BY createdAt DESC').map(convertUser) },
  create(data: any) {
    const id = genId()
    execute('INSERT INTO AppUser (id, name, email, password, role, active, shopId) VALUES (?,?,?,?,?,?,?)',
      [id, data.name, data.email.toLowerCase(), data.password, data.role || 'staff', data.active !== false ? 1 : 0, data.shopId || null])
    return { id, name: data.name, email: data.email, role: data.role || 'staff' }
  },
  update(id: string, data: any) {
    const sets: string[] = []; const params: any[] = []
    if (data.name != null) { sets.push('name = ?'); params.push(data.name) }
    if (data.email != null) { sets.push('email = ?'); params.push(data.email.toLowerCase()) }
    if (data.role != null) { sets.push('role = ?'); params.push(data.role) }
    if (data.active != null) { sets.push('active = ?'); params.push(data.active ? 1 : 0) }
    if (data.password) { sets.push('password = ?'); params.push(data.password) }
    if (data.shopId !== undefined) { sets.push('shopId = ?'); params.push(data.shopId || null) }
    if (sets.length === 0) return null
    params.push(id); execute(`UPDATE AppUser SET ${sets.join(', ')} WHERE id = ?`, params)
    return { id, name: data.name, email: data.email, role: data.role }
  },
  delete(id: string) { execute('DELETE FROM AppUser WHERE id = ?', [id]) },
}

// ═══════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════
export const dashboard = {
  get(shopId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)

    const todayBills = queryOne<any>('SELECT COUNT(*) as c, COALESCE(SUM(total), 0) as s FROM Bill WHERE shopId = ? AND paidAt >= ?', [shopId, today.toISOString()])
    const monthBills = queryOne<any>('SELECT COUNT(*) as c, COALESCE(SUM(total), 0) as s FROM Bill WHERE shopId = ? AND paidAt >= ?', [shopId, monthStart.toISOString()])
    const allBills = queryOne<any>('SELECT COUNT(*) as c, COALESCE(SUM(total), 0) as s FROM Bill WHERE shopId = ?', [shopId])
    const menuCount = queryOne<any>('SELECT COUNT(*) as c FROM MenuItem WHERE shopId = ?', [shopId])
    const customerCount = queryOne<any>('SELECT COUNT(*) as c FROM Customer WHERE shopId = ?', [shopId])
    const occupiedTables = queryOne<any>('SELECT COUNT(*) as c FROM RestaurantTable WHERE shopId = ? AND status = ?', [shopId, 'occupied'])
    const totalTables = queryOne<any>('SELECT COUNT(*) as c FROM RestaurantTable WHERE shopId = ?', [shopId])

    return {
      today: { revenue: todayBills?.s || 0, count: todayBills?.c || 0 },
      month: { revenue: monthBills?.s || 0, count: monthBills?.c || 0 },
      allTime: { revenue: allBills?.s || 0, count: allBills?.c || 0 },
      catalog: { menuItems: menuCount?.c || 0, customers: customerCount?.c || 0 },
      tables: { occupied: occupiedTables?.c || 0, total: totalTables?.c || 0 },
    }
  },
}

// ═══════════════════════════════════════
//  ZOMATO
// ═══════════════════════════════════════
export const zomato = {
  list(shopId: string, status?: string) {
    const sql = status ? 'SELECT * FROM ZomatoOrder WHERE shopId = ? AND status = ? ORDER BY createdAt DESC' : 'SELECT * FROM ZomatoOrder WHERE shopId = ? ORDER BY createdAt DESC'
    return query(sql, status ? [shopId, status] : [shopId]).map(convertZomatoOrder)
  },
  create(shopId: string, data: any) {
    const id = genId()
    const last = queryOne<any>('SELECT zomatoOrderId FROM ZomatoOrder WHERE shopId = ? ORDER BY zomatoOrderId DESC LIMIT 1', [shopId])
    const nextNum = last ? (parseInt(last.zomatoOrderId.replace(/\D/g, '')) || 1000) + 1 : 1001
    execute(`INSERT INTO ZomatoOrder (id, shopId, zomatoOrderId, customerName, customerPhone, deliveryType, address, items, subtotal, taxAmount, packagingCharge, deliveryFee, discount, total, paymentMode, status, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [id, shopId, `ZOM-${nextNum}`, data.customerName, data.customerPhone || null,
      data.deliveryType || 'delivery', data.address || null, JSON.stringify(data.items), data.subtotal, data.taxAmount || 0,
      data.packagingCharge || 0, data.deliveryFee || 0, data.discount || 0, data.total, data.paymentMode || 'prepaid', 'new', data.notes || null])
    return this.getById(id)
  },
  getById(id: string) { return convertZomatoOrder(queryOne('SELECT * FROM ZomatoOrder WHERE id = ?', [id])) },
  updateStatus(id: string, status: string) { execute('UPDATE ZomatoOrder SET status = ? WHERE id = ?', [status, id]) },
  delete(id: string) { execute('DELETE FROM ZomatoOrder WHERE id = ?', [id]) },
  pushToKitchen(shopId: string, zomatoOrderId: string) {
    const zomato = this.getById(zomatoOrderId)
    if (!zomato || zomato.internalOrderId) return null
    const items = JSON.parse(zomato.items || '[]')
    // Find Direct Counter table
    let directTable = queryOne<any>('SELECT * FROM RestaurantTable WHERE shopId = ? AND number = 0', [shopId])
    if (!directTable) {
      directTable = { id: genId() }
      execute('INSERT INTO RestaurantTable (id, shopId, number, name, capacity, status) VALUES (?,?,?,?,?,?)', [directTable.id, shopId, 0, 'Direct Counter', 0, 'available'])
    }
    const order = orders.create(shopId, directTable.id, zomato.deliveryType === 'pickup' ? 'takeaway' : 'direct', 1, undefined, zomato.customerName, `Zomato Order ${zomato.zomatoOrderId}`)
    for (const it of items) {
      const menuMatch = queryOne<any>('SELECT * FROM MenuItem WHERE shopId = ? AND name = ?', [shopId, it.name])
      let menuItemId = menuMatch?.id
      if (!menuItemId) {
        menuItemId = genId()
        execute('INSERT INTO MenuItem (id, shopId, name, category, price, cost, stock, unit, available) VALUES (?,?,?,?,?,?,?,?,?)', [menuItemId, shopId, it.name, 'General', it.price, 0, 0, 'Pcs', 1])
      }
      orders.addItem(order.id, menuItemId, it.name, it.price, it.qty)
    }
    execute('UPDATE Orders SET status = ?, kotPrinted = 1 WHERE id = ?', ['sent', order.id])
    execute('UPDATE RestaurantTable SET status = ?, currentOrderId = ? WHERE id = ?', ['occupied', order.id, directTable.id])
    execute('UPDATE ZomatoOrder SET internalOrderId = ?, status = ? WHERE id = ?', [order.id, 'accepted', zomatoOrderId])
    return order
  },
}

// ═══════════════════════════════════════
//  AUDIT LOG
// ═══════════════════════════════════════
export const audit = {
  log(action: string, details?: any, shopId?: string, userName?: string) {
    execute('INSERT INTO AuditLog (id, shopId, userName, action, details) VALUES (?,?,?,?,?)',
      [genId(), shopId || null, userName || null, action, details ? JSON.stringify(details) : null])
  },
  list(shopId?: string, action?: string) {
    let sql = 'SELECT * FROM AuditLog'
    const params: any[] = []
    const conditions: string[] = []
    if (shopId) { conditions.push('shopId = ?'); params.push(shopId) }
    if (action) { conditions.push('action = ?'); params.push(action) }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ')
    sql += ' ORDER BY createdAt DESC LIMIT 500'
    return query(sql, params)
  },
}

// ═══════════════════════════════════════
//  SYNC OUTBOX (for Supabase KOT sync)
// ═══════════════════════════════════════
export const syncQueue = {
  add(eventType: string, payload: any) {
    execute('INSERT INTO SyncOutbox (id, eventType, payload) VALUES (?,?,?)',
      [genId(), eventType, JSON.stringify(payload)])
  },
  getPending() {
    return query('SELECT * FROM SyncOutbox WHERE status = ? ORDER BY createdAt ASC', ['pending'])
  },
  markSynced(id: string) {
    execute('UPDATE SyncOutbox SET status = ?, syncedAt = ? WHERE id = ?', ['synced', new Date().toISOString(), id])
  },
  markFailed(id: string) {
    execute('UPDATE SyncOutbox SET attempts = attempts + 1 WHERE id = ?', [id])
  },
}

// ═══════════════════════════════════════
//  CONVERTERS (SQLite integer → JS boolean/types)
// ═══════════════════════════════════════
function convertShop(row: any) {
  return { ...row, active: !!row.active }
}
function convertMenuItem(row: any) {
  return { ...row, available: !!row.available }
}
function convertTable(row: any) {
  return { ...row, status: row.status }
}
function convertOrder(row: any) {
  return { ...row, kotPrinted: !!row.kotPrinted, billPrinted: !!row.billPrinted }
}
function convertOrderItem(row: any) {
  return { ...row }
}
function convertBill(row: any) {
  return { ...row }
}
function convertSettings(row: any) {
  if (!row) return null
  const boolKeys = ['billShowLogo','billShowGstin','billShowPhone','billShowAddress','billShowEmail','billShowDateTime','billShowWaiter','billShowCustomer','billShowKotNo','kotShowLogo','kotShowWaiter','kotShowDateTime','kotShowTable','kotShowGuests','zomatoEnabled']
  const result = { ...row }
  for (const key of boolKeys) { if (key in result) result[key] = !!result[key] }
  return result
}
function convertUser(row: any) {
  return { ...row, active: !!row.active }
}
function convertZomatoOrder(row: any) {
  if (!row) return null
  return { ...row }
}
