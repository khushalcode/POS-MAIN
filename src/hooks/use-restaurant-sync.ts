'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type {
  KOTPayload,
  ItemStatusPayload,
  OrderStatusPayload,
  TablePayload,
} from '@/lib/types'

/**
 * useRestaurantSync
 * ------------------
 * Connects to the socket.io restaurant-sync hub (port 3005).
 * Routes Caddy automatically forwards `/?XTransformPort=3005` to the right port.
 *
 * Events the caller can subscribe to:
 *   - kot:new            (kitchen listens)
 *   - kot:item-added     (kitchen listens)
 *   - item:status        (both sides)
 *   - order:status       (both sides)
 *   - table:released     (kitchen listens)
 *   - table:occupied     (kitchen listens)
 *   - data:refresh       (both sides)
 *
 * Methods the caller can use:
 *   - sendKOT(payload)
 *   - sendItemAdded(payload)
 *   - sendItemStatus(payload)
 *   - sendOrderStatus(payload)
 *   - sendTableReleased(payload)
 *   - sendTableOccupied(payload)
 *   - requestDataRefresh(payload?)
 */

type Role = 'counter' | 'kitchen'

interface Handlers {
  onKOTNew?: (p: KOTPayload) => void
  onKOTItemAdded?: (p: KOTPayload) => void
  onItemStatus?: (p: ItemStatusPayload) => void
  onOrderStatus?: (p: OrderStatusPayload) => void
  onTableReleased?: (p: TablePayload) => void
  onTableOccupied?: (p: TablePayload) => void
  onDataRefresh?: (p: unknown) => void
}

export function useRestaurantSync(role: Role, handlers: Handlers) {
  const [connected, setConnected] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const socketRef = useRef<ReturnType<typeof import('socket.io-client').io> | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { io } = await import('socket.io-client')
      const socket = io('/?XTransformPort=3005', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: Infinity,
      })
      if (!mounted) {
        socket.close()
        return
      }
      socketRef.current = socket

      socket.on('connect', () => {
        setConnected(true)
        socket.emit('join', role)
      })
      socket.on('disconnect', () => setConnected(false))
      socket.on('reconnect', () => setConnected(true))

      socket.on('joined', ({ online }: { online: number }) => setOnlineCount(online))

      socket.on('kot:new', (p: KOTPayload) => handlersRef.current.onKOTNew?.(p))
      socket.on('kot:item-added', (p: KOTPayload) => handlersRef.current.onKOTItemAdded?.(p))
      socket.on('item:status', (p: ItemStatusPayload) => handlersRef.current.onItemStatus?.(p))
      socket.on('order:status', (p: OrderStatusPayload) => handlersRef.current.onOrderStatus?.(p))
      socket.on('table:released', (p: TablePayload) => handlersRef.current.onTableReleased?.(p))
      socket.on('table:occupied', (p: TablePayload) => handlersRef.current.onTableOccupied?.(p))
      socket.on('data:refresh', (p: unknown) => handlersRef.current.onDataRefresh?.(p))
    })()

    return () => {
      mounted = false
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [role])

  const sendKOT = useCallback((p: KOTPayload) => {
    socketRef.current?.emit('kot:new', p)
  }, [])
  const sendItemAdded = useCallback((p: KOTPayload) => {
    socketRef.current?.emit('kot:item-added', p)
  }, [])
  const sendItemStatus = useCallback((p: ItemStatusPayload) => {
    socketRef.current?.emit('item:status', p)
  }, [])
  const sendOrderStatus = useCallback((p: OrderStatusPayload) => {
    socketRef.current?.emit('order:status', p)
  }, [])
  const sendTableReleased = useCallback((p: TablePayload) => {
    socketRef.current?.emit('table:released', p)
  }, [])
  const sendTableOccupied = useCallback((p: TablePayload) => {
    socketRef.current?.emit('table:occupied', p)
  }, [])
  const requestDataRefresh = useCallback((p?: unknown) => {
    socketRef.current?.emit('data:refresh', p || {})
  }, [])

  return {
    connected,
    onlineCount,
    sendKOT,
    sendItemAdded,
    sendItemStatus,
    sendOrderStatus,
    sendTableReleased,
    sendTableOccupied,
    requestDataRefresh,
  }
}
