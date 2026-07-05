'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getSupabase, shopChannel } from '@/lib/supabase'
import { useSession } from '@/lib/session'
import type {
  KOTPayload,
  ItemStatusPayload,
  OrderStatusPayload,
  TablePayload,
} from '@/lib/types'

/**
 * useRestaurantSync
 * ------------------
 * Uses Supabase Realtime channels for cross-device sync.
 * Works across any network (internet) — counter and kitchen can be on
 * completely different devices/networks and still sync in real-time.
 *
 * Channel is scoped per shop: `shop-{shopId}` so events don't cross shops.
 *
 * Events broadcast:
 *   - kot:new            (kitchen listens)
 *   - kot:item-added     (kitchen listens)
 *   - item:status        (both sides)
 *   - order:status       (both sides)
 *   - table:released     (kitchen listens)
 *   - table:occupied     (kitchen listens)
 *   - data:refresh       (both sides)
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
  const { currentShop } = useSession()
  const [connected, setConnected] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>['channel']> | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!currentShop?.id) return
    const supabase = getSupabase()
    if (!supabase) {
      console.warn('[sync] Supabase not configured — real-time sync disabled')
      return
    }

    const channelName = shopChannel(currentShop.id)
    const channel = supabase.channel(channelName, {
      config: { presence: { key: `${role}-${Math.random().toString(36).slice(2, 8)}` } },
    })

    // Listen to all custom events
    const events: Array<{ name: string; handler: (payload: any) => void }> = [
      { name: 'kot:new', handler: (p) => handlersRef.current.onKOTNew?.(p.payload) },
      { name: 'kot:item-added', handler: (p) => handlersRef.current.onKOTItemAdded?.(p.payload) },
      { name: 'item:status', handler: (p) => handlersRef.current.onItemStatus?.(p.payload) },
      { name: 'order:status', handler: (p) => handlersRef.current.onOrderStatus?.(p.payload) },
      { name: 'table:released', handler: (p) => handlersRef.current.onTableReleased?.(p.payload) },
      { name: 'table:occupied', handler: (p) => handlersRef.current.onTableOccupied?.(p.payload) },
      { name: 'data:refresh', handler: (p) => handlersRef.current.onDataRefresh?.(p.payload) },
    ]

    events.forEach(({ name, handler }) => {
      channel.on('broadcast', { event: name }, (msg: any) => handler(msg))
    })

    // Presence — track online devices
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
        setConnected(true)
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ role, online_at: new Date().toISOString() })
          setConnected(true)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnected(false)
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
      setConnected(false)
    }
  }, [role, currentShop?.id])

  // Broadcast helpers
  const sendKOT = useCallback((p: KOTPayload) => {
    channelRef.current?.send({ type: 'broadcast', event: 'kot:new', payload: p })
  }, [])
  const sendItemAdded = useCallback((p: KOTPayload) => {
    channelRef.current?.send({ type: 'broadcast', event: 'kot:item-added', payload: p })
  }, [])
  const sendItemStatus = useCallback((p: ItemStatusPayload) => {
    channelRef.current?.send({ type: 'broadcast', event: 'item:status', payload: p })
  }, [])
  const sendOrderStatus = useCallback((p: OrderStatusPayload) => {
    channelRef.current?.send({ type: 'broadcast', event: 'order:status', payload: p })
  }, [])
  const sendTableReleased = useCallback((p: TablePayload) => {
    channelRef.current?.send({ type: 'broadcast', event: 'table:released', payload: p })
  }, [])
  const sendTableOccupied = useCallback((p: TablePayload) => {
    channelRef.current?.send({ type: 'broadcast', event: 'table:occupied', payload: p })
  }, [])
  const requestDataRefresh = useCallback((p?: unknown) => {
    channelRef.current?.send({ type: 'broadcast', event: 'data:refresh', payload: p || {} })
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
