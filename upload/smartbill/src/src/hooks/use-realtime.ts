'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'

// ─── Real-Time Hook for SmartBill ───
// Connects to Socket.IO server (port 3001) and auto-invalidates React Query cache
// Works in both Electron and browser mode

interface RealTimeEvent {
  type: string
  data: any
  timestamp: string
}

interface RealTimeState {
  connected: boolean
  latency: number
  lastEvent: RealTimeEvent | null
  events: RealTimeEvent[]
}

const RT_SERVER_URL = 'http://localhost:3001'
const MAX_EVENTS = 50

export function useRealTime() {
  const socketRef = useRef<Socket | null>(null)
  const queryClient = useQueryClient()
  const [state, setState] = useState<RealTimeState>({
    connected: false,
    latency: 0,
    lastEvent: null,
    events: [],
  })

  const addEvent = useCallback((type: string, data: any) => {
    const event: RealTimeEvent = {
      type,
      data,
      timestamp: new Date().toISOString(),
    }
    setState(prev => ({
      ...prev,
      lastEvent: event,
      events: [event, ...prev.events].slice(0, MAX_EVENTS),
    }))
  }, [])

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io(RT_SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })

    socketRef.current = socket

    // ─── Connection Events ───
    socket.on('connect', () => {
      console.log('[SmartBill RT] Connected:', socket.id)
      setState(prev => ({ ...prev, connected: true }))

      // Join dashboard room
      socket.emit('dashboard:join')
    })

    socket.on('disconnect', (reason) => {
      console.log('[SmartBill RT] Disconnected:', reason)
      setState(prev => ({ ...prev, connected: false }))
    })

    socket.on('connected', (data) => {
      console.log('[SmartBill RT] Server welcome:', data)
    })

    // ─── Latency Measurement ───
    socket.on('dashboard:heartbeat', (data) => {
      const latency = Date.now() - new Date(data.serverTime).getTime()
      setState(prev => ({ ...prev, latency: Math.abs(latency) }))
    })

    // ─── Sale Events → Invalidate queries ───
    socket.on('sale:updated', (data) => {
      addEvent('sale:updated', data)
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    })

    socket.on('sale:changed', (data) => {
      addEvent('sale:changed', data)
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    })

    socket.on('sale:removed', (saleId) => {
      addEvent('sale:removed', { id: saleId })
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    })

    socket.on('dashboard:sale-new', (data) => {
      addEvent('dashboard:sale-new', data)
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    })

    socket.on('dashboard:sale-update', (data) => {
      addEvent('dashboard:sale-update', data)
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    })

    // ─── Stock Events ───
    socket.on('stock:changed', (data) => {
      addEvent('stock:changed', data)
      queryClient.invalidateQueries({ queryKey: ['products'] })
    })

    socket.on('stock:low-alert', (data) => {
      addEvent('stock:low-alert', data)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      // Could show toast notification here
    })

    // ─── KOT Events ───
    socket.on('kot:changed', (data) => {
      addEvent('kot:changed', data)
      queryClient.invalidateQueries({ queryKey: ['kots'] })
    })

    socket.on('kot:new-order', (data) => {
      addEvent('kot:new-order', data)
      queryClient.invalidateQueries({ queryKey: ['kots'] })
    })

    socket.on('kot:ready-alert', (data) => {
      addEvent('kot:ready-alert', data)
      queryClient.invalidateQueries({ queryKey: ['kots'] })
    })

    socket.on('kot:status-update', (data) => {
      addEvent('kot:status-update', data)
      queryClient.invalidateQueries({ queryKey: ['kots'] })
    })

    // ─── Expense Events ───
    socket.on('expense:changed', (data) => {
      addEvent('expense:changed', data)
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    })

    // ─── Money In/Out Events ───
    socket.on('moneyin:changed', (data) => {
      addEvent('moneyin:changed', data)
      queryClient.invalidateQueries({ queryKey: ['moneyin'] })
    })

    socket.on('moneyout:changed', (data) => {
      addEvent('moneyout:changed', data)
      queryClient.invalidateQueries({ queryKey: ['moneyout'] })
    })

    // ─── Customer/Supplier Events ───
    socket.on('customer:changed', (data) => {
      addEvent('customer:changed', data)
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    })

    socket.on('supplier:changed', (data) => {
      addEvent('supplier:changed', data)
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    })

    // ─── Settings Events ───
    socket.on('settings:changed', (data) => {
      addEvent('settings:changed', data)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    })

    // ─── Refresh All ───
    socket.on('realtime:refresh', () => {
      addEvent('realtime:refresh', {})
      queryClient.invalidateQueries()
    })

    // ─── Cleanup ───
    return () => {
      socket.emit('dashboard:leave')
      socket.disconnect()
      socketRef.current = null
    }
  }, [queryClient, addEvent])

  // ─── Emit Methods ───
  const emitSaleCreated = useCallback((data: any) => {
    socketRef.current?.emit('sale:created', data)
  }, [])

  const emitSaleUpdated = useCallback((data: any) => {
    socketRef.current?.emit('sale:updated', data)
  }, [])

  const emitSaleDeleted = useCallback((id: string) => {
    socketRef.current?.emit('sale:deleted', id)
  }, [])

  const emitStockUpdated = useCallback((data: any) => {
    socketRef.current?.emit('stock:updated', data)
  }, [])

  const emitKotCreated = useCallback((data: any) => {
    socketRef.current?.emit('kot:created', data)
  }, [])

  const emitKotStatusChanged = useCallback((data: any) => {
    socketRef.current?.emit('kot:status-changed', data)
  }, [])

  const emitExpenseCreated = useCallback((data: any) => {
    socketRef.current?.emit('expense:created', data)
  }, [])

  const emitMoneyInCreated = useCallback((data: any) => {
    socketRef.current?.emit('moneyin:created', data)
  }, [])

  const emitMoneyOutCreated = useCallback((data: any) => {
    socketRef.current?.emit('moneyout:created', data)
  }, [])

  const emitCustomerCreated = useCallback((data: any) => {
    socketRef.current?.emit('customer:created', data)
  }, [])

  const emitSupplierCreated = useCallback((data: any) => {
    socketRef.current?.emit('supplier:created', data)
  }, [])

  const emitSettingsUpdated = useCallback((data: any) => {
    socketRef.current?.emit('settings:updated', data)
  }, [])

  return {
    ...state,
    socket: socketRef.current,
    // Emitters
    emitSaleCreated,
    emitSaleUpdated,
    emitSaleDeleted,
    emitStockUpdated,
    emitKotCreated,
    emitKotStatusChanged,
    emitExpenseCreated,
    emitMoneyInCreated,
    emitMoneyOutCreated,
    emitCustomerCreated,
    emitSupplierCreated,
    emitSettingsUpdated,
  }
}

// ─── Electron-specific hook (IPC bridge) ───
export function useElectronBridge() {
  const [isElectron, setIsElectron] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Check if running in Electron
    const electronAPI = (window as any).electronAPI
    if (electronAPI?.isElectron) {
      setIsElectron(true)

      // Handle navigation from system tray / keyboard shortcuts
      electronAPI.onNavigate((page: string) => {
        // Dispatch custom event that page.tsx listens to
        window.dispatchEvent(new CustomEvent('smartbill:navigate', { detail: page }))
      })

      // Handle search focus
      electronAPI.onFocusSearch(() => {
        window.dispatchEvent(new CustomEvent('smartbill:focus-search'))
      })

      // Handle print
      electronAPI.onPrintBill(() => {
        window.dispatchEvent(new CustomEvent('smartbill:print-bill'))
      })

      // Handle refresh
      electronAPI.onRefreshData(() => {
        queryClient.invalidateQueries()
      })

      // Handle KOT alert
      electronAPI.onKotAlert((data: any) => {
        window.dispatchEvent(new CustomEvent('smartbill:kot-alert', { detail: data }))
      })
    }
  }, [queryClient])

  return { isElectron }
}
