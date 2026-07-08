const { Server } = require('socket.io')
const http = require('http')

// ─── Socket.IO Real-Time Server ───
// Runs alongside the Electron main process
// Provides live data push for: sales, stock, KOT, dashboard stats

let io = null
const PORT = 3001 // Separate from Next.js port 3000

function createServer() {
  const server = http.createServer()
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ['websocket', 'polling'],
  })

  // ─── Real-Time Event Handlers ───
  io.on('connection', (socket) => {
    console.log(`[SmartBill RT] Client connected: ${socket.id}`)

    // Send welcome with server time
    socket.emit('connected', {
      serverTime: new Date().toISOString(),
      clientId: socket.id,
    })

    // ─── Dashboard Live Stats ───
    socket.on('dashboard:join', () => {
      socket.join('dashboard-room')
      console.log(`[SmartBill RT] Client ${socket.id} joined dashboard room`)
    })

    socket.on('dashboard:leave', () => {
      socket.leave('dashboard-room')
    })

    // ─── Sale Events ───
    socket.on('sale:created', (saleData) => {
      console.log(`[SmartBill RT] New sale: ${saleData.invoiceNumber}`)
      // Broadcast to all dashboard clients
      io.to('dashboard-room').emit('dashboard:sale-new', {
        ...saleData,
        timestamp: new Date().toISOString(),
      })
      // Broadcast to other clients
      socket.broadcast.emit('sale:updated', saleData)
    })

    socket.on('sale:updated', (saleData) => {
      socket.broadcast.emit('sale:changed', saleData)
      io.to('dashboard-room').emit('dashboard:sale-update', saleData)
    })

    socket.on('sale:deleted', (saleId) => {
      socket.broadcast.emit('sale:removed', saleId)
      io.to('dashboard-room').emit('dashboard:sale-remove', saleId)
    })

    // ─── Stock Events ───
    socket.on('stock:updated', (stockData) => {
      console.log(`[SmartBill RT] Stock updated: ${stockData.productName}`)
      socket.broadcast.emit('stock:changed', stockData)
      io.to('dashboard-room').emit('dashboard:stock-update', stockData)

      // Low stock alert
      if (stockData.stock <= stockData.lowStockThreshold) {
        io.emit('stock:low-alert', {
          productId: stockData.productId,
          productName: stockData.productName,
          currentStock: stockData.stock,
          threshold: stockData.lowStockThreshold,
        })
      }
    })

    // ─── KOT (Kitchen Order Ticket) Events ───
    socket.on('kot:created', (kotData) => {
      console.log(`[SmartBill RT] New KOT: ${kotData.kotNumber}`)
      socket.broadcast.emit('kot:changed', kotData)
      io.emit('kot:new-order', {
        ...kotData,
        timestamp: new Date().toISOString(),
      })
    })

    socket.on('kot:status-changed', (kotData) => {
      console.log(`[SmartBill RT] KOT status: ${kotData.kotNumber} → ${kotData.status}`)
      socket.broadcast.emit('kot:changed', kotData)
      io.emit('kot:status-update', kotData)

      // KOT ready alert for serving
      if (kotData.status === 'ready') {
        io.emit('kot:ready-alert', {
          kotNumber: kotData.kotNumber,
          tableNumber: kotData.tableNumber,
          items: kotData.items,
        })
      }
    })

    // ─── Expense Events ───
    socket.on('expense:created', (expenseData) => {
      socket.broadcast.emit('expense:changed', expenseData)
    })

    // ─── Money In/Out Events ───
    socket.on('moneyin:created', (data) => {
      socket.broadcast.emit('moneyin:changed', data)
    })

    socket.on('moneyout:created', (data) => {
      socket.broadcast.emit('moneyout:changed', data)
    })

    // ─── Customer/Supplier Events ───
    socket.on('customer:created', (data) => {
      socket.broadcast.emit('customer:changed', data)
    })

    socket.on('supplier:created', (data) => {
      socket.broadcast.emit('supplier:changed', data)
    })

    // ─── Settings Events ───
    socket.on('settings:updated', (data) => {
      socket.broadcast.emit('settings:changed', data)
    })

    // ─── Disconnect ───
    socket.on('disconnect', (reason) => {
      console.log(`[SmartBill RT] Client disconnected: ${socket.id} (${reason})`)
    })
  })

  // ─── Periodic Dashboard Push (every 30 seconds) ───
  setInterval(() => {
    if (io) {
      io.to('dashboard-room').emit('dashboard:heartbeat', {
        serverTime: new Date().toISOString(),
        connectedClients: io.sockets.sockets.size,
      })
    }
  }, 30000)

  // Start listening
  server.listen(PORT, () => {
    console.log(`[SmartBill RT] Socket.IO server running on port ${PORT}`)
  })

  return io
}

// ─── Utility: Broadcast from server side ───
function broadcast(event, data) {
  if (io) {
    io.emit(event, data)
  }
}

function broadcastToRoom(room, event, data) {
  if (io) {
    io.to(room).emit(event, data)
  }
}

module.exports = { createServer, broadcast, broadcastToRoom }
