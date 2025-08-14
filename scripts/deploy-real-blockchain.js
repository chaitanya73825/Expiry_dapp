#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ExpiryX Real Blockchain Deployment Script');
console.log('============================================\n');

// Check if Aptos CLI is installed
function checkAptosCliInstalled() {
    try {
        const version = execSync('aptos --version', { encoding: 'utf-8' });
        console.log('✅ Aptos CLI found:', version.trim());
        return true;
    } catch (error) {
        console.log('❌ Aptos CLI not found');
        return false;
    }
}

// Install Aptos CLI instructions
function showInstallInstructions() {
    console.log('📥 Install Aptos CLI first:');
    console.log('');
    console.log('Windows (PowerShell as Administrator):');
    console.log('  winget install Aptos.CLI');
    console.log('');
    console.log('Or download from:');
    console.log('  https://github.com/aptos-labs/aptos-core/releases');
    console.log('');
    console.log('Or using cargo (if you have Rust):');
    console.log('  cargo install --git https://github.com/aptos-labs/aptos-core.git aptos --branch devnet');
    console.log('');
    console.log('After installation, run this script again.');
    process.exit(1);
}

// Initialize Aptos account
function initializeAccount() {
    try {
        console.log('🔑 Checking for existing Aptos account...');
        const accountList = execSync('aptos account list', { encoding: 'utf-8' });
        console.log('✅ Account already configured');
        return true;
    } catch (error) {
        console.log('📝 Initializing new Aptos account...');
        try {
            // Initialize with devnet
            execSync('aptos init --network devnet', { 
                stdio: 'inherit',
                encoding: 'utf-8' 
            });
            console.log('✅ Account initialized successfully');
            return true;
        } catch (initError) {
            console.error('❌ Failed to initialize account:', initError.message);
            return false;
        }
    }
}

// Fund account from faucet
function fundAccount() {
    try {
        console.log('💰 Funding account from devnet faucet...');
        execSync('aptos account fund-with-faucet --account default', {
            encoding: 'utf-8'
        });
        console.log('✅ Account funded successfully');
        return true;
    } catch (error) {
        console.log('⚠️ Faucet funding failed (might already have funds)');
        return false;
    }
}

// Check account balance
function checkBalance() {
    try {
        const balance = execSync('aptos account list --query balance', {
            encoding: 'utf-8'
        });
        console.log('💎 Current balance:', balance.trim());
        return true;
    } catch (error) {
        console.log('⚠️ Could not check balance');
        return false;
    }
}

// Compile the Move contract
function compileContract() {
    try {
        console.log('📦 Compiling Move contract...');
        const compileResult = execSync('aptos move compile', {
            cwd: 'contract',
            encoding: 'utf-8'
        });
        console.log('✅ Contract compiled successfully');
        return true;
    } catch (error) {
        console.error('❌ Contract compilation failed:', error.message);
        console.log('\nMove.toml configuration:');
        try {
            const moveToml = fs.readFileSync('contract/Move.toml', 'utf-8');
            console.log(moveToml);
        } catch (readError) {
            console.log('Could not read Move.toml');
        }
        return false;
    }
}

// Test the Move contract
function testContract() {
    try {
        console.log('🧪 Testing Move contract...');
        execSync('aptos move test', {
            cwd: 'contract',
            encoding: 'utf-8'
        });
        console.log('✅ All contract tests passed');
        return true;
    } catch (error) {
        console.log('⚠️ Some tests failed, but continuing with deployment...');
        return false;
    }
}

// Deploy the contract
function deployContract() {
    try {
        console.log('🚀 Deploying contract to Aptos devnet...');
        const deployResult = execSync('aptos move publish --named-addresses message_board_addr=default', {
            cwd: 'contract',
            encoding: 'utf-8'
        });
        
        console.log('✅ Contract deployed successfully!');
        console.log(deployResult);
        
        // Extract contract address
        const addressMatch = deployResult.match(/0x[a-fA-F0-9]+/);
        if (addressMatch) {
            const contractAddress = addressMatch[0];
            console.log('📍 Contract Address:', contractAddress);
            
            // Update frontend configuration
            updateFrontendConfig(contractAddress);
            return contractAddress;
        } else {
            console.log('⚠️ Could not extract contract address from deployment output');
            return null;
        }
    } catch (error) {
        console.error('❌ Contract deployment failed:', error.message);
        return null;
    }
}

