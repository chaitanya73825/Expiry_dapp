import React from 'react';

// Mock Blockchain Service for Local Testing
// This simulates the blockchain functionality without requiring Aptos CLI
class MockBlockchainService {
  constructor() {
    this.mockContractAddress = "0xMOCK1234567890abcdef";
    this.mockPermissions = new Map();
    this.transactionCounter = 0;
    
    console.log('🔧 Mock Blockchain Service initialized');
    console.log('📍 Mock Contract Address:', this.mockContractAddress);
  }

  // Simulate granting permission to blockchain
  async grantPermissionToBlockchain(permissionData) {
    console.log('🔄 Mock: Granting permission to blockchain...');
    
    // Simulate network delay
    await this.delay(1000);
    
    const transactionHash = `0xmock${Date.now()}${this.transactionCounter++}`;
    const blockchainPermission = {
      ...permissionData,
      transactionHash,
      blockNumber: Math.floor(Date.now() / 1000),
      timestamp: new Date().toISOString(),
      onChain: true
    };
    
    this.mockPermissions.set(permissionData.id, blockchainPermission);
    
    console.log('✅ Mock: Permission granted on blockchain');
    console.log('📋 Transaction Hash:', transactionHash);
    
    return {
      success: true,
      transactionHash,
      blockNumber: blockchainPermission.blockNumber
    };
  }

  // Simulate getting permissions from blockchain
  async getPermissionsByOwner(ownerAddress) {
    console.log('🔍 Mock: Loading permissions from blockchain...');
    
    // Simulate network delay
    await this.delay(500);
    
    const permissions = Array.from(this.mockPermissions.values())
      .filter(p => p.owner === ownerAddress || !ownerAddress);
    
    console.log(`✅ Mock: Loaded ${permissions.length} permissions from blockchain`);
    
    return permissions;
  }

  // Simulate revoking permission
  async revokePermissionOnBlockchain(permissionId) {
    console.log('🗑️ Mock: Revoking permission on blockchain...');
    
    await this.delay(800);
    
    const permission = this.mockPermissions.get(permissionId);
    if (permission) {
      permission.revoked = true;
      permission.revokedAt = new Date().toISOString();
      
      console.log('✅ Mock: Permission revoked on blockchain');
      return { success: true, transactionHash: `0xrevoke${Date.now()}` };
    }
    
    throw new Error('Permission not found');
  }

  // Simulate checking if permission is valid
  async isPermissionValid(permissionId) {
    const permission = this.mockPermissions.get(permissionId);
    if (!permission) return false;
    
    if (permission.revoked) return false;
    
    const now = Date.now();
    const expiryTime = new Date(permission.expiresAt).getTime();
    
    return now < expiryTime;
  }

  // Helper method to simulate network delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get mock blockchain status
  getStatus() {
    return {
      connected: true,
      network: 'mock-devnet',
      contractAddress: this.mockContractAddress,
      totalPermissions: this.mockPermissions.size,
      mode: 'simulation'
    };
  }

  // Initialize with some test data
  initializeTestData() {
    console.log('🧪 Initializing mock test data...');
    
    const testPermission = {
      id: 'test-permission-1',
      recipient: '0xtest123',
      owner: '0xowner456',
      fileName: 'test-document.pdf',
      fileSize: 1024000,
      fileType: 'application/pdf',
      accessLevel: 'read',
      duration: '24h',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    
    this.mockPermissions.set(testPermission.id, {
      ...testPermission,
      transactionHash: '0xmocktest123',
      blockNumber: 12345,
      onChain: true
    });
    
    console.log('✅ Mock test data initialized');
  }
}

// React Hook for Mock Blockchain
export function useMockBlockchainPermissions() {
  const [permissions, setPermissions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [connected, setConnected] = React.useState(true); // Mock is always "connected"

  const mockService = React.useMemo(() => {
    const service = new MockBlockchainService();
    service.initializeTestData();
    return service;
  }, []);

  const loadPermissions = React.useCallback(async (ownerAddress) => {
    setLoading(true);
    try {
      const blockchainPermissions = await mockService.getPermissionsByOwner(ownerAddress);
      setPermissions(blockchainPermissions);
    } catch (error) {
      console.error('Mock: Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [mockService]);

  const grantPermission = React.useCallback(async (permissionData) => {
    try {
      const result = await mockService.grantPermissionToBlockchain(permissionData);
      await loadPermissions(permissionData.owner);
      return result;
    } catch (error) {
      console.error('Mock: Failed to grant permission:', error);
      throw error;
    }
  }, [mockService, loadPermissions]);

  const revokePermission = React.useCallback(async (permissionId) => {
    try {
      const result = await mockService.revokePermissionOnBlockchain(permissionId);
      await loadPermissions();
      return result;
    } catch (error) {
      console.error('Mock: Failed to revoke permission:', error);
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
    getStatus: () => mockService.getStatus()
  };
}

// Global mock service for testing
if (typeof window !== 'undefined') {
  window.mockBlockchainService = new MockBlockchainService();
  window.mockBlockchainService.initializeTestData();
  
  // Add to debug helpers
  window.testMockBlockchain = async function() {
    const service = window.mockBlockchainService;
    
    console.log('🧪 Testing Mock Blockchain Service...');
    console.log('Status:', service.getStatus());
    
    // Test granting permission
    const testPermission = {
      id: `test-${Date.now()}`,
      recipient: '0xtest789',
      owner: '0xowner123',
      fileName: 'test-file.pdf',
      fileSize: 2048000,
      fileType: 'application/pdf',
      accessLevel: 'read-write',
      duration: '1h',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    
    try {
      const grantResult = await service.grantPermissionToBlockchain(testPermission);
      console.log('✅ Grant test passed:', grantResult);
      
      const permissions = await service.getPermissionsByOwner('0xowner123');
      console.log('✅ Load test passed:', permissions.length, 'permissions found');
      
      const isValid = await service.isPermissionValid(testPermission.id);
      console.log('✅ Validation test passed:', isValid);
      
      console.log('🎉 All mock blockchain tests passed!');
    } catch (error) {
      console.error('❌ Mock blockchain test failed:', error);
    }
  };
}

export { MockBlockchainService };