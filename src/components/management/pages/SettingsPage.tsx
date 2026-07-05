'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Store, Receipt, Save, Loader2, RotateCcw, Palette, Type, Eye, EyeOff,
  AlignLeft, AlignCenter, AlignRight, FileText, ChefHat,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useShopFetch } from '@/hooks/use-shop-fetch'
import { useSession } from '@/lib/session'
import type { ShopSettings } from '@/lib/types'
import { BillReceiptPreview } from '@/components/shared/StylePreviews'

export default function SettingsPage() {
  const { currentShop } = useSession()
  const shopFetch = useShopFetch()
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
    // Bill style
    billShowLogo: true,
    billShowGstin: true,
    billShowPhone: true,
    billShowAddress: true,
    billShowEmail: false,
    billShowDateTime: true,
    billShowWaiter: true,
    billShowCustomer: true,
    billShowKotNo: true,
    billFontSize: 11,
    billHeaderAlign: 'center',
    billExtraNote: '',
    billAccentColor: '#f97316',
    // KOT style
    kotShowLogo: true,
    kotShowWaiter: true,
    kotShowDateTime: true,
    kotShowTable: true,
    kotShowGuests: true,
    kotFontSize: 12,
    kotHeaderAlign: 'center',
    kotAccentColor: '#f97316',
    kotExtraNote: '',
  })

  useEffect(() => {
    const load = async () => {
      const res = await shopFetch('/api/settings')
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
        billShowLogo: data.settings.billShowLogo ?? true,
        billShowGstin: data.settings.billShowGstin ?? true,
        billShowPhone: data.settings.billShowPhone ?? true,
        billShowAddress: data.settings.billShowAddress ?? true,
        billShowEmail: data.settings.billShowEmail ?? false,
        billShowDateTime: data.settings.billShowDateTime ?? true,
        billShowWaiter: data.settings.billShowWaiter ?? true,
        billShowCustomer: data.settings.billShowCustomer ?? true,
        billShowKotNo: data.settings.billShowKotNo ?? true,
        billFontSize: data.settings.billFontSize ?? 11,
        billHeaderAlign: data.settings.billHeaderAlign || 'center',
        billExtraNote: data.settings.billExtraNote || '',
        billAccentColor: data.settings.billAccentColor || '#f97316',
        kotShowLogo: data.settings.kotShowLogo ?? true,
        kotShowWaiter: data.settings.kotShowWaiter ?? true,
        kotShowDateTime: data.settings.kotShowDateTime ?? true,
        kotShowTable: data.settings.kotShowTable ?? true,
        kotShowGuests: data.settings.kotShowGuests ?? true,
        kotFontSize: data.settings.kotFontSize ?? 12,
        kotHeaderAlign: data.settings.kotHeaderAlign || 'center',
        kotAccentColor: data.settings.kotAccentColor || '#f97316',
        kotExtraNote: data.settings.kotExtraNote || '',
      })
      setLoading(false)
    }
    load()
  }, [shopFetch, currentShop?.id])

  const save = async () => {
    setSaving(true)
    try {
      const res = await shopFetch('/api/settings', {
        method: 'PUT',
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
          <p className="text-[10px] sm:text-sm text-slate-500">Configure restaurant profile, bill & KOT styles</p>
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
            <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {f.shopName ? f.shopName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-base">{f.shopName || 'Restaurant'}</p>
              <p className="text-xs text-slate-500">{f.phone || '+91 XXXXX XXXXX'} {f.gstin && `· GSTIN: ${f.gstin}`}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Default Tax Rate</p>
            <p className="text-lg font-bold text-orange-600">{f.taxRate}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Shop / Bill Style / KOT Style */}
      <Tabs defaultValue="shop" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shop" className="text-xs sm:text-sm">
            <Store className="w-3.5 h-3.5 mr-1.5" /> Shop
          </TabsTrigger>
          <TabsTrigger value="bill" className="text-xs sm:text-sm">
            <Receipt className="w-3.5 h-3.5 mr-1.5" /> Bill Style
          </TabsTrigger>
          <TabsTrigger value="kot" className="text-xs sm:text-sm">
            <ChefHat className="w-3.5 h-3.5 mr-1.5" /> KOT Style
          </TabsTrigger>
        </TabsList>

        {/* Shop details tab */}
        <TabsContent value="shop" className="mt-4">
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
                  <Input value={f.shopName} onChange={(e) => setF({ ...f, shopName: e.target.value })} placeholder="Spice Garden" />
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
                  <Label className="text-xs">Currency</Label>
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
        </TabsContent>

        {/* Bill style tab */}
        <TabsContent value="bill" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bill style controls */}
            <Card className="border-0 shadow-md rounded-2xl">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Bill Style</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                {/* Show/hide toggles */}
                <div>
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Show / Hide Elements</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <ToggleRow label="Logo / Shop Name" checked={f.billShowLogo} onChange={(v) => setF({ ...f, billShowLogo: v })} />
                    <ToggleRow label="GSTIN" checked={f.billShowGstin} onChange={(v) => setF({ ...f, billShowGstin: v })} />
                    <ToggleRow label="Phone" checked={f.billShowPhone} onChange={(v) => setF({ ...f, billShowPhone: v })} />
                    <ToggleRow label="Address" checked={f.billShowAddress} onChange={(v) => setF({ ...f, billShowAddress: v })} />
                    <ToggleRow label="Email" checked={f.billShowEmail} onChange={(v) => setF({ ...f, billShowEmail: v })} />
                    <ToggleRow label="Date / Time" checked={f.billShowDateTime} onChange={(v) => setF({ ...f, billShowDateTime: v })} />
                    <ToggleRow label="Waiter Name" checked={f.billShowWaiter} onChange={(v) => setF({ ...f, billShowWaiter: v })} />
                    <ToggleRow label="Customer Name" checked={f.billShowCustomer} onChange={(v) => setF({ ...f, billShowCustomer: v })} />
                    <ToggleRow label="KOT Number" checked={f.billShowKotNo} onChange={(v) => setF({ ...f, billShowKotNo: v })} />
                  </div>
                </div>

                {/* Font size */}
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Type className="w-3 h-3" /> Font Size: {f.billFontSize}px</Label>
                  <input
                    type="range"
                    min={9}
                    max={14}
                    value={f.billFontSize}
                    onChange={(e) => setF({ ...f, billFontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Header alignment */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Header Alignment</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['left', 'center', 'right'] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => setF({ ...f, billHeaderAlign: a })}
                        className={`flex items-center justify-center py-2 rounded-lg border-2 text-xs font-medium ${
                          f.billHeaderAlign === a ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {a === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : a === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                        <span className="ml-1 capitalize">{a}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent color */}
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Palette className="w-3 h-3" /> Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={f.billAccentColor}
                      onChange={(e) => setF({ ...f, billAccentColor: e.target.value })}
                      className="w-12 h-9 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <Input value={f.billAccentColor} onChange={(e) => setF({ ...f, billAccentColor: e.target.value })} className="flex-1" />
                    <div className="flex gap-1">
                      {['#f97316', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6', '#0f172a'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setF({ ...f, billAccentColor: c })}
                          className="w-6 h-6 rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Extra note */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Extra Note (above footer)</Label>
                  <Textarea
                    value={f.billExtraNote}
                    onChange={(e) => setF({ ...f, billExtraNote: e.target.value })}
                    placeholder="e.g. Returns accepted within 7 days with bill"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bill live preview */}
            <Card className="border-0 shadow-md rounded-2xl">
              <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <BillReceiptPreview settings={f} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KOT style tab */}
        <TabsContent value="kot" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-0 shadow-md rounded-2xl">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50">
                    <ChefHat className="w-4 h-4 text-amber-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-900">KOT Style</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Show / Hide Elements</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <ToggleRow label="Logo / Shop Name" checked={f.kotShowLogo} onChange={(v) => setF({ ...f, kotShowLogo: v })} />
                    <ToggleRow label="Waiter Name" checked={f.kotShowWaiter} onChange={(v) => setF({ ...f, kotShowWaiter: v })} />
                    <ToggleRow label="Date / Time" checked={f.kotShowDateTime} onChange={(v) => setF({ ...f, kotShowDateTime: v })} />
                    <ToggleRow label="Table Number" checked={f.kotShowTable} onChange={(v) => setF({ ...f, kotShowTable: v })} />
                    <ToggleRow label="Guests Count" checked={f.kotShowGuests} onChange={(v) => setF({ ...f, kotShowGuests: v })} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Type className="w-3 h-3" /> Font Size: {f.kotFontSize}px</Label>
                  <input
                    type="range"
                    min={10}
                    max={16}
                    value={f.kotFontSize}
                    onChange={(e) => setF({ ...f, kotFontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Header Alignment</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['left', 'center', 'right'] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => setF({ ...f, kotHeaderAlign: a })}
                        className={`flex items-center justify-center py-2 rounded-lg border-2 text-xs font-medium ${
                          f.kotHeaderAlign === a ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {a === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : a === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                        <span className="ml-1 capitalize">{a}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Palette className="w-3 h-3" /> Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={f.kotAccentColor}
                      onChange={(e) => setF({ ...f, kotAccentColor: e.target.value })}
                      className="w-12 h-9 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <Input value={f.kotAccentColor} onChange={(e) => setF({ ...f, kotAccentColor: e.target.value })} className="flex-1" />
                    <div className="flex gap-1">
                      {['#f97316', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6', '#0f172a'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setF({ ...f, kotAccentColor: c })}
                          className="w-6 h-6 rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Extra Note (for kitchen)</Label>
                  <Textarea
                    value={f.kotExtraNote}
                    onChange={(e) => setF({ ...f, kotExtraNote: e.target.value })}
                    placeholder="e.g. Allergies? Note here"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-2xl">
              <CardHeader className="pb-3 px-5 pt-5">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <KotReceiptPreview settings={f} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

// KOT preview (inline to avoid circular imports)
function KotReceiptPreview({ settings }: { settings: any }) {
  const accent = settings.kotAccentColor || '#f97316'
  const fontSize = settings.kotFontSize || 12
  const align = settings.kotHeaderAlign || 'center'

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono" style={{ fontSize: `${fontSize}px` }}>
      {settings.kotShowLogo && (
        <div style={{ textAlign: align as any }} className="mb-1">
          <div className="font-bold text-sm" style={{ color: accent }}>
            {settings.shopName || 'Restaurant Name'}
          </div>
          <div className="text-[10px] text-slate-500">Kitchen Order Ticket</div>
        </div>
      )}
      <div className="border-t-2 border-dashed border-slate-300 my-1.5" style={{ borderTopColor: accent }} />
      <div className="space-y-0.5">
        <Row label="KOT No:" value="#1" />
        {settings.kotShowTable && <Row label="Table:" value="Table 5" />}
        {settings.kotShowGuests && <Row label="Guests:" value="4" />}
        {settings.kotShowWaiter && <Row label="Waiter:" value="Riya" />}
        {settings.kotShowDateTime && <Row label="Time:" value="12:30 PM" />}
      </div>
      <div className="border-t border-dashed border-slate-300 my-1.5" />
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: `1px solid ${accent}` }}>
            <th className="text-left py-0.5">Item</th>
            <th className="text-right">Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Butter Chicken</td><td className="text-right font-bold">1</td></tr>
          <tr><td>Butter Naan</td><td className="text-right font-bold">3</td></tr>
          <tr><td>Masala Chai</td><td className="text-right font-bold">2</td></tr>
        </tbody>
      </table>
      {settings.kotExtraNote && (
        <>
          <div className="border-t border-dashed border-slate-300 my-1.5" />
          <div className="italic text-[10px]">{settings.kotExtraNote}</div>
        </>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-600">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
