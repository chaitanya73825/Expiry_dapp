// Permission Persistence Debug Helper
// This script helps debug and fix permission persistence issues

(function() {
    'use strict';
    
    console.log('🔍 Permission Persistence Debug Helper loaded');
    
    // Debug function to check localStorage state
    window.debugPermissions = function() {
        console.log('=== PERMISSION PERSISTENCE DEBUG ===');
        
        // Check all localStorage keys
        const allKeys = Object.keys(localStorage);
        console.log('All localStorage keys:', allKeys);
        
        // Check specific permission keys
        const permissionKeys = ['expiryX_permissions', 'permissions', 'expiryXFileAccess'];
        permissionKeys.forEach(key => {
            const value = localStorage.getItem(key);
            console.log(`${key}:`, value ? JSON.parse(value) : 'NOT FOUND');
        });
        
        // Check for corruption
        allKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value && (value.includes('Per anonym') || value.includes('Unexpected token'))) {
                console.warn('🚫 Corrupted data found in:', key, value.substring(0, 100));
            }
        });
        
        return {
            allKeys,
            permissions: localStorage.getItem('expiryX_permissions'),
            legacyPermissions: localStorage.getItem('permissions'),
            fileAccess: localStorage.getItem('expiryXFileAccess')
        };
    };
    
    // Function to create test permission
    window.createTestPermission = function() {
        const testPermission = {
            id: Date.now().toString(),
            recipient: 'test@example.com',
            fullSpender: '0x123abc...',
            amount: '100',
            expiry: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
            accessLevel: 'view',
            status: 'active',
            file: {
                name: 'test-file.txt',
                size: 1024,
                type: 'text/plain',
                data: 'data:text/plain;base64,VGVzdCBmaWxlIGNvbnRlbnQ='
            }
        };
        
        // Get existing permissions
        let permissions = [];
        try {
            const stored = localStorage.getItem('expiryX_permissions');
            if (stored) {
                permissions = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Error reading existing permissions:', e);
        }
        
        // Add test permission
        permissions.push(testPermission);
        
        // Save back to localStorage
        try {
            localStorage.setItem('expiryX_permissions', JSON.stringify(permissions));
            console.log('✅ Test permission created:', testPermission);
            console.log('Total permissions now:', permissions.length);
            
            // Trigger a page reload to test persistence
            if (confirm('Test permission created! Reload page to test persistence?')) {
                window.location.reload();
            }
        } catch (e) {
            console.error('❌ Failed to save test permission:', e);
        }
        
        return testPermission;
    };
    
    // Function to force save current permissions
    window.forceSavePermissions = function() {
        // Try to get permissions from React state
        const appElement = document.querySelector('[data-testid="app"]') || document.querySelector('.app');
        if (appElement && appElement._reactInternalFiber) {
            // Try to access React state (this is hacky but for debugging)
            console.log('Attempting to access React state...');
        }
        
        // Alternative: just ensure localStorage is working
        const testData = { test: 'data', timestamp: Date.now() };
        try {
            localStorage.setItem('expiryX_test', JSON.stringify(testData));
            const retrieved = JSON.parse(localStorage.getItem('expiryX_test'));
            localStorage.removeItem('expiryX_test');
            
            if (retrieved.test === 'data') {
                console.log('✅ localStorage is working correctly');
            } else {
                console.error('❌ localStorage data mismatch');
            }
        } catch (e) {
            console.error('❌ localStorage is not working:', e);
        }
    };
    
    // Function to clear all ExpiryX data
    window.clearAllExpiryXData = function() {
        const keys = ['expiryX_permissions', 'expiryX_theme', 'expiryXFileAccess', 'permissions'];
        keys.forEach(key => {
            localStorage.removeItem(key);
            console.log('Removed:', key);
        });
        console.log('✅ All ExpiryX data cleared');
    };
    
    // Auto-run debug on page load
    setTimeout(() => {
        console.log('🔍 Auto-running permission debug...');
        window.debugPermissions();
    }, 2000);
    
    console.log('📝 Available debug functions:');
    console.log('- debugPermissions(): Check permission storage state');
    console.log('- createTestPermission(): Add a test permission');
    console.log('- forceSavePermissions(): Test localStorage functionality');
    console.log('- clearAllExpiryXData(): Clear all stored data');
    
})();
