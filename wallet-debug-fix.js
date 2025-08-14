// Persistent Wallet Debug Visibility Fixer
// This script ensures wallet debug info remains visible even after page refresh

(function() {
    'use strict';
    
    console.log('🔧 Initializing persistent wallet debug visibility fix...');
    
    // Configuration
    const DEBUG_STORAGE_KEY = 'walletDebugFixActive';
    const CHECK_INTERVAL = 500; // Check every 500ms
    
    // Store that the fix is active
    localStorage.setItem(DEBUG_STORAGE_KEY, 'true');
    
    // Enhanced element visibility fixer
    function fixElementVisibility(element) {
        if (!element || element.dataset.debugFixed === 'true') return;
        
        const computedStyle = window.getComputedStyle(element);
        const textColor = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        
        // Check for invisible text scenarios
        const isInvisible = (
            // White text on white background
            (textColor.includes('255, 255, 255') && backgroundColor.includes('255, 255, 255')) ||
            // White text on transparent background with white parent
            (textColor.includes('255, 255, 255') && backgroundColor === 'rgba(0, 0, 0, 0)') ||
            // Same color text and background
            (textColor === backgroundColor && textColor !== 'rgba(0, 0, 0, 0)')
        );
        
        if (isInvisible) {
            const fixedStyles = `
                color: #ffffff !important;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(30, 30, 30, 0.9)) !important;
                padding: 8px 12px !important;
                border-radius: 8px !important;
                border: 1px solid rgba(255, 255, 255, 0.4) !important;
                text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.9) !important;
                backdrop-filter: blur(15px) !important;
                margin: 4px 2px !important;
                display: inline-block !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                position: relative !important;
                z-index: 9999 !important;
            `;
            
            element.style.cssText += fixedStyles;
            element.dataset.debugFixed = 'true';
            console.log('✅ Fixed visibility for element:', element.textContent?.substring(0, 50));
        }
    }
    
    // Comprehensive wallet debug element finder
    function findAndFixWalletDebug() {
        const debugTexts = [
            'Connected:', 'Account: 0x', 'signAndSubmitTransaction', 
            'Wallet Debug', 'Test Wallet Transaction', 'Balance:',
            'Network:', 'Chain ID:', 'Wallet:', 'Address:'
        ];
        
        const selectors = [
            'div', 'span', 'p', 'pre', 'code', 'section', 'article',
            '[class*="wallet"]', '[class*="debug"]', '[class*="status"]',
            '[class*="account"]', '[class*="connected"]', '[class*="aptos"]',
            '[id*="wallet"]', '[id*="debug"]', '[id*="account"]'
        ];
        
        // Check all elements
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const text = element.textContent || element.innerText || '';
                    
                    // Check if element contains wallet debug text
                    const hasDebugText = debugTexts.some(debugText => 
                        text.includes(debugText)
                    );
                    
                    if (hasDebugText) {
                        console.log('🎯 Found wallet debug element:', text.substring(0, 100));
                        fixElementVisibility(element);
                        
                        // Fix parent container too
                        let parent = element.parentElement;
                        let level = 0;
                        while (parent && parent !== document.body && level < 3) {
                            fixElementVisibility(parent);
                            parent = parent.parentElement;
                            level++;
                        }
                    }
                    
                    // Also check for elements with poor visibility
                    if (text.length > 10) {
                        fixElementVisibility(element);
                    }
                });
            } catch (e) {
                console.warn('Error checking selector:', selector, e);
            }
        });
    }
    
    // Force styles for wallet-related elements
    function applyGlobalWalletStyles() {
        const styleId = 'wallet-debug-persistent-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            /* Persistent wallet debug styles */
            *[class*="wallet-status"] *,
            *[class*="account-info"] *,
            *[class*="connection-status"] * {
                color: #ffffff !important;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8) !important;
            }
            
            /* Force visibility for common patterns */
            div:has(*[text*="Connected:"]),
            div:has(*[text*="Account: 0x"]) {
                background: rgba(0, 0, 0, 0.8) !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                border-radius: 8px !important;
                padding: 12px !important;
            }
            
            /* Wallet adapter specific fixes */
            [class*="aptos-wallet-adapter"] {
                background: rgba(0, 0, 0, 0.9) !important;
                color: #ffffff !important;
                padding: 12px !important;
                border-radius: 8px !important;
                border: 1px solid rgba(255, 255, 255, 0.4) !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('📝 Applied persistent wallet styles');
    }
    
    // Initialize fix
    function initWalletDebugFix() {
        console.log('🚀 Starting wallet debug visibility monitor...');
        applyGlobalWalletStyles();
        findAndFixWalletDebug();
    }
    
    // Persistent monitoring with intervals
    function startPersistentMonitoring() {
        // Initial fix
        initWalletDebugFix();
        
        // Regular interval checks
        const intervalId = setInterval(() => {
            if (localStorage.getItem(DEBUG_STORAGE_KEY) === 'true') {
                findAndFixWalletDebug();
            } else {
                clearInterval(intervalId);
            }
        }, CHECK_INTERVAL);
        
        // Store interval ID for cleanup
        window.walletDebugIntervalId = intervalId;
        
        console.log('⏰ Persistent monitoring started');
    }
    
    // Enhanced mutation observer
    function setupAdvancedObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            
            mutations.forEach(mutation => {
                // Check for new nodes
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldCheck = true;
                }
                
                // Check for style changes
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    shouldCheck = true;
                }
            });
            
            if (shouldCheck) {
                setTimeout(findAndFixWalletDebug, 100);
            }
        });
        
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'id']
        });
        
        console.log('�️ Advanced mutation observer active');
    }
    
    // Handle page visibility changes
    function handleVisibilityChange() {
        if (!document.hidden) {
            console.log('�🔍 Page became visible, rechecking wallet debug elements...');
            setTimeout(findAndFixWalletDebug, 500);
        }
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Page visibility
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Focus events
        window.addEventListener('focus', () => {
            setTimeout(findAndFixWalletDebug, 300);
        });
        
        // Hash change (SPA navigation)
        window.addEventListener('hashchange', () => {
            setTimeout(findAndFixWalletDebug, 500);
        });
        
        // Storage events (for cross-tab coordination)
        window.addEventListener('storage', (e) => {
            if (e.key === DEBUG_STORAGE_KEY && e.newValue === 'true') {
                initWalletDebugFix();
            }
        });
    }
    
    // Cleanup function
    window.cleanupWalletDebugFix = function() {
        localStorage.removeItem(DEBUG_STORAGE_KEY);
        if (window.walletDebugIntervalId) {
            clearInterval(window.walletDebugIntervalId);
        }
        console.log('🧹 Wallet debug fix cleanup complete');
    };
    
    // Initialize everything when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                initWalletDebugFix();
                startPersistentMonitoring();
                setupAdvancedObserver();
                setupEventListeners();
            }, 100);
        });
    } else {
        // DOM is already ready
        setTimeout(() => {
            initWalletDebugFix();
            startPersistentMonitoring();
            setupAdvancedObserver();
            setupEventListeners();
        }, 100);
    }
    
    console.log('✨ Persistent wallet debug visibility system initialized');
})();
