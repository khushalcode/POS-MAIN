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

  // Group items by category — NO "All" tab, show each category as a section
  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    items.forEach((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return
      const arr = map.get(item.category) || []
      arr.push(item)
      map.set(item.category, arr)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [items, search])

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu…"
          className="pl-9 bg-white"
        />
      </div>

      {/* Items grouped by category — each category is a section */}
      <div className="overflow-y-auto flex-1 pr-1 space-y-4">
        {grouped.map(([category, catItems]) => (
          <div key={category}>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 py-1.5 px-1">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{category}</h3>
              <span className="text-[10px] text-slate-400">({catItems.length})</span>
            </div>
            {/* Items grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {catItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, delay: i * 0.01 }}
                >
                  <Card
                    className={`overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      disabled || !item.available ? 'opacity-50 pointer-events-none' : ''
                    } ${cardColor(category)}`}
                    onClick={() => !disabled && item.available && onAdd(item, 1)}
                  >
                    <div className="h-14 bg-gradient-to-br from-slate-50 to-slate-100/80 flex items-center justify-center relative overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent && !parent.querySelector('.fallback-emoji')) {
                              const span = document.createElement('span')
                              span.className = 'fallback-emoji text-2xl'
                              span.textContent = getItemEmoji(item.name)
                              parent.appendChild(span)
                            }
                          }}
                        />
                      ) : (
                        <span className="text-2xl">{getItemEmoji(item.name)}</span>
                      )}
                      <Plus className="w-3.5 h-3.5 text-slate-500 absolute top-1 right-1 bg-white/80 rounded-full p-0.5" />
                      {!item.available && (
                        <div className="absolute inset-0 bg-rose-900/40 flex items-center justify-center">
                          <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-700 border-rose-200">NA</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h4 className="font-semibold text-[12px] text-slate-900 leading-tight truncate">{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-sm text-slate-900">{formatCurrency(item.price)}</span>
                        <span className="text-[9px] text-slate-500">{item.unit}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400">No items match your search</div>
        )}
      </div>
    </div>
  )
}

function cardColor(category: string): string {
  const map: Record<string, string> = {
    Sandwich: 'bg-amber-50/60 border-amber-200',
    Pizza: 'bg-rose-50/60 border-rose-200',
    Maggie: 'bg-orange-50/60 border-orange-200',
    Momos: 'bg-sky-50/60 border-sky-200',
    Burgers: 'bg-amber-50/60 border-amber-200',
    'Chips & Fries': 'bg-yellow-50/60 border-yellow-200',
    Drinks: 'bg-blue-50/60 border-blue-200',
    Juices: 'bg-emerald-50/60 border-emerald-200',
    Shakes: 'bg-violet-50/60 border-violet-200',
  }
  return map[category] || 'bg-white border-slate-200'
}
