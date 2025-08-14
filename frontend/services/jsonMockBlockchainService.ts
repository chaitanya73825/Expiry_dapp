import React from 'react';
import { configManager } from './configManager';

interface PermissionData {
  id: string;
  recipient: string;
  owner: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  accessLevel: string;
  duration: string;
  expiresAt: string;
  createdAt: string;
  fileData?: string;
}

interface MockPermission extends PermissionData {
  transactionHash: string;
  blockNumber: number;
  onChain: boolean;
  revoked?: boolean;
  revokedAt?: string;
}

// JSON-based Mock Blockchain Service
class JSONMockBlockchainService {
  private mockPermissions: Map<string, MockPermission>;
  private transactionCounter: number;
  private config: any;

  constructor() {
    this.config = configManager.getMockConfig();
    this.mockPermissions = new Map();
    this.transactionCounter = 0;
    
    // Initialize with default permissions from JSON
    this.initializeFromJSON();
    
    // Load persisted permissions from localStorage
    this.loadPersistedPermissions();
    
    if (this.config.debugging.enableLogs) {
      console.log(`${this.config.debugging.logPrefix} Service initialized from JSON config`);
      console.log('📍 Contract Address:', this.config.mockBlockchain.contractAddress);
      console.log('🌐 Network:', this.config.mockBlockchain.network);
      console.log('💾 Total permissions loaded:', this.mockPermissions.size);
    }
  }

  private initializeFromJSON() {
    // Only load defaults if no persisted data exists
    if (this.mockPermissions.size === 0) {
      this.config.defaultPermissions.forEach(permission => {
        this.mockPermissions.set(permission.id, { ...permission });
      });
      
      if (this.config.debugging.enableLogs) {
        console.log(`${this.config.debugging.logPrefix} Loaded ${this.config.defaultPermissions.length} default permissions from JSON`);
      }
    }
  }

  private loadPersistedPermissions() {
    try {
      // Try primary storage first
      let stored = localStorage.getItem('expiryX_mock_blockchain_permissions');
      let source = 'primary localStorage';
      
      // If primary fails, try backup
      if (!stored) {
        stored = localStorage.getItem('expiryX_mock_blockchain_permissions_backup');
        source = 'backup localStorage';
      }
      
      // If both localStorage fail, try sessionStorage emergency backup
      if (!stored) {
        stored = sessionStorage.getItem('expiryX_emergency_backup');
        source = 'emergency sessionStorage';
      }
      
      if (stored) {
        const permissions = JSON.parse(stored);
        if (Array.isArray(permissions)) {
          permissions.forEach(permission => {
            this.mockPermissions.set(permission.id, permission);
          });
          
          if (this.config.debugging.enableLogs) {
            console.log(`${this.config.debugging.logPrefix} ✅ Loaded ${permissions.length} persisted permissions from ${source}`);
            console.log(`${this.config.debugging.logPrefix} 📊 Permission IDs:`, permissions.map(p => p.id));
          }
          
          // If we loaded from backup or emergency, save to primary for next time
          if (source !== 'primary localStorage') {
            this.savePersistedPermissions();
            console.log(`${this.config.debugging.logPrefix} 🔄 Restored data to primary storage from ${source}`);
          }
        } else {
          console.warn(`${this.config.debugging.logPrefix} ⚠️ Stored data is not an array:`, permissions);
        }
      } else {
        if (this.config.debugging.enableLogs) {
          console.log(`${this.config.debugging.logPrefix} 📭 No persisted permissions found in any storage`);
        }
      }
    } catch (error) {
      console.error(`${this.config.debugging.logPrefix} ❌ Failed to load persisted permissions:`, error);
      
      // Try to recover from backup
      try {
        const backup = localStorage.getItem('expiryX_mock_blockchain_permissions_backup');
        if (backup) {
          const permissions = JSON.parse(backup);
          if (Array.isArray(permissions)) {
            permissions.forEach(permission => {
              this.mockPermissions.set(permission.id, permission);
            });
            console.log(`${this.config.debugging.logPrefix} 🔄 Recovered ${permissions.length} permissions from backup`);
          }
        }
      } catch (recoveryError) {
        console.error(`${this.config.debugging.logPrefix} ❌ Recovery from backup also failed:`, recoveryError);
      }
    }
  }

