const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 ExpiryX Aptos CLI Auto-Installer');
console.log('===================================\n');

// Create a tools directory
const toolsDir = path.join(__dirname, '..', 'tools');
if (!fs.existsSync(toolsDir)) {
    fs.mkdirSync(toolsDir, { recursive: true });
    console.log('📁 Created tools directory');
}

// Check if we're on Windows
const isWindows = process.platform === 'win32';
console.log('🖥️ Platform:', process.platform, isWindows ? '(Windows)' : '');

// Try different installation methods
async function installAptosCliWindows() {
    console.log('📥 Attempting Windows installation methods...\n');
    
    // Method 1: Try winget
    console.log('Method 1: Trying winget...');
    try {
        execSync('winget install Aptos.CLI', { 
            stdio: 'inherit',
            timeout: 60000 
        });
        console.log('✅ Installed via winget!');
        return true;
    } catch (error) {
        console.log('❌ winget failed:', error.message);
    }
    
    // Method 2: Try chocolatey
    console.log('\nMethod 2: Trying chocolatey...');
    try {
        execSync('choco install aptos-cli', { 
            stdio: 'inherit',
            timeout: 60000 
        });
        console.log('✅ Installed via chocolatey!');
        return true;
    } catch (error) {
        console.log('❌ chocolatey failed:', error.message);
    }
    
    // Method 3: Manual download
    console.log('\nMethod 3: Manual download...');
    console.log('📥 Please install manually:');
    console.log('1. Go to: https://github.com/aptos-labs/aptos-core/releases');
    console.log('2. Download the latest Windows release');
    console.log('3. Extract and add to PATH');
    console.log('4. Restart this terminal');
    console.log('5. Run this script again');
    
    return false;
}

// Check if Aptos CLI is already installed
function checkAptosInstalled() {
    try {
        const version = execSync('aptos --version', { encoding: 'utf-8' });
        console.log('✅ Aptos CLI already installed:', version.trim());
        return true;
    } catch (error) {
        console.log('❌ Aptos CLI not found');
        return false;
    }
}

// Setup Aptos account
function setupAccount() {
    console.log('\n🔑 Setting up Aptos account...');
    
    try {
        // Check if account already exists
        execSync('aptos account list', { encoding: 'utf-8' });
        console.log('✅ Account already configured');
        return true;
    } catch (error) {
        console.log('📝 Initializing new account...');
        try {
            execSync('aptos init --network devnet', { 
                stdio: 'inherit' 
            });
            console.log('✅ Account initialized');
            return true;
        } catch (initError) {
            console.error('❌ Account initialization failed');
            return false;
        }
    }
}

// Fund account
function fundAccount() {
    console.log('\n💰 Funding account...');
    
    try {
        execSync('aptos account fund-with-faucet --account default', {
            encoding: 'utf-8',
            timeout: 30000
        });
        console.log('✅ Account funded');
        return true;
    } catch (error) {
        console.log('⚠️ Funding failed (may already have funds)');
        return false;
    }
}

// Check account balance
function checkBalance() {
    try {
        const balance = execSync('aptos account list --query balance', {
            encoding: 'utf-8'
        });
        console.log('💎 Balance:', balance.trim());
        return true;
    } catch (error) {
        console.log('⚠️ Could not check balance');
        return false;
    }
}

// Create a simple deployment command
function createDeployScript() {
    const deployScript = `@echo off
echo 🚀 Deploying ExpiryX to Aptos Blockchain...
echo.

cd /d "${process.cwd()}"

echo 📦 Compiling contract...
cd contract
aptos move compile
if %errorlevel% neq 0 (
    echo ❌ Compilation failed
    pause
    exit /b 1
)

echo 🧪 Testing contract...
aptos move test
if %errorlevel% neq 0 (
    echo ⚠️ Some tests failed, continuing...
)

echo 🚀 Deploying to devnet...
aptos move publish --named-addresses message_board_addr=default
if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment completed!
echo 💡 Remember to connect your wallet and switch to Real Chain mode
echo.
pause
`;
    
    fs.writeFileSync('deploy-contract.bat', deployScript);
    console.log('✅ Created deploy-contract.bat');
}

// Main function
async function main() {
    try {
        // Check if already installed
        if (checkAptosInstalled()) {
            console.log('✅ Aptos CLI is ready!');
        } else {
            // Try to install
            if (isWindows) {
                const installed = await installAptosCliWindows();
                if (!installed) {
                    console.log('\n❌ Auto-installation failed');
                    console.log('Please install manually and run this script again');
                    return;
                }
            } else {
                console.log('❌ Auto-installation only supports Windows currently');
                console.log('Please install Aptos CLI manually for your platform');
                return;
            }
        }
        
        // Setup account
        if (!setupAccount()) {
            console.log('❌ Account setup failed');
            return;
        }
        
        // Fund account
        fundAccount();
        
        // Check balance
        checkBalance();
        
        // Create deployment script
        createDeployScript();
        
        console.log('\n🎉 Setup Complete!');
        console.log('==================');
        console.log('');
        console.log('🚀 Ready to deploy! Choose one:');
        console.log('');
        console.log('Option 1 - Node.js script:');
        console.log('  node scripts/deploy-real-blockchain.js');
        console.log('');
        console.log('Option 2 - Batch file:');
        console.log('  deploy-contract.bat');
        console.log('');
        console.log('🎯 After deployment:');
        console.log('1. Start your app: npm run dev');
        console.log('2. Connect Petra/Pontem wallet');
        console.log('3. Upload files → stored on blockchain!');
        
    } catch (error) {
        console.error('❌ Installation script failed:', error);
    }
}

main();
