// Helper functions for safe localStorage operations
export const clearExpiryXData = () => {
  try {
    // List of all ExpiryX localStorage keys
    const keys = [
      'expiryX_permissions',
      'expiryX_theme',
      'expiryXFileAccess',
      'permissions'  // Legacy key
    ];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared localStorage key: ${key}`);
    });
    
    console.log('All ExpiryX localStorage data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

export const safeGetLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored || stored === 'undefined' || stored === 'null') {
      return defaultValue;
    }
    
    // Check for corrupted data patterns
    if (stored.includes('Per anonym') || stored.includes('Unexpected token')) {
      console.warn(`Corrupted localStorage data detected for key "${key}":`, stored.substring(0, 100));
      localStorage.removeItem(key);
      return defaultValue;
    }
    
    // Basic JSON validation
    const trimmed = stored.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed;
      } catch (parseError) {
        console.warn(`Failed to parse JSON for key "${key}":`, parseError.message);
        localStorage.removeItem(key);
        return defaultValue;
      }
    }
    
    // If it's not JSON, return as string
    return stored;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    // Clear corrupted data
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.error(`Failed to remove corrupted key "${key}":`, removeError);
    }
    return defaultValue;
  }
};

export const safeSetLocalStorage = (key: string, value: any) => {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    return false;
  }
};

// Cleanup function to detect and remove corrupted localStorage data
export const cleanupCorruptedData = () => {
  console.log('=== SCANNING FOR CORRUPTED LOCALSTORAGE DATA ===');
  
  const allKeys = Object.keys(localStorage);
  let cleanedCount = 0;
  
  allKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        // Check for known corruption patterns
        if (value.includes('Per anonym') || 
            value.includes('Unexpected token') ||
            (value.includes('{') && !value.trim().startsWith('{')) ||
            (value.includes('[') && !value.trim().startsWith('['))) {
          
          console.warn(`Removing corrupted localStorage key: ${key}`);
          console.warn(`Corrupted value: ${value.substring(0, 100)}...`);
          localStorage.removeItem(key);
          cleanedCount++;
        }
      }
    } catch (error) {
      console.error(`Error checking key ${key}:`, error);
      localStorage.removeItem(key);
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`Cleaned ${cleanedCount} corrupted localStorage entries`);
  } else {
    console.log('No corrupted localStorage data found');
  }
  
  return cleanedCount;
};

// Export function to be called from browser console for debugging
(window as any).clearExpiryXData = clearExpiryXData;
(window as any).cleanupCorruptedData = cleanupCorruptedData;
(window as any).debugExpiryX = () => {
  console.log('=== EXPIRY X DEBUG INFO ===');
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('ExpiryX permissions:', safeGetLocalStorage('expiryX_permissions', 'NOT FOUND'));
  console.log('Legacy permissions:', safeGetLocalStorage('permissions', 'NOT FOUND'));
  console.log('ExpiryX theme:', safeGetLocalStorage('expiryX_theme', 'NOT FOUND'));
  console.log('File access data:', safeGetLocalStorage('expiryXFileAccess', 'NOT FOUND'));
  console.log('To clear all ExpiryX data, run: clearExpiryXData()');
  console.log('To clean corrupted data, run: cleanupCorruptedData()');
};
