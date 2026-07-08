import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Seed products
    const products = [
      { name: 'Basmati Rice', category: 'Grocery', unit: 'Kg', price: 120, stock: 50, image: '/products/rice.png' },
      { name: 'Sunflower Oil', category: 'Grocery', unit: 'Ltr', price: 180, stock: 30, image: '/products/oil.png' },
      { name: 'Wheat Flour', category: 'Grocery', unit: 'Kg', price: 45, stock: 100, image: '/products/flour.png' },
      { name: 'Sugar', category: 'Grocery', unit: 'Kg', price: 40, stock: 80, image: '/products/sugar.png' },
      { name: 'Tea Powder', category: 'Grocery', unit: '250g', price: 220, stock: 40, image: '/products/tea.png' },
      { name: 'Milk', category: 'Dairy', unit: 'Ltr', price: 60, stock: 25, image: '/products/milk.png' },
      { name: 'Dal Toor', category: 'Grocery', unit: 'Kg', price: 110, stock: 60, image: '/products/dal.png' },
      { name: 'Salt', category: 'Grocery', unit: 'Kg', price: 20, stock: 200, image: '/products/salt.png' },
      { name: 'Shampoo', category: 'Personal Care', unit: 'Pcs', price: 150, stock: 35, image: '/products/shampoo.png' },
      { name: 'Soap', category: 'Personal Care', unit: 'Pcs', price: 30, stock: 100, image: '/products/soap.png' },
      { name: 'Toothpaste', category: 'Personal Care', unit: 'Pcs', price: 80, stock: 45, image: '/products/toothpaste.png' },
      { name: 'Detergent', category: 'Household', unit: 'Kg', price: 120, stock: 30, image: '/products/detergent.png' },
    ]
    
    // Check if products already exist
    const existing = await db.product.count()
    if (existing > 0) {
      return NextResponse.json({ message: 'Data already seeded', count: existing })
    }
    
    for (const p of products) {
      await db.product.create({ data: p })
    }
    
    // Seed shop settings
    await db.shopSetting.create({
      data: {
        shopName: 'SmartBill',
        address: '123 Market Street, City',
        phone: '+91 98765 43210',
        email: 'shop@smartbill.com',
        taxRate: 5,
        currency: 'Rs.',
        invoicePrefix: 'INV',
      },
    })
    
    // Seed admin user
    await db.appUser.create({
      data: {
        name: 'Admin',
        email: 'admin@smartbill.com',
        role: 'admin',
        password: 'admin123',
      },
    })
    
    // Seed sample customers
    const customers = [
      { name: 'Rahul Sharma', phone: '+91 99887 76655', email: 'rahul@example.com' },
      { name: 'Priya Patel', phone: '+91 88776 65544', email: 'priya@example.com' },
      { name: 'Amit Kumar', phone: '+91 77665 54433' },
    ]
    for (const c of customers) {
      await db.customer.create({ data: c })
    }
    
    // Seed sample suppliers
    const suppliers = [
      { name: 'Fresh Foods Ltd', phone: '+91 11122 23344', email: 'orders@freshfoods.com' },
      { name: 'Global Distributors', phone: '+91 22233 34455', email: 'sales@globaldist.com' },
    ]
    for (const s of suppliers) {
      await db.supplier.create({ data: s })
    }
    
    // Seed sample sales
    const saleData = [
      { items: [
        { productId: '1', name: 'Basmati Rice', unit: 'Kg', quantity: 2, price: 120, total: 240 },
        { productId: '2', name: 'Sunflower Oil', unit: 'Ltr', quantity: 1, price: 180, total: 180 },
      ], subtotal: 420, tax: 21, grandTotal: 441, customerName: 'Rahul Sharma', paymentMode: 'Cash' },
      { items: [
        { productId: '5', name: 'Tea Powder', unit: '250g', quantity: 1, price: 220, total: 220 },
        { productId: '6', name: 'Milk', unit: 'Ltr', quantity: 3, price: 60, total: 180 },
      ], subtotal: 400, tax: 20, grandTotal: 420, customerName: 'Priya Patel', paymentMode: 'UPI' },
    ]
    
    let invNum = 1
    for (const s of saleData) {
      const invoiceNumber = `INV-${String(invNum).padStart(6, '0')}`
      invNum++
      const saleDate = new Date()
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 5))
      await db.sale.create({
        data: {
          invoiceNumber,
          customerName: s.customerName,
          subtotal: s.subtotal,
          discount: 0,
          tax: s.tax,
          taxRate: 5,
          grandTotal: s.grandTotal,
          paymentMode: s.paymentMode,
          createdAt: saleDate,
          items: {
            create: s.items,
          },
        },
      })
    }
    
    // Seed sample purchases
    const purchaseData = [
      { supplierName: 'Fresh Foods Ltd', subtotal: 5000, tax: 250, grandTotal: 5250, paymentMode: 'Cash', status: 'completed' },
      { supplierName: 'Global Distributors', subtotal: 8200, tax: 410, grandTotal: 8610, paymentMode: 'UPI', status: 'completed' },
      { supplierName: 'Fresh Foods Ltd', subtotal: 3400, tax: 170, grandTotal: 3570, paymentMode: 'Card', status: 'pending' },
    ]
    let purNum = 1
    for (const p of purchaseData) {
      const invoiceNumber = `PUR-${String(purNum).padStart(6, '0')}`
      purNum++
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 10))
      await db.purchase.create({ data: { ...p, invoiceNumber, createdAt: d } })
    }

    // Seed sample estimates
    const estimateData = [
      { customerName: 'Rahul Sharma', subtotal: 1200, discount: 50, tax: 57.5, grandTotal: 1207.5, status: 'sent', validUntil: new Date(Date.now() + 30 * 86400000) },
      { customerName: 'Priya Patel', subtotal: 800, discount: 0, tax: 40, grandTotal: 840, status: 'draft', validUntil: new Date(Date.now() + 15 * 86400000) },
      { customerName: 'Amit Kumar', subtotal: 2500, discount: 100, tax: 120, grandTotal: 2520, status: 'accepted', validUntil: new Date(Date.now() + 7 * 86400000) },
    ]
    let estNum = 1
    for (const e of estimateData) {
      const estimateNumber = `EST-${String(estNum).padStart(6, '0')}`
      estNum++
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 5))
      await db.estimate.create({ data: { ...e, estimateNumber, createdAt: d } })
    }

    // Seed sample orders
    const orderData = [
      { customerName: 'Rahul Sharma', subtotal: 3500, advance: 1000, balance: 2500, status: 'pending', deliveryDate: new Date(Date.now() + 3 * 86400000) },
      { customerName: 'Priya Patel', subtotal: 1800, advance: 1800, balance: 0, status: 'delivered', deliveryDate: new Date(Date.now() - 2 * 86400000) },
      { customerName: 'Amit Kumar', subtotal: 5000, advance: 2000, balance: 3000, status: 'processing', deliveryDate: new Date(Date.now() + 5 * 86400000) },
    ]
    let ordNum = 1
    for (const o of orderData) {
      const orderNumber = `ORD-${String(ordNum).padStart(6, '0')}`
      ordNum++
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 5))
      await db.order.create({ data: { ...o, orderNumber, createdAt: d } })
    }

    // Seed sample expenses
    const expenseData = [
      { category: 'Rent', description: 'Shop rent for this month', amount: 15000, paymentMode: 'Bank Transfer', date: new Date() },
      { category: 'Utilities', description: 'Electricity bill', amount: 3500, paymentMode: 'UPI', date: new Date() },
      { category: 'Transport', description: 'Delivery vehicle fuel', amount: 2000, paymentMode: 'Cash', date: new Date() },
      { category: 'Salary', description: 'Staff salary - January', amount: 25000, paymentMode: 'Bank Transfer', date: new Date() },
      { category: 'Maintenance', description: 'AC servicing', amount: 1500, paymentMode: 'Cash', date: new Date() },
    ]
    for (const ex of expenseData) {
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 10))
      await db.expense.create({ data: { ...ex, date: d } })
    }

    // Seed sample money in
    const moneyInData = [
      { amount: 5000, source: 'Cash Sale', description: 'Extra cash from counter', paymentMode: 'Cash' },
      { amount: 10000, source: 'Party Payment', description: 'Payment from Rahul Sharma', partyName: 'Rahul Sharma', paymentMode: 'UPI' },
      { amount: 3000, source: 'Other', description: 'Interest earned', paymentMode: 'Bank Transfer' },
    ]
    for (const mi of moneyInData) {
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 5))
      await db.moneyIn.create({ data: { ...mi, date: d } })
    }

    // Seed sample money out
    const moneyOutData = [
      { amount: 8000, purpose: 'Party Payment', description: 'Payment to Fresh Foods Ltd', partyName: 'Fresh Foods Ltd', paymentMode: 'UPI' },
      { amount: 2000, purpose: 'Expense', description: 'Office supplies', paymentMode: 'Cash' },
      { amount: 5000, purpose: 'Withdrawal', description: 'Owner withdrawal', paymentMode: 'Bank Transfer' },
    ]
    for (const mo of moneyOutData) {
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 5))
      await db.moneyOut.create({ data: { ...mo, date: d } })
    }

    // Seed sample KOTs
    const kotData = [
      { tableNumber: 'T1', status: 'ready', items: 'Basmati Rice x2, Dal Toor x1' },
      { tableNumber: 'T3', status: 'pending', items: 'Tea Powder x1, Milk x2' },
      { tableNumber: 'T5', status: 'served', items: 'Sunflower Oil x1, Sugar x3' },
    ]
    let kotNum = 1
    for (const k of kotData) {
      const kotNumber = `KOT-${String(kotNum).padStart(6, '0')}`
      kotNum++
      const d = new Date(); d.setMinutes(d.getMinutes() - Math.floor(Math.random() * 60))
      await db.kot.create({ data: { ...k, kotNumber, createdAt: d } })
    }

    return NextResponse.json({ message: 'Data seeded successfully' })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed data', details: error.message }, { status: 500 })
  }
}
