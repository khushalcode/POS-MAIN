// Shared TypeScript types mirroring the Prisma schema (for client use)

export type OrderStatus =
  | 'open'
  | 'sent'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'billed'
  | 'paid'

export type ItemStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'

export type TableStatus = 'available' | 'occupied'

export type PaymentMode = 'cash' | 'card' | 'upi' | 'other'

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  available: boolean
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  status: ItemStatus
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  tableId: string
  status: OrderStatus
  type: 'dine_in' | 'takeaway'
  guests: number
  waiterName?: string | null
  notes?: string | null
  kotPrinted: boolean
  billPrinted: boolean
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
  table?: RestaurantTable
  bill?: Bill | null
}

export interface RestaurantTable {
  id: string
  number: number
  name: string
  capacity: number
  status: TableStatus
  currentOrderId?: string | null
  currentOrder?: Order | null
  createdAt: string
  updatedAt: string
}

export interface Bill {
  id: string
  billNo: number
  orderId: string
  tableNumber: number
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  serviceCharge: number
  total: number
  paymentMode: PaymentMode
  paymentStatus: string
  paidAt: string
  createdAt: string
  order?: Order
}

// Socket payload types
export interface KOTPayload {
  orderId: string
  tableNumber: number
  tableName: string
  type: 'dine_in' | 'takeaway'
  guests: number
  waiterName?: string | null
  notes?: string | null
  items: OrderItem[]
  createdAt: string
  isUpdate?: boolean
}

export interface ItemStatusPayload {
  orderId: string
  itemId: string
  status: ItemStatus
  tableNumber: number
}

export interface OrderStatusPayload {
  orderId: string
  status: OrderStatus
  tableNumber: number
}

export interface TablePayload {
  tableId: string
  tableNumber: number
  orderId?: string
}
