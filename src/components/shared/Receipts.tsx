'use client'

import { formatDateTime, formatTime, formatCurrency } from '@/lib/format'
import type { Order } from '@/lib/types'

export function KOTReceipt({ order, kotNo }: { order: Order; kotNo: number }) {
  const items = (order.items || []).filter((i) => i.status !== 'cancelled')
  return (
    <div className="p-3 font-mono text-black">
      <div className="center">
        <div className="bold lg">** KOT **</div>
        <div className="bold md">ServingSync Restaurant</div>
        <div className="xs">Kitchen Order Ticket</div>
      </div>
      <div className="double" />
      <div className="row sm">
        <span>KOT No:</span>
        <span className="bold">#{kotNo}</span>
      </div>
      <div className="row sm">
        <span>Table:</span>
        <span className="bold">{order.table?.name || '-'}</span>
      </div>
      <div className="row sm">
        <span>Guests:</span>
        <span>{order.guests}</span>
      </div>
      <div className="row sm">
        <span>Type:</span>
        <span className="bold uppercase">{order.type}</span>
      </div>
      {order.waiterName && (
        <div className="row sm">
          <span>Waiter:</span>
          <span>{order.waiterName}</span>
        </div>
      )}
      <div className="row sm">
        <span>Time:</span>
        <span>{formatTime(order.createdAt)}</span>
      </div>
      <div className="divider" />
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th className="right">Qty</th>
            <th className="right">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>
                {it.name}
                {it.notes && <div className="xs italic">  ↳ {it.notes}</div>}
              </td>
              <td className="right bold">{it.quantity}</td>
              <td className="right uppercase">{it.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider" />
      {order.notes && (
        <div className="sm">
          <span className="bold">Special Notes:</span>
          <br />
          {order.notes}
        </div>
      )}
      <div className="divider" />
      <div className="center xs">
        Generated {formatDateTime(new Date())}
        <br />
        *** Hand to kitchen ***
      </div>
    </div>
  )
}

export function BillReceipt({
  bill,
  restaurantName = 'ServingSync Restaurant',
  restaurantAddr = '123 Main Street · City · 00000',
  restaurantPhone = '+91 98765 43210',
  gstin = '29ABCDE1234F1Z5',
  footerNote = 'Thank you for dining with us!',
}: {
  bill: any
  restaurantName?: string
  restaurantAddr?: string
  restaurantPhone?: string
  gstin?: string
  footerNote?: string
}) {
  const items = bill.order?.items || []
  return (
    <div className="p-3 font-mono text-black">
      <div className="center">
        <div className="bold lg">{restaurantName}</div>
        <div className="xs">{restaurantAddr}</div>
        <div className="xs">Phone: {restaurantPhone}</div>
        <div className="xs">GSTIN: {gstin}</div>
      </div>
      <div className="double" />
      <div className="center bold md">TAX INVOICE</div>
      <div className="divider" />
      <div className="row sm">
        <span>Bill No:</span>
        <span className="bold">#{bill.billNo}</span>
      </div>
      <div className="row sm">
        <span>Table:</span>
        <span>{bill.tableNumber}</span>
      </div>
      <div className="row sm">
        <span>Date:</span>
        <span>{formatDateTime(bill.paidAt)}</span>
      </div>
      <div className="row sm">
        <span>Payment:</span>
        <span className="bold uppercase">{bill.paymentMode}</span>
      </div>
      <div className="divider" />
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th className="right">Qty</th>
            <th className="right">Rate</th>
            <th className="right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {items
            .filter((i: any) => i.status !== 'cancelled')
            .map((it: any) => (
              <tr key={it.id}>
                <td>
                  {it.name}
                  {it.notes && <div className="xs italic">  ↳ {it.notes}</div>}
                </td>
                <td className="right">{it.quantity}</td>
                <td className="right">{it.price.toFixed(2)}</td>
                <td className="right bold">{(it.price * it.quantity).toFixed(2)}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="divider" />
      <div className="row sm">
        <span>Subtotal</span>
        <span className="bold">{formatCurrency(bill.subtotal)}</span>
      </div>
      {bill.taxRate > 0 && (
        <div className="row sm">
          <span>Tax ({bill.taxRate}%)</span>
          <span>{formatCurrency(bill.taxAmount)}</span>
        </div>
      )}
      {bill.serviceCharge > 0 && (
        <div className="row sm">
          <span>Service Charge</span>
          <span>{formatCurrency(bill.serviceCharge)}</span>
        </div>
      )}
      {bill.discount > 0 && (
        <div className="row sm">
          <span>Discount</span>
          <span>- {formatCurrency(bill.discount)}</span>
        </div>
      )}
      <div className="double" />
      <div className="row lg bold">
        <span>TOTAL</span>
        <span>{formatCurrency(bill.total)}</span>
      </div>
      <div className="double" />
      <div className="center xs">
        <div>{footerNote}</div>
        <div className="mt-1">Powered by ServingSync POS</div>
      </div>
    </div>
  )
}
