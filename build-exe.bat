@echo off
echo ========================================
echo  ServingSync POS - Windows .exe Builder
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo Step 2: Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed
    pause
    exit /b 1
)

echo.
echo Step 3: Building Next.js standalone...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Next.js build failed
    pause
    exit /b 1
)

echo.
echo Step 4: Building Electron .exe installer...
call npx electron-builder --win --x64
if %errorlevel% neq 0 (
    echo ERROR: Electron build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo  BUILD COMPLETE!
echo ========================================
echo.
echo Your .exe installer is in: release\ServingSync POS Setup 1.0.0.exe
echo.
echo Copy this .exe to any Windows computer and double-click to install.
echo The app will:
echo   - Auto-create a local database
echo   - Ask for a license key on first launch
echo   - Work completely offline after activation
echo.
pause
