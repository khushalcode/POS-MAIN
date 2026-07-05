'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Receipt, Wallet, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend,
} from 'recharts'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { useShopFetch } from '@/hooks/use-shop-fetch'

export default function ReportsPage() {
  const shopFetch = useShopFetch()
  const [type, setType] = useState<'daily' | 'monthly' | 'range'>('daily')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const params = new URLSearchParams({ type })
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const res = await shopFetch(`/api/reports?${params.toString()}`)
      const d = await res.json()
      setData(d)
      setLoading(false)
    }
    load()
  }, [type, from, to])

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  const s = data.summary
  const stats = [
    { title: 'Sales Revenue', value: formatCurrency(s.salesRevenue), icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500', sub: `${s.billCount} bills` },
    { title: 'Expenses', value: formatCurrency(s.totalExpenses), icon: Wallet, gradient: 'from-red-500 to-rose-500', sub: 'Operating costs' },
    { title: 'Purchases', value: formatCurrency(s.totalPurchases), icon: Receipt, gradient: 'from-amber-500 to-orange-500', sub: 'Stock purchases' },
    { title: 'Net Profit', value: formatCurrency(s.netProfit), icon: BarChart3, gradient: s.netProfit >= 0 ? 'from-blue-500 to-indigo-500' : 'from-rose-500 to-pink-500', sub: `Avg/bill: ${formatCurrency(s.avgBill)}` },
  ]

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${type}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
          <p className="text-[10px] sm:text-sm text-slate-500">Financial performance analysis</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-3.5 h-3.5 mr-1" /> Export JSON
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md rounded-2xl p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Period</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Today</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="range">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === 'range' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">From</Label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To</Label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9" />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((st, i) => (
          <motion.div key={st.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-0 shadow-md rounded-2xl overflow-hidden relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${st.gradient} opacity-95`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
              <CardContent className="relative p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-white/80 uppercase tracking-wide">{st.title}</span>
                  <st.icon className="w-4 h-4 text-white/80" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">{st.value}</div>
                <div className="text-[10px] text-white/70 mt-1">{st.sub}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-1 px-5 pt-5">
          <CardTitle className="text-sm font-semibold text-slate-900">Sales vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-2 sm:px-4 pb-4">
          {data.dailyBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v: number) => `₹${v}`} axisLine={false} tickLine={false} width={45} />
                <RechartsTooltip
                  formatter={(v: any, name: string) => [formatCurrency(Number(v)), name === 'sales' ? 'Sales' : 'Expenses']}
                  labelFormatter={(l: any) => new Date(l).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sales" name="Sales" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">No data for the period</div>
          )}
        </CardContent>
      </Card>

      {/* Top items + payment breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-1 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-slate-900">Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            <div className="space-y-2">
              {data.topItems.length > 0 ? (
                data.topItems.map((it: any, i: number) => (
                  <div key={it.name} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                      }`}>{i + 1}</div>
                      <span className="text-xs font-medium text-slate-800">{it.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">{it.qty} sold</span>
                      <span className="text-[10px] text-slate-400 ml-2">{formatCurrency(it.revenue)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">No sales in this period</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-1 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-slate-900">Payment Mode Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            <div className="space-y-2">
              {Object.keys(data.byPayment).length > 0 ? (
                Object.entries(data.byPayment).map(([mode, v]: [string, any]) => (
                  <div key={mode} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50">
                    <Badge variant="outline" className="uppercase text-[10px]">{mode}</Badge>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">{formatCurrency(v.total)}</span>
                      <span className="text-[10px] text-slate-400 ml-2">{v.count} bills</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">No bills in this period</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
