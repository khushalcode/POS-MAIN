'use client'

import { useCallback } from 'react'
import { useSession } from '@/lib/session'

/**
 * useShopFetch
 * Returns a stable fetch wrapper that automatically adds the X-Shop-Id header
 * for all multi-shop API calls. Re-created only when shopId changes.
 */
export function useShopFetch() {
  const { currentShop } = useSession()
  const shopId = currentShop?.id

  return useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers)
      if (shopId) headers.set('X-Shop-Id', shopId)
      if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
      return fetch(url, { ...options, headers })
    },
    [shopId]
  )
}
