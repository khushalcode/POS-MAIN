@echo off
echo ========================================
echo  ServingSync POS - Windows .exe Builder
echo ========================================
echo.

REM Change to the directory where this .bat file is located
cd /d "%~dp0"

echo Current directory: %cd%
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    echo Make sure you have Node.js installed: https://nodejs.org
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
    echo Trying alternative method (electron-packager)...
    call npx electron-packager . "ServingSync POS" --platform=win32 --arch=x64 --overwrite --prune=true --out=release --ignore="upload|scripts|dev.log|server.log|\.env$|db/custom\.db$|release"
    if %errorlevel% neq 0 (
        echo ERROR: Both build methods failed
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo  BUILD COMPLETE!
echo ========================================
echo.
echo Your .exe is in the "release" folder.
echo.
echo To run: Double-click "ServingSync POS.exe" or "ServingSync POS Setup.exe"
echo.
echo First launch will ask for a license key.
echo Login: super@servingsync.com / admin123
echo.
pause
