'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format'
import { getItemEmoji } from '@/lib/menu-images'
import type { MenuItem } from '@/lib/types'

interface MenuPickerProps {
  items: MenuItem[]
  onAdd: (item: MenuItem, qty: number) => void
  disabled?: boolean
}

export function MenuPicker({ items, onAdd, disabled }: MenuPickerProps) {
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState<string>('All')

  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => set.add(i.category))
    return ['All', ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (activeCat !== 'All' && i.category !== activeCat) return false
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [items, search, activeCat])

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu…"
          className="pl-9 bg-white"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              activeCat === c
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Items grid — with images */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto flex-1 pr-1">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15, delay: i * 0.01 }}
          >
            <Card
              className={`overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                disabled || !item.available ? 'opacity-50 pointer-events-none' : ''
              } ${cardColor(item.category)}`}
              onClick={() => !disabled && item.available && onAdd(item, 1)}
            >
              {/* Image / emoji header */}
              <div className="h-16 bg-gradient-to-br from-slate-50 to-slate-100/80 flex items-center justify-center relative overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide broken images and fall back to emoji
                      const target = e.currentTarget
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent && !parent.querySelector('.fallback-emoji')) {
                        const span = document.createElement('span')
                        span.className = 'fallback-emoji text-3xl'
                        span.textContent = getItemEmoji(item.name)
                        parent.appendChild(span)
                      }
                    }}
                  />
                ) : (
                  <span className="text-3xl">{getItemEmoji(item.name)}</span>
                )}
                <Plus className="w-4 h-4 text-slate-500 absolute top-1.5 right-1.5 bg-white/80 rounded-full p-0.5" />
                {!item.available && (
                  <div className="absolute inset-0 bg-rose-900/40 flex items-center justify-center">
                    <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-700 border-rose-200">NA</Badge>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-2">
                <h4 className="font-semibold text-[13px] text-slate-900 leading-tight truncate">{item.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-sm text-slate-900">{formatCurrency(item.price)}</span>
                  <span className="text-[10px] text-slate-500">{item.unit}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-sm text-slate-400">No items match your search</div>
        )}
      </div>
    </div>
  )
}

function cardColor(category: string): string {
  const map: Record<string, string> = {
    Starters: 'bg-amber-50/60 border-amber-200',
    'Main Course': 'bg-rose-50/60 border-rose-200',
    Breads: 'bg-orange-50/60 border-orange-200',
    Beverages: 'bg-sky-50/60 border-sky-200',
    Desserts: 'bg-violet-50/60 border-violet-200',
  }
  return map[category] || 'bg-white border-slate-200'
}
