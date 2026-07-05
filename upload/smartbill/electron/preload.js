const { contextBridge, ipcRenderer } = require('electron')

// Expose protected APIs to renderer via preload
contextBridge.exposeInMainWorld('electronAPI', {
  // Navigation from system tray / keyboard shortcuts
  onNavigate: (callback) => ipcRenderer.on('navigate', (_event, page) => callback(page)),
  onFocusSearch: (callback) => ipcRenderer.on('focus-search', () => callback()),
  onPrintBill: (callback) => ipcRenderer.on('print-bill', () => callback()),
  onRefreshData: (callback) => ipcRenderer.on('realtime:refresh', () => callback()),
  onKotAlert: (callback) => ipcRenderer.on('kot:alert', (_event, data) => callback(data)),

  // Real-time events
  onSaleUpdated: (callback) => ipcRenderer.on('sale:updated', (_event, data) => callback(data)),
  onStockChanged: (callback) => ipcRenderer.on('stock:changed', (_event, data) => callback(data)),
  onKotChanged: (callback) => ipcRenderer.on('kot:changed', (_event, data) => callback(data)),

  // Emit real-time events
  emitSaleCreated: (data) => ipcRenderer.send('sale:created', data),
  emitStockUpdated: (data) => ipcRenderer.send('stock:updated', data),
  emitKotUpdated: (data) => ipcRenderer.send('kot:updated', data),

  // App info
  isElectron: true,
  platform: process.platform,
})

// Type definition for TypeScript support
// window.electronAPI will be available in renderer