  private savePersistedPermissions() {
    try {
      const permissions = Array.from(this.mockPermissions.values());
      const dataToSave = JSON.stringify(permissions);
      
      // Save to primary storage
      localStorage.setItem('expiryX_mock_blockchain_permissions', dataToSave);
      
      // Save to backup storage for extra safety
      localStorage.setItem('expiryX_mock_blockchain_permissions_backup', dataToSave);
      
      // Also save a timestamp for debugging
      localStorage.setItem('expiryX_mock_blockchain_last_save', new Date().toISOString());
      
      if (this.config.debugging.enableLogs) {
        console.log(`${this.config.debugging.logPrefix} ✅ Saved ${permissions.length} permissions to localStorage`);
        console.log(`${this.config.debugging.logPrefix} 💾 Data size: ${dataToSave.length} characters`);
        
        // Verify the save immediately
        const verification = localStorage.getItem('expiryX_mock_blockchain_permissions');
        if (verification === dataToSave) {
          console.log(`${this.config.debugging.logPrefix} ✅ Save verification successful`);
        } else {
          console.error(`${this.config.debugging.logPrefix} ❌ Save verification failed!`);
        }
      }
    } catch (error) {
      console.error(`${this.config.debugging.logPrefix} ❌ Failed to save permissions:`, error);
      
      // Try to save to backup location as emergency fallback
      try {
        const permissions = Array.from(this.mockPermissions.values());
        sessionStorage.setItem('expiryX_emergency_backup', JSON.stringify(permissions));
        console.log(`${this.config.debugging.logPrefix} 💾 Emergency backup saved to sessionStorage`);
      } catch (backupError) {
        console.error(`${this.config.debugging.logPrefix} ❌ Even emergency backup failed:`, backupError);
      }
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateTransactionHash(type: string): string {
    const template = this.config.transactionTemplates[type as keyof typeof this.config.transactionTemplates];
    const prefix = this.config.responses.success[type as keyof typeof this.config.responses.success]?.transactionHashPrefix || '0xmock';
    return `${prefix}${Date.now()}${this.transactionCounter++}`;
  }

  async grantPermissionToBlockchain(permissionData: PermissionData) {
    if (this.config.debugging.enableLogs) {
      console.log(`${this.config.debugging.logPrefix} Granting permission to blockchain...`);
      if (this.config.debugging.showTransactionDetails) {
        console.log('📋 Permission Data:', permissionData);
      }
    }
    
    // Simulate network delay from config
    if (this.config.debugging.showNetworkDelays) {
      console.log(`${this.config.debugging.logPrefix} Simulating network delay (${this.config.mockBlockchain.transactionDelay}ms)...`);
    }
    await this.delay(this.config.mockBlockchain.transactionDelay);
    
    const transactionHash = this.generateTransactionHash('grantPermission');
    const blockchainPermission: MockPermission = {
      ...permissionData,
      transactionHash,
      blockNumber: Math.floor(Date.now() / 1000),
      onChain: true
    };
    
    this.mockPermissions.set(permissionData.id, blockchainPermission);
    
    // Save to localStorage for persistence
    this.savePersistedPermissions();
    
    const successResponse = this.config.responses.success.grantPermission;
    
    if (this.config.debugging.enableLogs) {
      console.log(`${this.config.debugging.logPrefix} ${successResponse.message}`);
      console.log('📋 Transaction Hash:', transactionHash);
    }
    
    return {
      success: successResponse.success,
      transactionHash,
      blockNumber: blockchainPermission.blockNumber,
      message: successResponse.message
    };
  }

  async getPermissionsByOwner(ownerAddress?: string) {
    if (this.config.debugging.enableLogs) {
      console.log(`${this.config.debugging.logPrefix} Loading permissions from blockchain...`);
      if (ownerAddress) {
        console.log('👤 Owner filter:', ownerAddress);
      }
    }
    
    // Simulate network delay
    if (this.config.debugging.showNetworkDelays) {
      console.log(`${this.config.debugging.logPrefix} Simulating connection delay (${this.config.mockBlockchain.connectionDelay}ms)...`);
    }
    await this.delay(this.config.mockBlockchain.connectionDelay);
    
    const permissions = Array.from(this.mockPermissions.values())
      .filter(p => !ownerAddress || p.owner === ownerAddress);
    
    const successResponse = this.config.responses.success.loadPermissions;
    
    if (this.config.debugging.enableLogs) {
      console.log(`${this.config.debugging.logPrefix} ${successResponse.message}`);
      console.log(`📊 Found ${permissions.length} permissions`);
    }
    
    return permissions;
  }

  async revokePermissionOnBlockchain(permissionId: string) {
    if (this.config.debugging.enableLogs) {
      console.log(`${this.config.debugging.logPrefix} Revoking permission...`);
      console.log('🗑️ Permission ID:', permissionId);
    }
    
    // Simulate network delay
    if (this.config.debugging.showNetworkDelays) {
      console.log(`${this.config.debugging.logPrefix} Simulating revoke delay (${this.config.mockBlockchain.revokeDelay}ms)...`);
    }
    await this.delay(this.config.mockBlockchain.revokeDelay);
    
    const permission = this.mockPermissions.get(permissionId);
    if (!permission) {
      const errorResponse = this.config.responses.error.permissionNotFound;
      if (this.config.debugging.enableLogs) {
        console.error(`${this.config.debugging.logPrefix} ${errorResponse.error}`);
      }
      throw new Error(errorResponse.error);
    }
    
    permission.revoked = true;
    permission.revokedAt = new Date().toISOString();
    
    // Save to localStorage for persistence
    this.savePersistedPermissions();
    
    const transactionHash = this.generateTransactionHash('revokePermission');
    const successResponse = this.config.responses.success.revokePermission;
    
    if (this.config.debugging.enableLogs) {
      console.log(`${this.config.debugging.logPrefix} ${successResponse.message}`);
      console.log('📋 Revoke Transaction:', transactionHash);
    }
    
    return {
      success: successResponse.success,
      transactionHash,
      message: successResponse.message
    };
  }

  async isPermissionValid(permissionId: string): Promise<boolean> {
    const permission = this.mockPermissions.get(permissionId);
    if (!permission) return false;
    
    if (permission.revoked) return false;
    
    const now = Date.now();
    const expiryTime = new Date(permission.expiresAt).getTime();
    
    const isValid = now < expiryTime;
    
    if (this.config.debugging.enableLogs) {
      console.log(`${this.config.debugging.logPrefix} Permission ${permissionId} is ${isValid ? 'valid' : 'expired'}`);
    }
    
    return isValid;
  }

  getStatus() {
    return {
      connected: true,
      network: this.config.mockBlockchain.network,
      networkUrl: this.config.mockBlockchain.networkUrl,
      contractAddress: this.config.mockBlockchain.contractAddress,
      totalPermissions: this.mockPermissions.size,
      mode: 'json-simulation',
      configVersion: '1.0.0'
    };
  }

  // Clear all permissions (for testing)
  clearAllPermissions() {
    this.mockPermissions.clear();
    this.savePersistedPermissions();
    
    if (this.config.debugging.enableLogs) {
      console.log(`${this.config.debugging.logPrefix} All permissions cleared`);
    }
  }

  // Get total count of permissions
  getPermissionCount(): number {
    return this.mockPermissions.size;
  }

  // Check if service has any permissions
  hasPermissions(): boolean {
    return this.mockPermissions.size > 0;
  }

  // Get all permissions (not filtered by owner)
  async getAllPermissions() {
    return Array.from(this.mockPermissions.values());
  }

  // Force refresh from localStorage
  async refreshFromStorage() {
    this.mockPermissions.clear();
    this.loadPersistedPermissions();
    
    if (this.config.debugging.enableLogs) {
      console.log(`${this.config.debugging.logPrefix} Refreshed from localStorage, now have ${this.mockPermissions.size} permissions`);
    }
    
    return Array.from(this.mockPermissions.values());
  }

  // Export current state as JSON
  exportPermissions() {
    return {
      permissions: Array.from(this.mockPermissions.entries()),
      config: this.config,
      exportedAt: new Date().toISOString()
    };
  }
}

// React Hook for JSON-based Mock Blockchain
export function useJSONMockBlockchainPermissions() {
  const [permissions, setPermissions] = React.useState<MockPermission[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [connected, setConnected] = React.useState(true);

  const mockService = React.useMemo(() => {
    return new JSONMockBlockchainService();
  }, []);

  const loadPermissions = React.useCallback(async (ownerAddress?: string) => {
    setLoading(true);
    try {
      const blockchainPermissions = await mockService.getPermissionsByOwner(ownerAddress);
      setPermissions(blockchainPermissions);
    } catch (error) {
      console.error('JSON Mock: Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [mockService]);

  const grantPermission = React.useCallback(async (permissionData: PermissionData) => {
    try {
      const result = await mockService.grantPermissionToBlockchain(permissionData);
      await loadPermissions(permissionData.owner);
      return result;
    } catch (error) {
      console.error('JSON Mock: Failed to grant permission:', error);
      throw error;
    }
  }, [mockService, loadPermissions]);

  const revokePermission = React.useCallback(async (permissionId: string) => {
    try {
      const result = await mockService.revokePermissionOnBlockchain(permissionId);
      await loadPermissions();
      return result;
    } catch (error) {
      console.error('JSON Mock: Failed to revoke permission:', error);
      throw error;
    }
  }, [mockService, loadPermissions]);

  return {
    permissions,
    loading,
    connected,
    loadPermissions,
    grantPermission,
    revokePermission,
    getStatus: () => mockService.getStatus(),
    getConfig: () => mockService.getConfig(),
    exportPermissions: () => mockService.exportPermissions(),
    clearAllPermissions: () => mockService.clearAllPermissions(),
    getPermissionCount: () => mockService.getPermissionCount(),
    hasPermissions: () => mockService.hasPermissions(),
    getAllPermissions: () => mockService.getAllPermissions(),
    refreshFromStorage: () => mockService.refreshFromStorage()
  };
}

// Global JSON mock service for testing
if (typeof window !== 'undefined') {
  window.jsonMockBlockchainService = new JSONMockBlockchainService();
  
  // Enhanced debug functions
  window.testJSONMockBlockchain = async function() {
    const service = window.jsonMockBlockchainService;
    
    console.log('🧪 Testing JSON-based Mock Blockchain Service...');
    console.log('📊 Status:', service.getStatus());
    console.log('⚙️ Config:', service.getConfig());
    
    // Test granting permission
    const testPermission = {
      id: `json-test-${Date.now()}`,
      recipient: '0xjsontest789',
      owner: '0xjsonowner123',
      fileName: 'json-test-file.pdf',
      fileSize: 3072000,
      fileType: 'application/pdf',
      accessLevel: 'read-write',
      duration: '2h',
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    
    try {
      const grantResult = await service.grantPermissionToBlockchain(testPermission);
      console.log('✅ JSON Grant test passed:', grantResult);
      
      const permissions = await service.getPermissionsByOwner('0xjsonowner123');
      console.log('✅ JSON Load test passed:', permissions.length, 'permissions found');
      
      const isValid = await service.isPermissionValid(testPermission.id);
      console.log('✅ JSON Validation test passed:', isValid);
      
      const exportData = service.exportPermissions();
      console.log('✅ JSON Export test passed:', exportData.permissions.length, 'permissions exported');
      
      console.log('🎉 All JSON mock blockchain tests passed!');
    } catch (error) {
      console.error('❌ JSON mock blockchain test failed:', error);
    }
  };
  
  window.showJSONMockConfig = function() {
    const service = window.jsonMockBlockchainService;
    console.log('📋 Current JSON Configuration:', service.getConfig());
  };
  
  window.exportJSONMockData = function() {
    const service = window.jsonMockBlockchainService;
    const data = service.exportPermissions();
    console.log('📤 Exported Mock Data:', data);
    return data;
  };

  window.debugJSONMockPersistence = function() {
    const service = window.jsonMockBlockchainService;
    
    console.log('🔍 JSON Mock Blockchain Persistence Debug:');
    console.log('  Total permissions in memory:', service.getPermissionCount());
    console.log('  Has permissions:', service.hasPermissions());
    
    // Check localStorage
    const stored = localStorage.getItem('expiryX_mock_blockchain_permissions');
    if (stored) {
      try {
        const parsedStored = JSON.parse(stored);
        console.log('  Permissions in localStorage:', parsedStored.length);
        console.log('  First stored permission:', parsedStored[0]);
      } catch (error) {
        console.log('  Error parsing stored permissions:', error);
      }
    } else {
      console.log('  No permissions found in localStorage');
    }
    
    // Check main app localStorage
    const appStored = localStorage.getItem('expiryX_permissions');
    if (appStored) {
      try {
        const parsedAppStored = JSON.parse(appStored);
        console.log('  App permissions in localStorage:', parsedAppStored.length);
      } catch (error) {
        console.log('  Error parsing app permissions:', error);
      }
    } else {
      console.log('  No app permissions found in localStorage');
    }
  };

  window.refreshJSONMockFromStorage = async function() {
    const service = window.jsonMockBlockchainService;
    console.log('🔄 Refreshing JSON mock blockchain from localStorage...');
    const permissions = await service.refreshFromStorage();
    console.log(`✅ Refreshed! Now have ${permissions.length} permissions`);
    return permissions;
  };

  window.clearJSONMockPermissions = function() {
    const service = window.jsonMockBlockchainService;
    console.log('🗑️ Clearing all JSON mock blockchain permissions...');
    service.clearAllPermissions();
    console.log('✅ All permissions cleared');
  };
}

export { JSONMockBlockchainService };
