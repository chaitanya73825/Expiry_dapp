# 🚀 ExpiryX - Deploy to Real Blockchain

Complete guide to deploy ExpiryX to Aptos blockchain for permanent storage without localStorage dependency.

## 🎯 Quick Start (Recommended)

### Option 1: Automatic Setup

```bash
# Double-click this file in Windows Explorer
deploy-to-blockchain.bat
```

### Option 2: Manual Commands

```bash
# 1. Install Aptos CLI
winget install Aptos.CLI

# 2. Setup and deploy
npm run blockchain:setup
```

### Option 3: Step by Step

```bash
# Install Aptos CLI
winget install Aptos.CLI

# Setup Aptos account
aptos init --network devnet

# Fund account
aptos account fund-with-faucet --account default

# Deploy contract
npm run deploy:blockchain
```

## 📋 Prerequisites

- [x] Windows 10/11 with PowerShell
- [x] Node.js installed
- [x] Internet connection
- [x] Petra or Pontem wallet extension

## 🛠️ Installation Methods

### Method 1: winget (Recommended)

```powershell
winget install Aptos.CLI
```

### Method 2: Manual Download

1. Go to: https://github.com/aptos-labs/aptos-core/releases
2. Download `aptos-cli-*-Windows-x86_64.zip`
3. Extract to `C:\aptos-cli\`
4. Add `C:\aptos-cli` to your PATH environment variable
5. Restart terminal

### Method 3: Chocolatey

```powershell
choco install aptos-cli
```

## 🔧 Configuration

After deployment, the system will automatically:

- ✅ Set `BLOCKCHAIN_MODE` to `'real'`
- ✅ Update `REAL_CONTRACT_ADDRESS`
- ✅ Switch from localStorage to blockchain storage
- ✅ Enable permanent file permissions

## 🎮 Usage After Deployment

1. **Start the app:**

   ```bash
   npm run dev
   ```

2. **Connect wallet:**
   - Install Petra or Pontem wallet
   - Switch to **Aptos Devnet**
   - Connect to ExpiryX

3. **Upload files:**
   - Files are now stored on Aptos blockchain
   - Permissions are permanent (no localStorage)
   - Works across devices and browsers

## 🔍 Troubleshooting

### Aptos CLI Not Found

```bash
# Check installation
aptos --version

# If not found, try:
where aptos
```

### Account Issues

```bash
# Reset account
rm -rf ~/.aptos
aptos init --network devnet
```

### Wallet Connection

- Ensure wallet is on **Devnet** (not Mainnet/Testnet)
- Clear browser cache if needed
- Check wallet popup blockers

### Deployment Failures

```bash
# Check account balance
aptos account list --query balance

# Fund account
aptos account fund-with-faucet --account default

# Recompile and deploy
cd contract
aptos move compile
aptos move publish --named-addresses message_board_addr=default
```

## 📊 Verification

After successful deployment:

1. **Check Network Status:**
   - Should show "Real Blockchain - Permanent Storage"
   - Contract address should be visible

2. **Test Permissions:**
   - Upload a file
   - Refresh page
   - File permissions should persist

3. **Blockchain Explorer:**
   - Check transactions on Aptos Explorer
   - Search for your account address

## 🎯 What Changes After Deployment

| Before (localStorage)   | After (Blockchain)   |
| ----------------------- | -------------------- |
| ❌ Data lost on refresh | ✅ Permanent storage |
| ❌ Device-specific      | ✅ Works everywhere  |
| ❌ Can be cleared       | ✅ Immutable         |
| ❌ No real ownership    | ✅ True ownership    |

## 🔐 Security Benefits

- **True Ownership:** Your files are linked to your wallet
- **Immutable:** Permissions cannot be faked or deleted
- **Decentralized:** No single point of failure
- **Transparent:** All actions are on-chain

## 🚀 Production Deployment

For production (mainnet):

1. Change `NETWORK` to `"mainnet"`
2. Fund account with real APT
3. Deploy using same process

## 📞 Support

If deployment fails:

1. Check all prerequisites are installed
2. Ensure wallet is connected to Devnet
3. Try the troubleshooting steps above
4. Check console logs for specific errors

---

🎉 **Success Indicator:** When you see "Real Blockchain - Permanent Storage" in the network status, your ExpiryX is running on the actual Aptos blockchain with permanent file storage!
