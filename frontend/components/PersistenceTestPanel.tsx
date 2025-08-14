import { useState, useEffect } from 'react';
import { useJSONMockBlockchainPermissions } from '../services/jsonMockBlockchainService';

export default function PersistenceTestPanel() {
  const blockchain = useJSONMockBlockchainPermissions();
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const runPersistenceTest = async () => {
    setIsLoading(true);
    setTestResult('🧪 Running persistence test...\n');
    
    try {
      // Step 1: Clear existing permissions
      blockchain.clearAllPermissions();
      setTestResult(prev => prev + '✅ Step 1: Cleared all permissions\n');
      
      // Step 2: Create a test permission
      const testPermission = {
        id: `persistence-test-${Date.now()}`,
        recipient: '0xtest123456789',
        owner: '0xowner987654321',
        fileName: 'persistence-test-file.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        accessLevel: 'read',
        duration: '1h',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const grantResult = await blockchain.grantPermission(testPermission);
      setTestResult(prev => prev + '✅ Step 2: Created test permission\n');
      setTestResult(prev => prev + `   📋 Transaction: ${grantResult.transactionHash}\n`);
      
      // Step 3: Verify it's in memory
      const memoryPermissions = await blockchain.getAllPermissions();
      setTestResult(prev => prev + `✅ Step 3: Found ${memoryPermissions.length} permissions in memory\n`);
      
      // Step 4: Check localStorage directly
      const storageData = localStorage.getItem('expiryX_mock_blockchain_permissions');
      if (storageData) {
        const parsedStorage = JSON.parse(storageData);
        setTestResult(prev => prev + `✅ Step 4: Found ${parsedStorage.length} permissions in localStorage\n`);
      } else {
        setTestResult(prev => prev + '❌ Step 4: No data found in localStorage\n');
      }
      
      // Step 5: Simulate page reload by refreshing from storage
      const refreshedPermissions = await blockchain.refreshFromStorage();
      setTestResult(prev => prev + `✅ Step 5: After refresh, found ${refreshedPermissions.length} permissions\n`);
      
      // Step 6: Verify permission details match
      const savedPermission = refreshedPermissions.find(p => p.id === testPermission.id);
      if (savedPermission) {
        setTestResult(prev => prev + '✅ Step 6: Test permission found after refresh - PERSISTENCE WORKING! 🎉\n');
        setTestResult(prev => prev + `   📄 File: ${savedPermission.fileName}\n`);
        setTestResult(prev => prev + `   👤 Recipient: ${savedPermission.recipient}\n`);
        setTestResult(prev => prev + `   ⏰ Expires: ${new Date(savedPermission.expiresAt).toLocaleString()}\n`);
      } else {
        setTestResult(prev => prev + '❌ Step 6: Test permission not found after refresh - PERSISTENCE FAILED\n');
      }
      
      setTestResult(prev => prev + '\n🎯 Test completed! Check console for detailed logs.\n');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(prev => prev + `❌ Test failed with error: ${errorMessage}\n`);
      console.error('Persistence test error:', error);
    }
    
    setIsLoading(false);
  };

  const testPageReload = async () => {
    setIsLoading(true);
    setTestResult('🔄 Testing page reload persistence...\n');
    
    try {
      // Step 1: Create a unique test permission with timestamp
      const timestamp = Date.now();
      const testPermission = {
        id: `reload-test-${timestamp}`,
        recipient: `0xreload${timestamp}`,
        owner: '0xreloadtester',
        fileName: `reload-test-${timestamp}.pdf`,
        fileSize: 2048000,
        fileType: 'application/pdf',
        accessLevel: 'full',
        duration: '2h',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      
      setTestResult(prev => prev + `✅ Created test permission: ${testPermission.id}\n`);
      
      // Step 2: Save to blockchain
      const result = await blockchain.grantPermission(testPermission);
      setTestResult(prev => prev + `✅ Saved to blockchain: ${result.transactionHash}\n`);
      
      // Step 3: Verify it's in localStorage immediately
      const storageCheck1 = localStorage.getItem('expiryX_mock_blockchain_permissions');
      if (storageCheck1) {
        const parsed = JSON.parse(storageCheck1);
        const found = parsed.find(p => p.id === testPermission.id);
        if (found) {
          setTestResult(prev => prev + '✅ Confirmed: Permission saved to localStorage\n');
        } else {
          setTestResult(prev => prev + '❌ Warning: Permission not found in localStorage\n');
        }
      }
      
      // Step 4: Set up data for page reload test
      localStorage.setItem('expiryX_page_reload_test_id', testPermission.id);
      localStorage.setItem('expiryX_page_reload_test_timestamp', timestamp.toString());
      
      setTestResult(prev => prev + '✅ Test data prepared for page reload\n');
      setTestResult(prev => prev + '\n🔄 NOW REFRESH THE PAGE (F5 or Ctrl+R) and check:\n');
      setTestResult(prev => prev + '   1. This test panel should still be here\n');
      setTestResult(prev => prev + '   2. Click "Check Page Reload Result" button\n');
      setTestResult(prev => prev + '   3. Your test permission should be found\n\n');
      setTestResult(prev => prev + `🆔 Test ID to look for: ${testPermission.id}\n`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(prev => prev + `❌ Page reload test failed: ${errorMessage}\n`);
    }
    
    setIsLoading(false);
  };

  const checkPageReloadResult = async () => {
    setTestResult('🔍 Checking page reload test result...\n');
    
    try {
      const testId = localStorage.getItem('expiryX_page_reload_test_id');
      const testTimestamp = localStorage.getItem('expiryX_page_reload_test_timestamp');
      
      if (!testId || !testTimestamp) {
        setTestResult('❌ No page reload test data found. Run "Test Page Reload Persistence" first.\n');
        return;
      }
      
      setTestResult(prev => prev + `🔍 Looking for test permission: ${testId}\n`);
      
      // Check if permission exists in blockchain service
      const allPermissions = await blockchain.getAllPermissions();
      const foundInBlockchain = allPermissions.find(p => p.id === testId);
      
      if (foundInBlockchain) {
        setTestResult(prev => prev + '✅ SUCCESS! Test permission found in blockchain after page reload!\n');
        setTestResult(prev => prev + `   📄 File: ${foundInBlockchain.fileName}\n`);
        setTestResult(prev => prev + `   👤 Recipient: ${foundInBlockchain.recipient}\n`);
        setTestResult(prev => prev + `   ⏰ Created: ${new Date(foundInBlockchain.createdAt).toLocaleString()}\n`);
        setTestResult(prev => prev + '   🎉 PAGE RELOAD PERSISTENCE IS WORKING!\n');
      } else {
        setTestResult(prev => prev + '❌ FAILURE! Test permission not found after page reload.\n');
        setTestResult(prev => prev + `   Total permissions found: ${allPermissions.length}\n`);
      }
      
      // Check localStorage directly
      const storageData = localStorage.getItem('expiryX_mock_blockchain_permissions');
      if (storageData) {
        const parsedStorage = JSON.parse(storageData);
        const foundInStorage = parsedStorage.find(p => p.id === testId);
        
        if (foundInStorage) {
          setTestResult(prev => prev + '✅ Test permission also confirmed in localStorage\n');
        } else {
          setTestResult(prev => prev + '❌ Test permission missing from localStorage\n');
        }
      }
      
      // Clean up test data
      localStorage.removeItem('expiryX_page_reload_test_id');
      localStorage.removeItem('expiryX_page_reload_test_timestamp');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(prev => prev + `❌ Error checking page reload result: ${errorMessage}\n`);
    }
  };

  const clearAllData = () => {
    blockchain.clearAllPermissions();
    localStorage.removeItem('expiryX_permissions');
    localStorage.removeItem('expiryX_mock_blockchain_permissions');
    localStorage.removeItem('expiryX_mock_blockchain_permissions_backup');
    localStorage.removeItem('expiryX_mock_blockchain_last_save');
    localStorage.removeItem('expiryX_page_reload_test_id');
    localStorage.removeItem('expiryX_page_reload_test_timestamp');
    sessionStorage.removeItem('expiryX_emergency_backup');
    setTestResult('🗑️ All data cleared from memory and all storage locations\n' +
                  'This includes:\n' +
                  '  • React state (memory)\n' +
                  '  • localStorage (app permissions)\n' +
                  '  • localStorage (blockchain permissions)\n' +
                  '  • localStorage (backup)\n' +
                  '  • sessionStorage (emergency backup)\n' +
                  '  • Test data\n\n' +
                  '🔄 Refresh the page to verify everything is cleared.\n');
  };

  const showStorageStats = async () => {
    const memoryCount = blockchain.getPermissionCount();
    const hasPermissions = blockchain.hasPermissions();
    
    const blockchainStorage = localStorage.getItem('expiryX_mock_blockchain_permissions');
    const appStorage = localStorage.getItem('expiryX_permissions');
    
    let blockchainCount = 0;
    let appCount = 0;
    
    if (blockchainStorage) {
      try {
        blockchainCount = JSON.parse(blockchainStorage).length;
      } catch (e) {
        blockchainCount = -1; // Error parsing
      }
    }
    
    if (appStorage) {
      try {
        appCount = JSON.parse(appStorage).length;
      } catch (e) {
        appCount = -1; // Error parsing
      }
    }
    
    setTestResult(`📊 Current Storage Stats:\n` +
      `   🧠 Memory (Blockchain): ${memoryCount} permissions\n` +
      `   💾 localStorage (Blockchain): ${blockchainCount} permissions\n` +
      `   💾 localStorage (App): ${appCount} permissions\n` +
      `   🔍 Has permissions: ${hasPermissions}\n` +
      `   🕒 Checked at: ${new Date().toLocaleTimeString()}\n`);
  };

  // Auto-show stats on mount
  useEffect(() => {
    showStorageStats();
  }, []);

  return (
    <div className="persistence-test-panel p-4 bg-gray-800 rounded-lg border border-gray-600 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🧪</span>
        <h3 className="text-white font-semibold">Persistence Test Panel</h3>
      </div>
      
      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={runPersistenceTest}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-800 text-sm"
        >
          {isLoading ? '🔄 Testing...' : '🧪 Run Persistence Test'}
        </button>
        
        <button
          onClick={testPageReload}
          disabled={isLoading}
          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-800 text-sm"
        >
          {isLoading ? '🔄 Setting up...' : '🔄 Test Page Reload Persistence'}
        </button>
        
        <button
          onClick={checkPageReloadResult}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          🔍 Check Page Reload Result
        </button>
        
        <button
          onClick={showStorageStats}
          className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
        >
          📊 Show Storage Stats
        </button>
        
        <button
          onClick={clearAllData}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          🗑️ Clear All Data
        </button>
      </div>
      
      <div className="bg-gray-900 rounded p-3 font-mono text-xs text-green-400 whitespace-pre-wrap max-h-64 overflow-y-auto">
        {testResult || 'Click "Run Persistence Test" to verify that permissions persist after page reload.'}
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        💡 This panel tests whether permissions survive page reloads by storing them in localStorage.
        After running the test, refresh the page to see if permissions are still there!
      </div>
    </div>
  );
}
