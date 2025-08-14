import React, { useEffect, useState } from 'react';
import { useBlockchainPermissions, BlockchainPermission, PendingTransaction } from '../services/blockchainService';
import { Permission } from '../App';

// Convert blockchain permission to app permission format
export function convertBlockchainToAppPermission(bp: BlockchainPermission): Permission {
    return {
        id: bp.id.toString(),
        recipient: bp.spender,
        fullSpender: bp.spender,
        amount: bp.amount.toString(),
        expiry: bp.expiryTimestamp * 1000, // Convert to milliseconds
        file: {
            name: `Permission ${bp.id}`,
            size: bp.amount,
            type: 'blockchain-permission',
            data: `tx:${bp.txHash || 'n/a'}`
        },
        accessLevel: 'full',
        status: bp.status === 'fully_spent' ? 'expired' : bp.status as 'active' | 'expired' | 'revoked'
    };
}

// Hook to integrate blockchain permissions with your app - WITH FULL PERSISTENCE
export function useIntegratedPermissions() {
    const blockchain = useBlockchainPermissions();
    const [appPermissions, setAppPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Convert blockchain permissions to app format whenever they change
    useEffect(() => {
        console.log('🔄 Converting blockchain permissions to app format...');
        const converted = blockchain.permissions.map(convertBlockchainToAppPermission);
        console.log('✅ Converted', converted.length, 'blockchain permissions');
        setAppPermissions(converted);
    }, [blockchain.permissions]);

    // Loading state
    useEffect(() => {
        setIsLoading(blockchain.loading);
    }, [blockchain.loading]);

    // Grant permission wrapper
    const grantPermission = async (
        spenderAddress: string,
        amount: number,
        expiryDate: Date
    ): Promise<boolean> => {
        const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);
        return await blockchain.grantPermission(spenderAddress, amount, expiryTimestamp);
    };

    // Revoke permission wrapper
    const revokePermission = async (permissionId: string): Promise<boolean> => {
        const id = parseInt(permissionId);
        return await blockchain.revokePermission(id);
    };

    return {
        // App-formatted permissions
        permissions: appPermissions,
        pendingTransactions: blockchain.pendingTransactions,
        loading: isLoading,
        error: blockchain.error,
        lastFetchTime: blockchain.lastFetchTime,

        // Actions
        grantPermission,
        revokePermission,
        refreshPermissions: blockchain.refreshPermissions,
        clearStoredData: blockchain.clearStoredData,

        // Utilities
        isPermissionValid: (id: string) => blockchain.isPermissionValid(parseInt(id)),
        getRemainingAllowance: (id: string) => blockchain.getRemainingAllowance(parseInt(id)),
        
        // Account info
        account: blockchain.account,
        isConnected: blockchain.isConnected,
        networkInfo: blockchain.getNetworkInfo()
    };
}

