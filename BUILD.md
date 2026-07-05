# ServingSync POS — Build Guide

## Your License Keys

20 license keys have been generated. Each is valid for 365 days from activation.
See `download/license-keys.txt` for the full list.

**Super Admin Login:**
- Email: `super@servingsync.com`
- Password: `admin123`

---

## Windows .exe Build

The .exe has been built in `release/win-unpacked/`. 

### To run on Windows:
1. Copy the entire `release/win-unpacked/` folder to a Windows computer
2. Double-click `ServingSync POS.exe`
3. The app will:
   - Auto-create a local SQLite database in `%APPDATA%/ServingSync POS/db/`
   - Ask for a license key (use one from license-keys.txt)
   - Open the login screen
   - Login with super@servingsync.com / admin123

### To build a proper installer (.exe setup) on Windows:
1. Copy this entire project to a Windows computer
2. Double-click `build-exe.bat`
3. This will:
   - Install dependencies
   - Generate Prisma client
   - Build Next.js standalone
   - Create `ServingSync POS Setup 1.0.0.exe` (NSIS installer)
4. The installer creates desktop + Start Menu shortcuts

### Files in the .exe package:
```
release/win-unpacked/
├── ServingSync POS.exe        ← Main app (double-click to run)
├── resources/
│   ├── app.asar               ← Electron main process
│   ├── standalone/            ← Next.js server (bundled)
│   │   ├── server.js
│   │   ├── public/            ← Background images, etc.
│   │   └── node_modules/
│   └── db-template/           ← Fresh database template
├── locales/                   ← Language packs
└── (Electron runtime files)
```

---

## Android APK Build

### Option 1: PWA (Easiest — no APK needed)

The app is a PWA (Progressive Web App). On Android:
1. Open Chrome on your Android phone
2. Go to your app URL (e.g. `http://your-server:3000`)
3. Tap the 3 dots menu → "Add to Home screen"
4. The app installs like a native app with its own icon
5. Works offline, full screen, no browser bar

### Option 2: Generate APK with PWABuilder

1. Deploy your app to a public URL (e.g. using Vercel, Netlify, or ngrok)
2. Go to https://www.pwabuilder.com
3. Enter your app URL
4. Click "Build My PWA" → select "Android"
5. Download the generated `.apk` file
6. Install on any Android device (enable "Install from unknown sources")

### Option 3: Generate APK with Bubblewrap (CLI)

```bash
# Install Bubblewrap CLI
npm install -g @bubblewrap/cli

# Initialize from your deployed PWA URL
bubblewrap init --manifest=https://your-app-url/manifest.json

# Build the APK
bubblewrap build

# The APK will be in app-release-signed.apk
```

### Option 4: Wrap with Capacitor (most control)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Initialize
npx cap init ServingSync POS com.servingsync.pos

# Build the web app
npm run build

# Add Android platform
npx cap add android

# Copy web assets
npx cap copy

# Open in Android Studio to build APK
npx cap open android
# In Android Studio: Build → Build APK
```

---

## Deploying to a Public URL (required for APK)

For the APK to work, your app needs to be accessible from a URL:

### Option A: Vercel (free)
```bash
npm install -g vercel
vercel
```

### Option B: ngrok (temporary tunnel)
```bash
ngrok http 3000
# Gives you a public URL like https://abc123.ngrok.io
```

### Option C: Your own server
Deploy the standalone build to any Node.js server:
```bash
NODE_ENV=production node .next/standalone/server.js
```

---

## Database

The app uses SQLite — a single file at `db/custom.db`.
- On Windows .exe: `%APPDATA%/ServingSync POS/db/custom.db`
- On dev: `/home/z/my-project/db/custom.db`

The database is auto-created on first launch with:
- 2 sample shops (Spice Garden, Belly Bytes)
- 25 menu items per shop
- 11 tables per shop (10 + virtual Direct Counter)
- 1 super admin user
- 20 license keys

### Reset database:
```bash
rm db/custom.db
npx prisma db push
bun run scripts/seed-simple.ts
bun run scripts/seed-license.ts
```
