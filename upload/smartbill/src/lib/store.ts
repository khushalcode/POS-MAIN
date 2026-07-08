import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  unit: string
  price: number
  quantity: number
  total: number
}

interface CartStore {
  items: CartItem[]
  taxRate: number
  discount: number
  paymentMode: string
  addItem: (item: Omit<CartItem, 'total'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setTaxRate: (rate: number) => void
  setDiscount: (discount: number) => void
  setPaymentMode: (mode: string) => void
  getSubtotal: () => number
  getTaxAmount: () => number
  getGrandTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      taxRate: 5,
      discount: 0,
      paymentMode: 'Cash',
      addItem: (item) => {
        const items = get().items
        const existing = items.find((i) => i.productId === item.productId)
        if (existing) {
          const newQty = existing.quantity + 1
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: newQty, total: i.price * newQty }
                : i
            ),
          })
        } else {
          set({
            items: [...items, { ...item, quantity: 1, total: item.price }],
          })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) })
        } else {
          set({
            items: get().items.map((i) =>
              i.productId === productId
                ? { ...i, quantity, total: i.price * quantity }
                : i
            ),
          })
        }
      },
      clearCart: () => set({ items: [], discount: 0 }),
      setTaxRate: (rate) => set({ taxRate: rate }),
      setDiscount: (discount) => set({ discount }),
      setPaymentMode: (mode) => set({ paymentMode: mode }),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.total, 0),
      getTaxAmount: () => {
        const subtotal = get().getSubtotal()
        return (subtotal * get().taxRate) / 100
      },
      getGrandTotal: () => {
        const subtotal = get().getSubtotal()
        const tax = get().getTaxAmount()
        return subtotal + tax - get().discount
      },
    }),
    { name: 'smartbill-cart' }
  )
)

type PageName = 'dashboard' | 'products' | 'sales' | 'history' | 'customers' | 'suppliers' | 'reports' | 'users' | 'settings' | 'backup' | 'purchases' | 'estimates' | 'orders' | 'expenses' | 'moneyin' | 'moneyout' | 'kot'

interface NavStore {
  currentPage: PageName
  setCurrentPage: (page: PageName) => void
  moreMenuOpen: boolean
  setMoreMenuOpen: (open: boolean) => void
  sideDrawerOpen: boolean
  setSideDrawerOpen: (open: boolean) => void
}

export const useNavStore = create<NavStore>()((set) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page, moreMenuOpen: false, sideDrawerOpen: false }),
  moreMenuOpen: false,
  setMoreMenuOpen: (open) => set({ moreMenuOpen: open }),
  sideDrawerOpen: false,
  setSideDrawerOpen: (open) => set({ sideDrawerOpen: open }),
}))
