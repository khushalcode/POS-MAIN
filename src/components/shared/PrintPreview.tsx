'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface PrintPreviewProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  width?: number
}

/**
 * PrintPreview
 * Renders a print-ready receipt (KOT or Bill) in a modal preview,
 * with a Print button that triggers window.print() scoped to the receipt.
 */
export function PrintPreview({ open, onClose, title, subtitle, children, width = 320 }: PrintPreviewProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handlePrint = () => {
    const printContents = document.getElementById('print-area')?.innerHTML
    if (!printContents) return
    const win = window.open('', '_blank', 'width=400,height=600')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; margin: 0; padding: 8px; color: #000; }
            .receipt { width: ${width}px; margin: 0 auto; }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .lg { font-size: 16px; }
            .md { font-size: 13px; }
            .sm { font-size: 11px; }
            .xs { font-size: 10px; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .double { border-top: 2px solid #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; gap: 8px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { text-align: left; padding: 2px 0; }
            th { border-bottom: 1px solid #000; }
            @media print {
              @page { margin: 4mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body><div class="receipt">${printContents}</div></body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
    }, 250)
  }

  if (typeof window === 'undefined') return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            initial={{ scale: 0.96, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 bg-slate-100 flex-1">
              <div id="print-area" className="bg-white shadow-md mx-auto" style={{ width: `${width}px` }}>
                {children}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-white">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Print
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