// Enhanced component to display blockchain status with persistence info
export function BlockchainStatus() {
    const { networkInfo, isConnected, loading, error, permissions, pendingTransactions, lastFetchTime } = useIntegratedPermissions();
    
    const formatTime = (timestamp: number) => {
        if (timestamp === 0) return 'Never';
        return new Date(timestamp).toLocaleTimeString();
    };

    const getStatusColor = (isConnected: boolean, error: string | null) => {
        if (error) return '#ef4444'; // red
        if (isConnected) return '#10b981'; // green
        return '#f59e0b'; // yellow
    };

    return (
        <div className="blockchain-status">
            <h3>🔗 Blockchain Status - Session Persistent</h3>
            <div className="status-grid">
                <div className="status-item">
                    <strong>Network:</strong> 
                    <span style={{ color: getStatusColor(isConnected, error) }}>
                        {networkInfo.network}
                    </span>
                </div>
                <div className="status-item">
                    <strong>Contract:</strong> 
                    <span style={{ fontSize: '0.8em' }}>{networkInfo.contractAddress}</span>
                </div>
                <div className="status-item">
                    <strong>Wallet:</strong> 
                    <span style={{ color: isConnected ? '#10b981' : '#ef4444' }}>
                        {isConnected ? '✅ Connected' : '❌ Disconnected'}
                    </span>
                </div>
                <div className="status-item">
                    <strong>Permissions:</strong> 
                    <span>{permissions.length} stored</span>
                </div>
                <div className="status-item">
                    <strong>Pending TXs:</strong> 
                    <span style={{ color: pendingTransactions.length > 0 ? '#f59e0b' : '#10b981' }}>
                        {pendingTransactions.length} active
                    </span>
                </div>
                <div className="status-item">
                    <strong>Last Sync:</strong> 
                    <span>{formatTime(lastFetchTime)}</span>
                </div>
                <div className="status-item">
                    <strong>Status:</strong> 
                    <span style={{ color: getStatusColor(isConnected, error) }}>
                        {loading ? '🔄 Loading...' : error ? '❌ Error' : '✅ Ready'}
                    </span>
                </div>
                {error && (
                    <div className="status-item error" style={{ gridColumn: '1 / -1' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}
            </div>
            
            {/* Pending Transactions Display */}
            {pendingTransactions.length > 0 && (
                <div className="pending-transactions" style={{ marginTop: '1rem' }}>
                    <h4>⏳ Active Transactions (Persist Across Sessions)</h4>
                    {pendingTransactions.map((tx) => (
                        <div key={tx.hash} className="pending-tx-item" style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '4px',
                            padding: '0.5rem',
                            margin: '0.25rem 0',
                            fontSize: '0.9em'
                        }}>
                            <div><strong>Type:</strong> {tx.type.toUpperCase()}</div>
                            <div><strong>Hash:</strong> <code style={{ fontSize: '0.8em' }}>{tx.hash.slice(0, 20)}...</code></div>
                            <div><strong>Status:</strong> {tx.status.toUpperCase()}</div>
                            <div><strong>Time:</strong> {new Date(tx.timestamp).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Enhanced test panel with session persistence features
export function BlockchainTestPanel() {
    const integrated = useIntegratedPermissions();
    const [testAddress, setTestAddress] = useState('0x1234567890abcdef1234567890abcdef12345678');
    const [testAmount, setTestAmount] = useState(100);
    const [testDays, setTestDays] = useState(7);

    const handleTestGrant = async () => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + testDays);
        
        console.log('🧪 Testing permission grant with persistence...');
        const success = await integrated.grantPermission(testAddress, testAmount, expiryDate);
        
        if (success) {
            console.log('✅ Test permission granted successfully (will persist across sessions)');
        } else {
            console.log('❌ Test permission grant failed');
        }
    };

    const handleRefresh = () => {
        console.log('🔄 Manual refresh requested');
        integrated.refreshPermissions();
    };

    const handleClearData = () => {
        console.log('🧹 Clearing all stored data...');
        integrated.clearStoredData();
    };

    const testSessionPersistence = () => {
        console.log('🔬 Testing session persistence...');
        console.log('Current permissions:', integrated.permissions.length);
        console.log('Pending transactions:', integrated.pendingTransactions.length);
        console.log('Last fetch time:', new Date(integrated.lastFetchTime).toLocaleString());
        
        alert(`Session Persistence Test:
        
✅ Permissions: ${integrated.permissions.length} stored
⏳ Pending TXs: ${integrated.pendingTransactions.length} active
🕒 Last sync: ${new Date(integrated.lastFetchTime).toLocaleString()}

Close this tab and reopen - data will persist!`);
    };

    return (
        <div className="blockchain-test-panel">
            <h3>🧪 Blockchain Test Panel - Session Persistence</h3>
            
            <div className="test-controls">
                <div>
                    <label>Test Spender Address:</label>
                    <input
                        type="text"
                        value={testAddress}
                        onChange={(e) => setTestAddress(e.target.value)}
                        placeholder="0x..."
                        style={{ fontFamily: 'monospace', fontSize: '0.8em' }}
                    />
                </div>
                
                <div>
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={testAmount}
                        onChange={(e) => setTestAmount(Number(e.target.value))}
                    />
                </div>
                
                <div>
                    <label>Expiry Days:</label>
                    <input
                        type="number"
                        value={testDays}
                        onChange={(e) => setTestDays(Number(e.target.value))}
                    />
                </div>
            </div>
            
            <div className="test-buttons">
                <button 
                    onClick={handleTestGrant}
                    disabled={integrated.loading || !integrated.isConnected}
                    style={{ background: '#10b981' }}
                >
                    🚀 Grant Permission (Persistent)
                </button>
                
                <button 
                    onClick={handleRefresh}
                    style={{ background: '#3b82f6' }}
                >
                    🔄 Refresh from Blockchain
                </button>

                <button 
                    onClick={testSessionPersistence}
                    style={{ background: '#8b5cf6' }}
                >
                    🔬 Test Persistence
                </button>
                
                <button 
                    onClick={handleClearData}
                    style={{ background: '#ef4444' }}
                >
                    🧹 Clear All Data
                </button>
            </div>
            
            <div className="test-results">
                <div><strong>Total Permissions:</strong> {integrated.permissions.length}</div>
                <div><strong>Pending Transactions:</strong> {integrated.pendingTransactions.length}</div>
                <div><strong>Blockchain Connected:</strong> {integrated.isConnected ? 'Yes' : 'No'}</div>
                <div><strong>Loading:</strong> {integrated.loading ? 'Yes' : 'No'}</div>
                <div><strong>Last Sync:</strong> {integrated.lastFetchTime ? new Date(integrated.lastFetchTime).toLocaleString() : 'Never'}</div>
                {integrated.error && <div className="error"><strong>Error:</strong> {integrated.error}</div>}
                
                <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    borderRadius: '4px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                    <strong>✅ Persistence Features:</strong>
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                        <li>Permissions survive browser refresh</li>
                        <li>Pending transactions persist across sessions</li>
                        <li>Auto-resume transaction monitoring</li>
                        <li>Close tab and reopen - data stays!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

// Component to show session persistence instructions
export function SessionPersistenceGuide() {
    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '1.5rem',
            margin: '1rem 0'
        }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>🎯 Session Persistence Test</h3>
            
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div>
                    <h4>1. Grant Permission</h4>
                    <p>Use test panel to grant a permission to blockchain</p>
                </div>
                
                <div>
                    <h4>2. Close Tab</h4>
                    <p>Close this browser tab completely</p>
                </div>
                
                <div>
                    <h4>3. Reopen App</h4>
                    <p>Open app in new tab and reconnect wallet</p>
                </div>
                
                <div>
                    <h4>4. Verify Data</h4>
                    <p>All permissions and pending TXs will be restored!</p>
                </div>
            </div>
            
            <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '4px'
            }}>
                <strong>✅ What Persists:</strong>
                <ul>
                    <li>All granted permissions from blockchain</li>
                    <li>Pending transaction status</li>
                    <li>Last sync timestamp</li>
                    <li>Account-specific data</li>
                </ul>
            </div>
        </div>
    );
}
