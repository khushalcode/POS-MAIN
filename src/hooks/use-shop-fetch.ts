'use client'

import { useCallback } from 'react'
import { useSession } from '@/lib/session'
import { apiUrl } from '@/lib/api-config'

/**
 * useShopFetch
 * Returns a stable fetch wrapper that:
 * 1. Adds X-Shop-Id header for multi-shop filtering
 * 2. Uses apiUrl() so it works on APK (points to hosted server)
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
      return fetch(apiUrl(url), { ...options, headers })
    },
    [shopId]
  )
}
