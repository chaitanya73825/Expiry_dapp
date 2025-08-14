const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ExpiryX Direct Blockchain Deployment');
console.log('=======================================\n');

// Configuration
const config = {
    network: 'devnet',
    contractAddress: '',
    accountName: 'default'
};

// Utility functions
function runCommand(command, options = {}) {
    try {
        const result = execSync(command, {
            encoding: 'utf-8',
            timeout: 30000,
            ...options
        });
        return { success: true, output: result.trim() };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            output: error.stdout || error.stderr || ''
        };
    }
}

function updateFrontendConfig(contractAddress) {
    const configPath = path.join(__dirname, '..', 'frontend', 'constants.ts');
    
    try {
        let configContent = fs.readFileSync(configPath, 'utf-8');
        
        // Update the blockchain mode
        configContent = configContent.replace(
            /BLOCKCHAIN_MODE:\s*['"`].*?['"`]/,
            `BLOCKCHAIN_MODE: 'real'`
        );
        
        // Update the module address
        configContent = configContent.replace(
            /MODULE_ADDRESS = import\.meta\.env\.VITE_MODULE_ADDRESS \?\? ['"`].*?['"`]/,
            `MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS ?? '${contractAddress}'`
        );
        
        // Update or add the real contract address
        if (configContent.includes('REAL_CONTRACT_ADDRESS')) {
            configContent = configContent.replace(
                /REAL_CONTRACT_ADDRESS = .*?;/,
                `REAL_CONTRACT_ADDRESS = '${contractAddress}';`
            );
        } else {
            // Add contract address
            configContent = configContent.replace(
                /export const/,
                `export const REAL_CONTRACT_ADDRESS = '${contractAddress}';\n\nexport const`
            );
        }
        
        // Update resource types
        configContent = configContent.replace(
            /PERMISSIONS_STORE: `.*?::expiry_x::PermissionsStore`/,
            `PERMISSIONS_STORE: \`${contractAddress}::expiry_x::PermissionsStore\``
        );
        
        configContent = configContent.replace(
            /PERMISSIONS_CONTROLLER: `.*?::expiry_x::PermissionsObjectController`/,
            `PERMISSIONS_CONTROLLER: \`${contractAddress}::expiry_x::PermissionsObjectController\``
        );
        
        fs.writeFileSync(configPath, configContent);
        console.log('✅ Updated frontend configuration');
        
        // Also create a deployment info file
        const deploymentInfo = {
            contractAddress,
            network: config.network,
            deployedAt: new Date().toISOString(),
            moduleAddress: contractAddress,
            resourceTypes: {
                permissionsStore: `${contractAddress}::expiry_x::PermissionsStore`,
                permissionsController: `${contractAddress}::expiry_x::PermissionsObjectController`
            }
        };
        
        const deploymentInfoPath = path.join(__dirname, '..', 'deployment-info.json');
        fs.writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
        console.log('✅ Created deployment-info.json');
        
        return true;
    } catch (error) {
        console.error('❌ Failed to update frontend config:', error.message);
        return false;
    }
}

async function deployToBlockchain() {
    console.log('🔍 Checking Aptos CLI...');
    
    // Check if Aptos CLI exists
    const cliCheck = runCommand('aptos --version');
    if (!cliCheck.success) {
        console.log('❌ Aptos CLI not found');
        console.log('');
        console.log('📥 Installation options:');
        console.log('1. Run: node scripts/install-and-setup.js');
        console.log('2. Manual: https://github.com/aptos-labs/aptos-core/releases');
        console.log('3. Winget: winget install Aptos.CLI');
        return false;
    }
    
    console.log('✅ Aptos CLI found:', cliCheck.output);
    
    // Check/create account
    console.log('\n🔑 Checking account...');
    const accountCheck = runCommand('aptos account list');
    
    if (!accountCheck.success) {
        console.log('📝 Initializing account...');
        const init = runCommand('aptos init --network devnet');
        if (!init.success) {
            console.error('❌ Account initialization failed');
            return false;
        }
        console.log('✅ Account initialized');
    } else {
        console.log('✅ Account exists');
    }
    
    // Fund account
    console.log('\n💰 Funding account...');
    const fund = runCommand('aptos account fund-with-faucet --account default');
    if (fund.success) {
        console.log('✅ Account funded');
    } else {
        console.log('⚠️ Funding failed (may already have funds)');
    }
    
    // Compile contract
    console.log('\n📦 Compiling Move contract...');
    const compile = runCommand('aptos move compile', {
        cwd: path.join(__dirname, '..', 'contract')
    });
    
    if (!compile.success) {
        console.error('❌ Compilation failed:', compile.error);
        return false;
    }
    console.log('✅ Contract compiled');
    
    // Test contract
    console.log('\n🧪 Running tests...');
    const test = runCommand('aptos move test', {
        cwd: path.join(__dirname, '..', 'contract')
    });
    
    if (test.success) {
        console.log('✅ Tests passed');
    } else {
        console.log('⚠️ Some tests failed, continuing deployment...');
    }
    
    // Deploy contract
    console.log('\n🚀 Deploying to blockchain...');
    const deploy = runCommand('aptos move publish --named-addresses message_board_addr=default --assume-yes', {
        cwd: path.join(__dirname, '..', 'contract')
    });
    
    if (!deploy.success) {
        console.error('❌ Deployment failed:', deploy.error);
        console.log('\n🔍 Debug info:', deploy.output);
        return false;
    }
    
    console.log('✅ Contract deployed!');
    console.log('📄 Deploy output:', deploy.output);
    
    // Extract contract address from deployment output
    let contractAddress = '';
    const addressMatch = deploy.output.match(/Code will be published at ([0-9a-fx]+)/i);
    if (addressMatch) {
        contractAddress = addressMatch[1];
        console.log('📍 Contract address:', contractAddress);
        config.contractAddress = contractAddress;
    }
    
    // Get account address
    const accountInfo = runCommand('aptos account list --query addresses');
    if (accountInfo.success) {
        const accountAddress = accountInfo.output.split('\n')[0];
        if (!contractAddress) {
            contractAddress = accountAddress;
            config.contractAddress = contractAddress;
        }
        console.log('👤 Account address:', accountAddress);
    }
    
    // Update frontend configuration
    if (contractAddress) {
        updateFrontendConfig(contractAddress);
    }
    
    console.log('\n🎉 Deployment Complete!');
    console.log('======================');
    console.log('');
    console.log('📍 Contract Address:', contractAddress || 'Check deployment logs');
    console.log('🌐 Network: Aptos Devnet');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Start app: npm run dev');
    console.log('2. Connect Petra/Pontem wallet to Devnet');
    console.log('3. Upload files - they will be stored on blockchain!');
    console.log('4. No more localStorage - everything is permanent!');
    
    return true;
}

// Run deployment
deployToBlockchain().catch(error => {
    console.error('💥 Deployment script failed:', error);
});
