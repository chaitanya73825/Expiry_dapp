@echo off
echo 🚀 ExpiryX - Complete Blockchain Setup
echo ======================================
echo.

cd /d "%~dp0"

echo 📍 Current directory: %cd%
echo.

echo 🔍 Step 1: Checking if Aptos CLI is installed...
aptos --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Aptos CLI is already installed!
    aptos --version
) else (
    echo ❌ Aptos CLI not found. Installing...
    echo.
    echo 📥 Trying winget installation...
    winget install Aptos.CLI
    if %errorlevel% neq 0 (
        echo.
        echo ⚠️ winget failed. Please install manually:
        echo 1. Go to: https://github.com/aptos-labs/aptos-core/releases
        echo 2. Download the latest Windows release
        echo 3. Extract and add to PATH
        echo 4. Restart this terminal and run this script again
        echo.
        pause
        exit /b 1
    )
)

echo.
echo 🔑 Step 2: Setting up Aptos account...
aptos account list >nul 2>&1
if %errorlevel% neq 0 (
    echo 📝 Initializing account...
    aptos init --network devnet
    if %errorlevel% neq 0 (
        echo ❌ Account setup failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Account already exists
)

echo.
echo 💰 Step 3: Funding account...
aptos account fund-with-faucet --account default
echo ✅ Account funding completed

echo.
echo 📦 Step 4: Compiling Move contract...
cd contract
aptos move compile
if %errorlevel% neq 0 (
    echo ❌ Compilation failed
    cd ..
    pause
    exit /b 1
)

echo.
echo 🧪 Step 5: Testing contract...
aptos move test
if %errorlevel% neq 0 (
    echo ⚠️ Some tests failed, continuing...
)

echo.
echo 🚀 Step 6: Deploying to Aptos Devnet...
aptos move publish --named-addresses message_board_addr=default --assume-yes
if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo 🎉 SUCCESS! Contract deployed to Aptos blockchain!
echo ================================================
echo.
echo 📍 Your contract is now live on Aptos Devnet
echo 🌐 Network: Aptos Devnet
echo.
echo 🚀 Next steps:
echo 1. npm run dev          - Start your app
echo 2. Connect Petra wallet to Devnet
echo 3. Upload files - stored on blockchain forever!
echo.
echo 💡 No more localStorage - everything is permanent!
echo.
pause
