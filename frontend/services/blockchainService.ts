import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { NETWORK, MODULE_ADDRESS } from '../constants';

// Initialize Aptos client
const aptosConfig = new AptosConfig({ 
    network: NETWORK as Network,
});
const aptos = new Aptos(aptosConfig);

// Contract address - replace this with your deployed contract address
const CONTRACT_ADDRESS = MODULE_ADDRESS || "message_board_addr";
const MODULE_NAME = "expiry_x";

export interface BlockchainPermission {
    id: number;
    owner: string;
    spender: string;
    amount: number;
    spent: number;
    expiryTimestamp: number;
    isActive: boolean;
    status: 'active' | 'expired' | 'revoked' | 'fully_spent';
    blockchainId: number;
    onChainData: boolean;
}

// PURE BLOCKCHAIN SERVICE - NO LOCALSTORAGE AT ALL
export function useBlockchainPermissions() {
    const { account, signAndSubmitTransaction, connected } = useWallet();
    const [permissions, setPermissions] = useState<BlockchainPermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);

    // PURE BLOCKCHAIN FETCH - No localStorage, directly from chain
    const fetchPermissionsFromBlockchain = useCallback(async (force: boolean = false) => {
        if (!account?.address || !connected) {
            console.log('📋 No account connected, clearing permissions');
            setPermissions([]);
            setLastFetchTime(0);
            return [];
        }

        // Skip frequent fetches unless forced
        if (!force && Date.now() - lastFetchTime < 5000) {
            console.log('⚡ Skipping fetch - too recent, using current state');
            return permissions;
        }

        console.log('🔄 FETCHING PERMISSIONS DIRECTLY FROM BLOCKCHAIN:', account.address);
        setLoading(true);
        setError(null);

        try {
            // Step 1: Get all permission IDs for this account from blockchain
            console.log('🔍 Querying blockchain for permission IDs...');
            const permissionIds = await aptos.view({
                function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_permissions_by_owner`,
                type_arguments: [],
                arguments: [account.address]
            }) as number[];

            console.log('📊 Found permission IDs on blockchain:', permissionIds);

            if (permissionIds.length === 0) {
                console.log('📭 No permissions found on blockchain for account');
                setPermissions([]);
                setLastFetchTime(Date.now());
                setLoading(false);
                return [];
            }

            // Step 2: Fetch detailed data for each permission from blockchain
            console.log('📥 Fetching detailed permission data from blockchain...');
            const permissionPromises = permissionIds.map(async (id) => {
                try {
                    const [owner, spender, amount, spent, expiryTimestamp, isActive] = await aptos.view({
                        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_permission`,
                        type_arguments: [],
                        arguments: [id.toString()]
                    }) as [string, string, number, number, number, boolean];

                    // Determine status based on blockchain data
                    let status: 'active' | 'expired' | 'revoked' | 'fully_spent' = 'active';
                    const currentTime = Math.floor(Date.now() / 1000);
                    
                    if (!isActive) {
                        status = 'revoked';
                    } else if (currentTime >= expiryTimestamp) {
                        status = 'expired';
                    } else if (spent >= amount) {
                        status = 'fully_spent';
                    }

                    console.log(`✅ Permission ${id} fetched from blockchain:`, { owner, spender, amount, spent, status });

                    return {
                        id,
                        owner,
                        spender,
                        amount: Number(amount),
                        spent: Number(spent),
                        expiryTimestamp: Number(expiryTimestamp),
                        isActive,
                        status,
                        blockchainId: id,
                        onChainData: true
                    } as BlockchainPermission;

                } catch (err) {
                    console.error(`❌ Failed to fetch permission ${id} from blockchain:`, err);
                    return null;
                }
            });

            const permissionDetails = (await Promise.all(permissionPromises))
                .filter(p => p !== null) as BlockchainPermission[];
            
            console.log('🎉 SUCCESS: Fetched', permissionDetails.length, 'permissions directly from blockchain');
            console.log('📋 Blockchain permissions data:', permissionDetails);
            
            // Update state with pure blockchain data
            setPermissions(permissionDetails);
            setLastFetchTime(Date.now());

            return permissionDetails;

        } catch (err) {
            console.error('❌ BLOCKCHAIN ERROR - Failed to fetch permissions:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch from blockchain';
            setError(errorMessage);
            
            // On error, keep current state but don't clear - blockchain might be temporarily down
            console.log('⚠️ Keeping current permissions due to blockchain error');
            return permissions;
            
        } finally {
            setLoading(false);
        }
    }, [account?.address, connected, lastFetchTime, permissions]);

    // Auto-fetch from blockchain when account connects or changes
    useEffect(() => {
        if (account?.address && connected) {
            console.log('👤 ACCOUNT CONNECTED - Fetching permissions from blockchain immediately');
            fetchPermissionsFromBlockchain(true);
        } else {
            console.log('👤 ACCOUNT DISCONNECTED - Clearing all permissions');
            setPermissions([]);
            setLastFetchTime(0);
        }
    }, [account?.address, connected]);

    // Auto-refresh every 30 seconds to stay in sync with blockchain
    useEffect(() => {
        if (!account?.address || !connected) return;

        const interval = setInterval(() => {
            console.log('🔄 Auto-refreshing permissions from blockchain (30s interval)');
            fetchPermissionsFromBlockchain(true);
        }, 30000);

        return () => clearInterval(interval);
    }, [account?.address, connected, fetchPermissionsFromBlockchain]);

    // PURE BLOCKCHAIN GRANT - Store directly on chain
    const grantPermission = useCallback(async (
        spenderAddress: string,
        amount: number,
        expiryTimestamp: number
    ): Promise<boolean> => {
        if (!account || !signAndSubmitTransaction || !connected) {
            console.error('❌ Wallet not connected for blockchain transaction');
            setError('Wallet not connected');
            return false;
        }

        console.log('📤 GRANTING PERMISSION DIRECTLY TO BLOCKCHAIN:', { spenderAddress, amount, expiryTimestamp });
        setError(null);

        try {
            const payload = {
                function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::grant_permission`,
                type_arguments: [],
                arguments: [
                    spenderAddress,
                    amount.toString(),
                    expiryTimestamp.toString()
                ]
            };

            console.log('🔗 Submitting transaction to blockchain:', payload);

            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: payload,
            });

            console.log('📤 Transaction submitted to blockchain:', response.hash);

            // Wait for blockchain confirmation
            console.log('⏳ Waiting for blockchain confirmation...');
            const txnResult = await aptos.waitForTransaction({
                transactionHash: response.hash,
            });

            console.log('✅ BLOCKCHAIN TRANSACTION RESULT:', txnResult);

            if (txnResult.success) {
                console.log('🎉 PERMISSION SUCCESSFULLY STORED ON BLOCKCHAIN');
                
                // Immediately fetch fresh data from blockchain
                console.log('🔄 Refreshing permissions from blockchain after grant...');
                await fetchPermissionsFromBlockchain(true);
                
                return true;
            } else {
                console.error('❌ Blockchain transaction failed');
                setError('Blockchain transaction failed');
                return false;
            }

        } catch (err) {
            console.error('❌ BLOCKCHAIN GRANT ERROR:', err);
            setError(err instanceof Error ? err.message : 'Failed to grant permission on blockchain');
            return false;
        }
    }, [account, signAndSubmitTransaction, connected, fetchPermissionsFromBlockchain]);

    // PURE BLOCKCHAIN REVOKE - Update directly on chain
    const revokePermission = useCallback(async (permissionId: number): Promise<boolean> => {
        if (!account || !signAndSubmitTransaction || !connected) {
            console.error('❌ Wallet not connected for blockchain transaction');
            setError('Wallet not connected');
            return false;
        }

        console.log('🚫 REVOKING PERMISSION DIRECTLY ON BLOCKCHAIN:', permissionId);
        setError(null);

        try {
            const payload = {
                function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::revoke_permission`,
                type_arguments: [],
                arguments: [permissionId.toString()]
            };

            console.log('🔗 Submitting revoke transaction to blockchain:', payload);

            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: payload,
            });

            console.log('📤 Revoke transaction submitted:', response.hash);

            const txnResult = await aptos.waitForTransaction({
                transactionHash: response.hash,
            });

            if (txnResult.success) {
                console.log('✅ PERMISSION REVOKED ON BLOCKCHAIN SUCCESSFULLY');
                
                // Immediately fetch fresh data from blockchain
                console.log('🔄 Refreshing permissions from blockchain after revoke...');
                await fetchPermissionsFromBlockchain(true);
                
                return true;
            } else {
                console.error('❌ Blockchain revoke transaction failed');
                setError('Failed to revoke permission on blockchain');
                return false;
            }

        } catch (err) {
            console.error('❌ BLOCKCHAIN REVOKE ERROR:', err);
            setError(err instanceof Error ? err.message : 'Failed to revoke permission on blockchain');
            return false;
        }
    }, [account, signAndSubmitTransaction, connected, fetchPermissionsFromBlockchain]);

    // Check if a specific permission is valid on blockchain
    const isPermissionValid = useCallback(async (permissionId: number): Promise<boolean> => {
        if (!connected) return false;

        try {
            const isValid = await aptos.view({
                function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::is_permission_valid`,
                type_arguments: [],
                arguments: [permissionId.toString()]
            }) as boolean;

            console.log(`🔍 Permission ${permissionId} validity check:`, isValid);
            return isValid;
        } catch (err) {
            console.error('❌ Error checking permission validity on blockchain:', err);
            return false;
        }
    }, [connected]);

    // Get remaining allowance from blockchain
    const getRemainingAllowance = useCallback(async (permissionId: number): Promise<number> => {
        if (!connected) return 0;

        try {
            const remaining = await aptos.view({
                function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_remaining_allowance`,
                type_arguments: [],
                arguments: [permissionId.toString()]
            }) as number;

            return Number(remaining);
        } catch (err) {
            console.error('❌ Error getting remaining allowance from blockchain:', err);
            return 0;
        }
    }, [connected]);

    // Manual refresh from blockchain
    const refreshPermissions = useCallback(async () => {
        console.log('🔄 MANUAL REFRESH - Fetching fresh data from blockchain');
        await fetchPermissionsFromBlockchain(true);
    }, [fetchPermissionsFromBlockchain]);

    // Get total permissions count from blockchain
    const getTotalPermissionsCount = useCallback(async (): Promise<number> => {
        if (!connected) return 0;

        try {
            const total = await aptos.view({
                function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_total_permissions`,
                type_arguments: [],
                arguments: []
            }) as number;

            return Number(total);
        } catch (err) {
            console.error('❌ Error getting total permissions from blockchain:', err);
            return 0;
        }
    }, [connected]);

    // Get network info
    const getNetworkInfo = () => ({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        moduleName: MODULE_NAME,
        isConnected: connected && !!account?.address,
        lastFetchTime,
        totalPermissions: permissions.length,
        dataSource: 'Pure Blockchain (No localStorage)',
        persistent: true,
        survivesPowerOff: true
    });

    return {
        // State - All from blockchain
        permissions,
        loading,
        error,
        lastFetchTime,
        
        // Actions - All blockchain operations
        grantPermission,
        revokePermission,
        refreshPermissions,
        
        // Utilities - All blockchain queries
        isPermissionValid,
        getRemainingAllowance,
        getTotalPermissionsCount,
        getNetworkInfo,
        
        // Account info
        account: account?.address,
        isConnected: connected && !!account?.address,
        
        // Pure blockchain indicator
        isPureBlockchain: true,
        noLocalStorage: true
    };
}