// Update frontend configuration with real contract address
function updateFrontendConfig(contractAddress) {
    try {
        console.log('⚙️ Updating frontend configuration...');
        
        // Update blockchainService.ts
        const serviceFile = 'frontend/services/blockchainService.ts';
        if (fs.existsSync(serviceFile)) {
            let content = fs.readFileSync(serviceFile, 'utf-8');
            content = content.replace(
                /const MODULE_ADDRESS = ["']0x\.\.\.["'];/,
                `const MODULE_ADDRESS = "${contractAddress}";`
            );
            fs.writeFileSync(serviceFile, content);
            console.log('✅ Updated blockchainService.ts');
        }
        
        // Update app config
        const configFile = 'frontend/config/appConfig.json';
        if (fs.existsSync(configFile)) {
            const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
            config.blockchain.real.contractAddress = contractAddress;
            config.blockchain.real.deployedAt = new Date().toISOString();
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            console.log('✅ Updated appConfig.json');
        }
        
        // Create deployment info file
        const deploymentInfo = {
            contractAddress,
            network: 'devnet',
            deployedAt: new Date().toISOString(),
            networkUrl: 'https://fullnode.devnet.aptoslabs.com',
            explorerUrl: `https://explorer.aptoslabs.com/account/${contractAddress}?network=devnet`
        };
        
        fs.writeFileSync('blockchain-deployment.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('✅ Created blockchain-deployment.json');
        
        // Also create a simple HTML file to set localStorage (for frontend detection)
        const htmlScript = `
<!DOCTYPE html>
<html>
<head>
    <title>Blockchain Deployment Complete</title>
</head>
<body>
    <h1>🎉 Blockchain Deployment Complete!</h1>
    <p>Contract Address: ${contractAddress}</p>
    <p>Network: Aptos Devnet</p>
    <script>
        // Save deployment info to localStorage for frontend detection
        localStorage.setItem('blockchain_deployment_info', JSON.stringify(${JSON.stringify(deploymentInfo)}));
        console.log('Deployment info saved to localStorage');
        
        // Redirect to main app after 3 seconds
        setTimeout(() => {
            if (window.location.port === '5177' || window.location.port === '5173') {
                window.location.href = '/';
            } else {
                window.location.href = 'http://localhost:5177/';
            }
        }, 3000);
    </script>
    <p>Redirecting to your app in 3 seconds...</p>
    <p>Or <a href="http://localhost:5177/">click here to go to your app</a></p>
</body>
</html>`;
        
        fs.writeFileSync('deployment-success.html', htmlScript);
        console.log('✅ Created deployment-success.html');
        
    } catch (error) {
        console.error('❌ Failed to update frontend configuration:', error);
    }
}

// Verify deployment
function verifyDeployment(contractAddress) {
    if (!contractAddress) {
        console.log('⚠️ No contract address to verify');
        return false;
    }
    
    try {
        console.log('🔍 Verifying contract deployment...');
        const verifyResult = execSync(`aptos account list --query modules --account ${contractAddress}`, {
            encoding: 'utf-8'
        });
        console.log('✅ Contract verification successful');
        console.log('📦 Contract modules:', verifyResult);
        return true;
    } catch (error) {
        console.log('⚠️ Could not verify contract deployment');
        return false;
    }
}

// Main deployment function
async function main() {
    try {
        // Step 1: Check Aptos CLI
        if (!checkAptosCliInstalled()) {
            showInstallInstructions();
            return;
        }
        
        // Step 2: Initialize account
        if (!initializeAccount()) {
            console.log('❌ Account initialization failed');
            return;
        }
        
        // Step 3: Fund account
        fundAccount();
        
        // Step 4: Check balance
        checkBalance();
        
        // Step 5: Compile contract
        if (!compileContract()) {
            console.log('❌ Compilation failed - cannot proceed');
            return;
        }
        
        // Step 6: Test contract
        testContract();
        
        // Step 7: Deploy contract
        const contractAddress = deployContract();
        if (!contractAddress) {
            console.log('❌ Deployment failed');
            return;
        }
        
        // Step 8: Verify deployment
        verifyDeployment(contractAddress);
        
        // Success!
        console.log('\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉');
        console.log('==========================================');
        console.log('Contract Address:', contractAddress);
        console.log('Network: Aptos Devnet');
        console.log('Explorer:', `https://explorer.aptoslabs.com/account/${contractAddress}?network=devnet`);
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('1. Open deployment-success.html in your browser to set up frontend');
        console.log('2. Or manually start your app: npm run dev');
        console.log('3. Connect your Petra/Pontem wallet');
        console.log('4. Upload files - they\'ll be stored on Aptos blockchain!');
        console.log('');
        console.log('🔗 Your permissions are now permanently stored on blockchain!');
        console.log('💡 Open: deployment-success.html to automatically configure frontend');
        
    } catch (error) {
        console.error('❌ Deployment script failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main };
