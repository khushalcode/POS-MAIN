'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, Receipt, Save, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { ShopSettings } from '@/lib/types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [f, setF] = useState({
    shopName: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    taxRate: '5',
    serviceRate: '0',
    currency: 'Rs.',
    invoicePrefix: 'INV',
    kotPrefix: 'KOT',
    footerNote: 'Thank you for dining with us!',
  })

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data.settings)
      setF({
        shopName: data.settings.shopName || '',
        address: data.settings.address || '',
        phone: data.settings.phone || '',
        email: data.settings.email || '',
        gstin: data.settings.gstin || '',
        taxRate: String(data.settings.taxRate ?? 5),
        serviceRate: String(data.settings.serviceRate ?? 0),
        currency: data.settings.currency || 'Rs.',
        invoicePrefix: data.settings.invoicePrefix || 'INV',
        kotPrefix: data.settings.kotPrefix || 'KOT',
        footerNote: data.settings.footerNote || 'Thank you for dining with us!',
      })
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSettings(data.settings)
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-[10px] sm:text-sm text-slate-500">Configure your restaurant profile & bill format</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
          </Button>
          <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Profile card */}
      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {f.shopName ? f.shopName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-base">{f.shopName || 'ServingSync Restaurant'}</p>
              <p className="text-xs text-slate-500">{f.phone || '+91 XXXXX XXXXX'} {f.gstin && `· GSTIN: ${f.gstin}`}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Default Tax Rate</p>
            <p className="text-lg font-bold text-orange-600">{f.taxRate}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant details */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-3 px-5 pt-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <Store className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-slate-900">Restaurant Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Restaurant Name</Label>
              <Input value={f.shopName} onChange={(e) => setF({ ...f, shopName: e.target.value })} placeholder="ServingSync Restaurant" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="hello@restaurant.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">GSTIN</Label>
              <Input value={f.gstin} onChange={(e) => setF({ ...f, gstin: e.target.value })} placeholder="29ABCDE1234F1Z5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Address</Label>
            <Textarea value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Full restaurant address" rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Bill settings */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-3 px-5 pt-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50">
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-slate-900">Bill & Tax Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Default Tax %</Label>
              <Input type="number" step="0.5" value={f.taxRate} onChange={(e) => setF({ ...f, taxRate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Service Charge %</Label>
              <Input type="number" step="0.5" value={f.serviceRate} onChange={(e) => setF({ ...f, serviceRate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Currency Symbol</Label>
              <Input value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })} placeholder="Rs." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Invoice Prefix</Label>
              <Input value={f.invoicePrefix} onChange={(e) => setF({ ...f, invoicePrefix: e.target.value })} placeholder="INV" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">KOT Prefix</Label>
              <Input value={f.kotPrefix} onChange={(e) => setF({ ...f, kotPrefix: e.target.value })} placeholder="KOT" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Bill Footer Note</Label>
              <Input value={f.footerNote} onChange={(e) => setF({ ...f, footerNote: e.target.value })} placeholder="Thank you!" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
