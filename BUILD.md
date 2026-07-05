# ServingSync POS — Desktop App (.exe) Build Guide

This guide shows you how to build the ServingSync POS desktop app for Windows (.exe), macOS (.dmg), and Linux (.AppImage).

## Prerequisites

1. **Node.js 18+** (or Bun)
2. **npm** or **bun** package manager
3. For Windows .exe: Windows machine (or Linux with Wine)
4. For macOS .dmg: macOS machine

## Quick Build

### Install dependencies
```bash
npm install
# or
bun install
```

### Generate Prisma client
```bash
npm run db:generate
```

### Build the Next.js standalone server
```bash
npm run build
```

### Build the desktop app
```bash
# Windows .exe (run on Windows)
npm run dist:win

# macOS .dmg (run on macOS)
npm run dist:mac

# Linux .AppImage (run on Linux)
npm run dist:linux
```

The installer will be created in the `release/` folder:
- Windows: `release/ServingSync POS Setup 1.0.0.exe`
- macOS: `release/ServingSync POS-1.0.0.dmg`
- Linux: `release/ServingSync POS-1.0.0.AppImage`

## What the Desktop App Does

1. **Bundles the Next.js standalone server** inside the Electron app
2. **Auto-creates a local SQLite database** in `%APPDATA%/ServingSync POS/db/` on first launch
3. **Runs the server on port 3210** (internal, not exposed)
4. **Opens a native desktop window** pointing to the local server
5. **System tray integration** — minimize to tray, quick open
6. **No internet required** — fully offline after installation

## Development Mode

To test the Electron shell during development (without building):
```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start Electron (connects to dev server)
npm run electron:dev
```

## Distribution

### Windows NSIS Installer
The default Windows build creates an NSIS installer (`ServingSync POS Setup.exe`) that:
- Lets users choose installation directory
- Creates desktop shortcut
- Creates Start Menu shortcut
- Includes uninstaller

### Portable Version
For a portable .exe (no install needed), change the win target in `package.json`:
```json
"win": {
  "target": ["portable"]
}
```

### Code Signing (optional, for distribution)
To sign your Windows app:
1. Get a code signing certificate
2. Set environment variables:
   ```bash
   set CSC_LINK=path/to/certificate.pfx
   set CSC_KEY_PASSWORD=yourpassword
   ```
3. Run `npm run dist:win`

## Architecture

```
┌─────────────────────────────────────┐
│         Electron Shell              │
│  ┌───────────────────────────────┐  │
│  │    BrowserWindow (Chromium)   │  │
│  │    ┌─────────────────────┐    │  │
│  │    │  Next.js Frontend   │    │  │
│  │    │  (React + Tailwind) │    │  │
│  │    └─────────────────────┘    │  │
│  └───────────────────────────────┘  │
│               ↕ HTTP                │
│  ┌───────────────────────────────┐  │
│  │   Next.js Standalone Server   │  │
│  │   (port 3210, internal)       │  │
│  │   ┌─────────────────────┐     │  │
│  │   │   Prisma + SQLite   │     │  │
│  │   │   (local DB file)   │     │  │
│  │   └─────────────────────┘     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## File Structure

```
electron/
  main.js          — Electron main process (window, tray, server launcher)
package.json       — electron-builder config in "build" section
prisma/db/         — SQLite database template (copied on first launch)
.next/standalone/  — Bundled Next.js server (created by npm run build)
release/           — Output directory for installers
```

## Troubleshooting

### "Next.js standalone server not found"
Run `npm run build` first — it creates the `.next/standalone/` directory.

### "Prisma client not found"
Run `npm run db:generate` to generate the Prisma client.

### Database issues
The app creates a fresh database in `%APPDATA%/ServingSync POS/db/custom.db` on first launch. To reset: delete this file and restart the app.

### Port 3210 already in use
Change `NEXT_PORT` in `electron/main.js` to a different port.
