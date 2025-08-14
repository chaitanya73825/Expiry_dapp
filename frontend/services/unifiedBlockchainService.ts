import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { BLOCKCHAIN_MODE, REAL_CONTRACT_ADDRESS, NETWORK } from '../constants';
import { useBlockchainPermissions as useRealBlockchain } from './blockchainService';
import { useJSONMockBlockchainPermissions } from './jsonMockBlockchainService';

// Initialize Aptos client for real blockchain
const aptosConfig = new AptosConfig({ 
    network: NETWORK as Network,
});
const aptos = new Aptos(aptosConfig);

export class RealBlockchainService {
    private contractAddress: string;
    private aptos: Aptos;

    constructor() {
        this.contractAddress = REAL_CONTRACT_ADDRESS || '0x1';
        this.aptos = aptos;
    }

    async grantPermission(
        account: any, 
        fileName: string, 
        fileHash: string, 
        expiryTime: number,
        walletAdapter: any
    ): Promise<boolean> {
        try {
            console.log('📤 Granting permission on REAL blockchain...', { fileName, fileHash, expiryTime });

            if (!walletAdapter?.signAndSubmitTransaction) {
                throw new Error('Wallet not connected');
            }

            const payload = {
                function: `${this.contractAddress}::message_board::grant_permission_with_file`,
                type_arguments: [],
                arguments: [
                    fileName,
                    fileHash,
                    expiryTime.toString()
                ]
            };

            const response = await walletAdapter.signAndSubmitTransaction({
                sender: account.address,
                data: payload,
            });

            const txnResult = await this.aptos.waitForTransaction({
                transactionHash: response.hash,
            });

            console.log('🎉 Real blockchain transaction confirmed:', txnResult);
            return txnResult.success;

        } catch (error) {
            console.error('❌ REAL blockchain grant failed:', error);
            return false;
        }
    }

    async getPermissions(ownerAddress: string): Promise<any[]> {
        try {
            const permissions = await this.aptos.view({
                function: `${this.contractAddress}::message_board::get_permissions_by_owner`,
                type_arguments: [],
                arguments: [ownerAddress]
            });

            return permissions as any[];
        } catch (error) {
            console.error('❌ Failed to get REAL blockchain permissions:', error);
            return [];
        }
    }

    getNetworkInfo() {
        return {
            name: 'Aptos Devnet',
            type: 'Real Blockchain',
            contractAddress: this.contractAddress,
            persistent: true
        };
    }
}

// Unified blockchain service that automatically detects and uses real blockchain when available
export function useUnifiedBlockchainPermissions() {
  const { account } = useWallet();
  const realBlockchain = useRealBlockchain();
  const mockBlockchain = useJSONMockBlockchainPermissions();
  
  // Check if real blockchain is available and configured
  const isRealBlockchainAvailable = BLOCKCHAIN_MODE === 'real' && REAL_CONTRACT_ADDRESS && account;
  
  console.log('🔍 Blockchain service check:', {
    mode: BLOCKCHAIN_MODE,
    contractAddress: REAL_CONTRACT_ADDRESS,
    accountConnected: !!account,
    usingReal: isRealBlockchainAvailable
  });
  
  if (isRealBlockchainAvailable) {
    console.log('🚀 Using REAL blockchain service - no localStorage!');
    return {
      ...realBlockchain,
      mode: 'real' as const,
      isReady: true,
      networkInfo: {
        name: 'Aptos Devnet',
        type: 'Real Blockchain - Permanent Storage',
        contractAddress: REAL_CONTRACT_ADDRESS,
        persistent: true
      }
    };
  } else {
    console.log('🔧 Using MOCK blockchain service with localStorage');
    return {
      ...mockBlockchain,
      mode: 'mock' as const,
      isReady: true,
      networkInfo: {
        name: 'Mock Blockchain',
        type: 'Development Mode - LocalStorage',
        contractAddress: 'mock://localhost',
        persistent: false
      }
    };
  }
}

// Helper to determine which mode to use based on deployment status
export function getRecommendedMode(): 'real' | 'mock' {
  // Check constants configuration
  if (BLOCKCHAIN_MODE === 'real' && REAL_CONTRACT_ADDRESS && REAL_CONTRACT_ADDRESS !== '') {
    console.log('🔗 Real blockchain configured in constants');
    return 'real';
  }
  
  // Check deployment info
  try {
    const deploymentInfo = localStorage.getItem('blockchain_deployment_info');
    if (deploymentInfo) {
      const deployment = JSON.parse(deploymentInfo);
      if (deployment.contractAddress && deployment.contractAddress !== '0x...' && deployment.contractAddress !== '') {
        console.log('🔗 Real blockchain deployment detected');
        return 'real';
      }
    }
  } catch (error) {
    console.log('Could not check deployment info');
  }
  
  return 'mock';
}

// Blockchain mode manager for switching between real and mock
export function createBlockchainModeManager() {
  let currentMode: 'real' | 'mock' = getRecommendedMode();
  const listeners: Array<(mode: 'real' | 'mock') => void> = [];
  
  return {
    getCurrentMode: () => currentMode,
    
    setMode: (mode: 'real' | 'mock') => {
      currentMode = mode;
      localStorage.setItem('blockchain_mode_override', mode);
      listeners.forEach(callback => callback(mode));
    },
    
    subscribe: (callback: (mode: 'real' | 'mock') => void) => {
      listeners.push(callback);
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    
    initialize: () => {
      // Check for user override first
      const override = localStorage.getItem('blockchain_mode_override') as 'real' | 'mock' | null;
      if (override && (override === 'real' || override === 'mock')) {
        currentMode = override;
      } else {
        currentMode = getRecommendedMode();
      }
      return currentMode;
    },

    // Check if real blockchain is ready
    isRealBlockchainReady: () => {
      return BLOCKCHAIN_MODE === 'real' && REAL_CONTRACT_ADDRESS && REAL_CONTRACT_ADDRESS !== '';
    }
  };
}

// Global mode manager
export const blockchainModeManager = createBlockchainModeManager();
