# ExpiryX Aptos CLI Installation Script
# Run this as Administrator

Write-Host "🚀 Installing Aptos CLI for ExpiryX..." -ForegroundColor Green
Write-Host ""

# Check if running as administrator
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]$currentUser
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ This script needs to be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Try to install using winget
try {
    Write-Host "📥 Installing Aptos CLI using winget..." -ForegroundColor Blue
    winget install Aptos.CLI
    Write-Host "✅ Aptos CLI installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Winget installation failed" -ForegroundColor Red
    Write-Host "📥 Please manually download from: https://github.com/aptos-labs/aptos-core/releases" -ForegroundColor Yellow
    Read-Host "Press Enter to continue after manual installation"
}

# Verify installation
Write-Host ""
Write-Host "🔍 Verifying installation..." -ForegroundColor Blue

try {
    $version = & aptos --version 2>&1
    Write-Host "✅ Aptos CLI version: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Aptos CLI not found in PATH" -ForegroundColor Red
    Write-Host "You may need to restart your terminal or add aptos to your PATH" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

# Initialize account
Write-Host ""
Write-Host "🔑 Setting up Aptos account..." -ForegroundColor Blue

try {
    & aptos init --network devnet
    Write-Host "✅ Account initialized!" -ForegroundColor Green
} catch {
    Write-Host "❌ Account initialization failed" -ForegroundColor Red
    Write-Host "You may need to run 'aptos init' manually" -ForegroundColor Yellow
}

# Fund account
Write-Host ""
Write-Host "💰 Funding account from devnet faucet..." -ForegroundColor Blue

try {
    & aptos account fund-with-faucet --account default
    Write-Host "✅ Account funded!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Faucet funding failed (account may already have funds)" -ForegroundColor Yellow
}

# Check balance
Write-Host ""
Write-Host "💎 Checking account balance..." -ForegroundColor Blue

try {
    $balance = & aptos account list --query balance 2>&1
    Write-Host "Balance: $balance" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️ Could not check balance" -ForegroundColor Yellow
}

# Final instructions
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next step: Deploy your blockchain contract" -ForegroundColor Yellow
Write-Host "Run this command in your project directory:" -ForegroundColor White
Write-Host ""
Write-Host "  node scripts/deploy-real-blockchain.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Your project directory:" -ForegroundColor White
Write-Host "  c:\Users\chait\hackathon" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
