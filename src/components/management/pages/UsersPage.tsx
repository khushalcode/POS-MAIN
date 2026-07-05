'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, UserCog, Loader2, Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/format'
import type { AppUser } from '@/lib/types'

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editUser, setEditUser] = useState<AppUser | null>(null)
  const [delUser, setDelUser] = useState<AppUser | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/users')
    const data = await res.json()
    setUsers(data.users)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (data: any) => {
    const isEdit = !!editUser
    const res = await fetch('/api/users', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEdit ? { ...data, id: editUser!.id } : data),
    })
    if (!res.ok) {
      const e = await res.json()
      toast.error(e.error || 'Failed to save')
      return
    }
    toast.success(isEdit ? 'User updated' : 'User created')
    setShowAdd(false)
    setEditUser(null)
    load()
  }

  const del = async () => {
    if (!delUser) return
    const res = await fetch(`/api/users?id=${delUser.id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete'); return }
    toast.success('User deleted')
    setDelUser(null)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-[10px] sm:text-sm text-slate-500">{users.length} users · {users.filter((u) => u.role === 'admin').length} admins</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-sky-500 to-blue-500 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 bg-white border-slate-200">
          <UserCog className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No users yet</h3>
          <p className="text-sm">Add admin & staff users for login access.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {users.map((u, i) => (
              <motion.div key={u.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.03 }}>
                <Card className="border-0 shadow-md rounded-2xl hover:shadow-lg transition-all group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                          u.role === 'admin' ? 'bg-gradient-to-br from-sky-500 to-blue-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                          {u.role === 'admin' ? <Shield className="w-5 h-5" /> : u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-slate-900">{u.name}</h3>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditUser(u)}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500" onClick={() => setDelUser(u)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={u.role === 'admin' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-slate-50 text-slate-700 border-slate-200'}>
                        {u.role === 'admin' ? 'Administrator' : 'Staff'}
                      </Badge>
                      <Badge variant="outline" className={u.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}>
                        {u.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Added {formatDateTime(u.createdAt)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={showAdd || !!editUser} onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditUser(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
          </DialogHeader>
          <UserForm initial={editUser} onSubmit={save} onCancel={() => { setShowAdd(false); setEditUser(null) }} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!delUser} onOpenChange={(o) => !o && setDelUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete user</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Delete <strong>{delUser?.name}</strong>?</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={del}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: AppUser | null
  onSubmit: (d: any) => Promise<void>
  onCancel: () => void
}) {
  const [f, setF] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    password: '',
    role: initial?.role || 'staff',
    active: initial?.active ?? true,
  })
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!f.name || !f.email) {
      toast.error('Name and email required')
      return
    }
    if (!initial && !f.password) {
      toast.error('Password required for new user')
      return
    }
    setSaving(true)
    try {
      const payload: any = { ...f }
      if (initial && !f.password) delete payload.password
      await onSubmit(payload)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Name</Label>
        <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Full name" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Email</Label>
        <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="user@restaurant.com" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">{initial ? 'New Password (leave blank to keep current)' : 'Password'}</Label>
        <div className="relative">
          <Input
            type={showPass ? 'text' : 'password'}
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Role</Label>
          <Select value={f.role} onValueChange={(v) => setF({ ...f, role: v })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 flex items-end">
          <div className="flex items-center gap-2 pb-1">
            <Switch checked={f.active} onCheckedChange={(c) => setF({ ...f, active: c })} id="active" />
            <Label htmlFor="active" className="text-xs cursor-pointer">Active</Label>
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={submit} disabled={saving} className="flex-1 bg-gradient-to-r from-sky-500 to-blue-500 text-white">
          {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
          {initial ? 'Update' : 'Add'} User
        </Button>
      </div>
    </div>
  )
}
