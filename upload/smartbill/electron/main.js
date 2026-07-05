const { app, BrowserWindow, Tray, Menu, nativeImage, shell, globalShortcut, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const http = require('http')
const { spawn } = require('child_process')
const { createServer } = require('./server')

let mainWindow = null
let tray = null
let io = null
let nextServerProcess = null
const NEXT_PORT = 3210

// ─── First-run DB setup ───
// A packaged app has no Prisma CLI to run migrations, so we ship a
// pre-migrated SQLite template and copy it into userData on first launch.
function ensureDatabase() {
  const dbDir = path.join(app.getPath('userData'), 'db')
  const dbPath = path.join(dbDir, 'custom.db')

  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

  if (!fs.existsSync(dbPath)) {
    const templateDbPath = app.isPackaged
      ? path.join(process.resourcesPath, 'db-template', 'custom.db')
      : path.join(__dirname, '..', 'db', 'custom.db')

    if (fs.existsSync(templateDbPath)) {
      fs.copyFileSync(templateDbPath, dbPath)
    } else {
      console.warn('[SmartBill] No template DB found at', templateDbPath, '- starting with an empty database file')
      fs.closeSync(fs.openSync(dbPath, 'w'))
    }
  }

  return dbPath
}

// ─── Poll until the Next.js server responds ───
function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(url, (res) => {
        res.resume()
        resolve()
      })
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Next.js server did not start in time'))
        } else {
          setTimeout(tryOnce, 300)
        }
      })
    }
    tryOnce()
  })
}

// ─── Launch the bundled standalone Next.js server ───
function startNextServer() {
  return new Promise((resolve, reject) => {
    const dbPath = ensureDatabase()

    const standaloneRoot = app.isPackaged
      ? path.join(process.resourcesPath, 'standalone')
      : path.join(__dirname, '..', '.next', 'standalone')
    const serverEntry = path.join(standaloneRoot, 'server.js')

    if (!fs.existsSync(serverEntry)) {
      reject(new Error(
        `Next.js standalone server not found at:\n${serverEntry}\n\n` +
        `Run "npm run build" (with output: 'standalone' in next.config.ts) before starting/packaging the desktop app.`
      ))
      return
    }

    nextServerProcess = spawn(process.execPath, [serverEntry], {
      cwd: standaloneRoot,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(NEXT_PORT),
        HOSTNAME: '127.0.0.1',
        DATABASE_URL: `file:${dbPath}`,
        ELECTRON_RUN_AS_NODE: '1',
      },
      stdio: 'pipe',
    })

    nextServerProcess.stdout.on('data', (d) => console.log('[Next]', d.toString().trim()))
    nextServerProcess.stderr.on('data', (d) => console.error('[Next]', d.toString().trim()))
    nextServerProcess.on('error', (err) => reject(err))
    nextServerProcess.on('exit', (code) => {
      console.log('[SmartBill] Next.js server exited with code', code)
    })

    waitForServer(`http://127.0.0.1:${NEXT_PORT}`).then(resolve).catch(reject)
  })
}

function stopNextServer() {
  if (nextServerProcess && !nextServerProcess.killed) {
    nextServerProcess.kill()
    nextServerProcess = null
  }
}

// ─── Window Management ───
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'SmartBill - Billing & POS',
    icon: getIconPath(),
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Load the Next.js app
  const isDev = !app.isPackaged
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    try {
      await startNextServer()
      mainWindow.loadURL(`http://127.0.0.1:${NEXT_PORT}`)
    } catch (err) {
      console.error('[SmartBill] Failed to start Next.js server:', err)
      dialog.showErrorBox('SmartBill failed to start', String(err && err.message ? err.message : err))
      app.quit()
      return
    }
  }

  // Show window when ready (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  // Handle window state
  mainWindow.on('minimize', (event) => {
    event.preventDefault()
    mainWindow.hide()
  })
}

function getIconPath() {
  const iconPath = path.join(__dirname, '..', 'public', 'logo.svg')
  if (require('fs').existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath)
  }
  return nativeImage.createEmpty()
}

// ─── System Tray ───
function createTray() {
  const icon = getIconPath()
  tray = new Tray(icon.isEmpty() ? nativeImage.createFromBuffer(Buffer.alloc(0)) : icon)

  const contextMenu = Menu.buildFromTemplate([
    { label: '📊 Open SmartBill', click: () => { mainWindow?.show(); mainWindow?.focus() } },
    { type: 'separator' },
    { label: '💰 New Sale', click: () => { mainWindow?.show(); mainWindow?.webContents.send('navigate', 'sales') } },
    { label: '📦 Items', click: () => { mainWindow?.show(); mainWindow?.webContents.send('navigate', 'products') } },
    { label: '📋 Sale List', click: () => { mainWindow?.show(); mainWindow?.webContents.send('navigate', 'history') } },
    { type: 'separator' },
    { label: '🔄 Refresh Data', click: () => { mainWindow?.webContents.send('realtime:refresh') } },
    { type: 'separator' },
    { label: '❌ Quit', click: () => { app.isQuitting = true; app.quit() } },
  ])

  tray.setToolTip('SmartBill - Billing & POS')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

// ─── Keyboard Shortcuts ───
function registerShortcuts() {
  globalShortcut.register('F1', () => {
    mainWindow?.show()
    mainWindow?.webContents.send('navigate', 'sales')
  })

  globalShortcut.register('F2', () => {
    mainWindow?.show()
    mainWindow?.webContents.send('navigate', 'products')
  })

  globalShortcut.register('F3', () => {
    mainWindow?.show()
    mainWindow?.webContents.send('navigate', 'history')
  })

  globalShortcut.register('F4', () => {
    mainWindow?.show()
    mainWindow?.webContents.send('navigate', 'dashboard')
  })

  globalShortcut.register('CommandOrControl+N', () => {
    mainWindow?.webContents.send('navigate', 'sales')
  })

  globalShortcut.register('CommandOrControl+F', () => {
    mainWindow?.webContents.send('focus-search')
  })

  globalShortcut.register('CommandOrControl+P', (e) => {
    mainWindow?.webContents.send('print-bill')
  })
}

// ─── App Lifecycle ───
app.whenReady().then(async () => {
  // Start Socket.IO real-time server
  io = createServer()

  await createWindow()
  createTray()
  registerShortcuts()

  // macOS: re-create window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })

  // Push real-time events to renderer
  if (io) {
    io.on('connection', (socket) => {
      console.log('[SmartBill] Real-time client connected:', socket.id)

      socket.on('sale:created', (data) => {
        socket.broadcast.emit('sale:updated', data)
        if (mainWindow && !mainWindow.isFocused()) {
          mainWindow.flashFrame(true)
        }
      })

      socket.on('stock:updated', (data) => {
        socket.broadcast.emit('stock:changed', data)
      })

      socket.on('kot:updated', (data) => {
        socket.broadcast.emit('kot:changed', data)
        if (mainWindow) {
          mainWindow.webContents.send('kot:alert', data)
        }
      })

      socket.on('dashboard:subscribe', () => {
        socket.join('dashboard')
      })
    })
  }
})

// Cleanup
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  app.isQuitting = true
  globalShortcut.unregisterAll()
  if (io) io.close()
  stopNextServer()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event) => {
    event.preventDefault()
  })
})
