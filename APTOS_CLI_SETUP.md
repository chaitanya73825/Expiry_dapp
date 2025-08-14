# 🚀 Aptos CLI Installation Guide for Windows

## 📥 **Method 1: Using Winget (Recommended)**

Open **PowerShell as Administrator** and run:

```powershell
winget install Aptos.CLI
```

## 📥 **Method 2: Direct Download**

1. Go to: https://github.com/aptos-labs/aptos-core/releases
2. Download the latest Windows release (usually `aptos-cli-x.x.x-Windows-x86_64.zip`)
3. Extract the zip file
4. Add the extracted folder to your system PATH
5. Restart your terminal

## 📥 **Method 3: Using Cargo (if you have Rust)**

```bash
cargo install --git https://github.com/aptos-labs/aptos-core.git aptos --branch devnet
```

## ✅ **Verify Installation**

After installation, open a new terminal and run:

```bash
aptos --version
```

You should see something like: `aptos 1.0.x`

## 🔧 **Quick Setup Commands**

Once Aptos CLI is installed, run these commands:

```bash
# Initialize your account (choose devnet when prompted)
aptos init

# Fund your account from faucet
aptos account fund-with-faucet --account default

# Check your balance
aptos account list --query balance

# Check account info
aptos account list
```

## 🚀 **Deploy ExpiryX Contract**

After Aptos CLI is set up, deploy your contract:

```bash
# Navigate to your project
cd c:\Users\chait\hackathon

# Run the deployment script
node scripts/deploy-real-blockchain.js
```

## 🎯 **What You'll Get**

After successful deployment:

- ✅ **Real Aptos blockchain contract**
- ✅ **Permanent permission storage**
- ✅ **No localStorage dependency**
- ✅ **Cross-device synchronization**
- ✅ **Decentralized storage**

## 🔗 **Useful Links**

- **Aptos CLI Docs**: https://aptos.dev/en/build/cli
- **Aptos Explorer**: https://explorer.aptoslabs.com
- **Petra Wallet**: https://petra.app
- **Pontem Wallet**: https://pontem.network/wallet

---

## 🎉 **Ready to Deploy!**

Once you have Aptos CLI installed, your permissions will be stored permanently on the Aptos blockchain with zero dependency on localStorage!
