import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { NETWORK, MODULE_ADDRESS, RESOURCE_TYPES } from '../constants';

const aptosConfig = new AptosConfig({ 
    network: NETWORK as Network,
});
const aptos = new Aptos(aptosConfig);

// Helper to check if the contract is deployed
export async function isContractDeployed(contractAddress: string = MODULE_ADDRESS): Promise<boolean> {
    try {
        // Try to get the permissions object address
        const objectAddress = await aptos.view({
            function: `${contractAddress}::expiry_x::get_permissions_obj_address`,
            type_arguments: [],
            arguments: []
        });
        
        console.log('✅ Contract is deployed, permissions object at:', objectAddress);
        return true;
        
    } catch (error) {
        console.log('❌ Contract not deployed or not accessible:', error);
        return false;
    }
}

// Helper to get contract info
export async function getContractInfo(contractAddress: string = MODULE_ADDRESS) {
    try {
        const totalPermissions = await aptos.view({
            function: `${contractAddress}::expiry_x::get_total_permissions`,
            type_arguments: [],
            arguments: []
        }) as number;
        
        return {
            isDeployed: true,
            totalPermissions: Number(totalPermissions),
            contractAddress,
            network: NETWORK
        };
        
    } catch (error) {
        return {
            isDeployed: false,
            totalPermissions: 0,
            contractAddress,
            network: NETWORK,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Helper to validate account has resources
export async function checkAccountResources(accountAddress: string) {
    try {
        const resources = await aptos.getAccountResources({ 
            accountAddress 
        });
        
        const relevantResources = resources.filter(resource => 
            resource.type.includes('expiry_x') || 
            resource.type.includes(MODULE_ADDRESS)
        );
        
        return {
            hasResources: relevantResources.length > 0,
            resourceTypes: relevantResources.map(r => r.type),
            totalResources: resources.length
        };
        
    } catch (error) {
        return {
            hasResources: false,
            resourceTypes: [],
            totalResources: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Helper to get deployment status with full details
export async function getDeploymentStatus() {
    const contractInfo = await getContractInfo();
    
    return {
        timestamp: new Date().toISOString(),
        network: NETWORK,
        contractAddress: MODULE_ADDRESS,
        ...contractInfo
    };
}
