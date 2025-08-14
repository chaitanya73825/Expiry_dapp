import appConfig from '../config/appConfig.json';
import mockConfig from './mockBlockchainConfig.json';

export interface AppConfig {
  blockchain: {
    real: {
      contractAddress: string;
      network: string;
      networkUrl: string;
      faucetUrl: string;
      moduleAddress: string;
      gasLimit: number;
      gasPrice: number;
    };
    mock: {
      contractAddress: string;
      network: string;
      networkUrl: string;
      faucetUrl: string;
      transactionDelay: number;
      connectionDelay: number;
      revokeDelay: number;
    };
  };
  ui: {
    themes: Record<string, Record<string, string>>;
    components: Record<string, Record<string, any>>;
  };
  storage: {
    localStorage: {
      keyPrefix: string;
      enableCompression: boolean;
      maxSize: number;
    };
    sessionStorage: {
      keyPrefix: string;
      autoCleanup: boolean;
    };
  };
  debugging: {
    enableLogs: boolean;
    logLevel: string;
    enablePerformanceTracking: boolean;
    enableErrorReporting: boolean;
    consoleCommands: Record<string, string>;
  };
  features: {
    permissions: {
      defaultExpiry: string;
      maxExpiry: string;
      allowRevoke: boolean;
      autoCleanupExpired: boolean;
    };
    files: {
      enableEncryption: boolean;
      compressionLevel: number;
      enableThumbnails: boolean;
      supportedFormats: string[];
    };
    wallet: {
      autoConnect: boolean;
      supportedWallets: string[];
      requireConnection: boolean;
    };
  };
  metadata: {
    version: string;
    lastUpdated: string;
    configType: string;
    environment: string;
  };
}

class JSONConfigManager {
  private config: AppConfig;
  private mockConfig: typeof mockConfig;

  constructor() {
    this.config = appConfig as AppConfig;
    this.mockConfig = mockConfig;
    
    this.logIfEnabled('📋 JSON Config Manager initialized', {
      version: this.config.metadata.version,
      environment: this.config.metadata.environment
    });
  }

  // Get full configuration
  getConfig(): AppConfig {
    return this.config;
  }

  // Get mock blockchain configuration
  getMockConfig() {
    return this.mockConfig;
  }

  // Get blockchain configuration based on mode
  getBlockchainConfig(mode: 'real' | 'mock') {
    return mode === 'real' ? this.config.blockchain.real : this.config.blockchain.mock;
  }

  // Get UI configuration
  getUIConfig() {
    return this.config.ui;
  }

  // Get storage configuration
  getStorageConfig() {
    return this.config.storage;
  }

  // Get debugging configuration
  getDebuggingConfig() {
    return this.config.debugging;
  }

  // Get features configuration
  getFeaturesConfig() {
    return this.config.features;
  }

  // Update configuration (for runtime changes)
  updateConfig(path: string, value: any) {
    const keys = path.split('.');
    let current: any = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    this.logIfEnabled(`⚙️ Config updated: ${path} = ${JSON.stringify(value)}`);
  }

  // Get configuration value by path
  getConfigValue(path: string): any {
    const keys = path.split('.');
    let current: any = this.config;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  // Validate configuration
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    if (!this.config.blockchain.real.networkUrl) {
      errors.push('Real blockchain network URL is missing');
    }
    
    if (!this.config.blockchain.mock.contractAddress) {
      errors.push('Mock blockchain contract address is missing');
    }
    
    if (!this.config.metadata.version) {
      errors.push('Configuration version is missing');
    }
    
    // Check feature compatibility
    if (this.config.features.files.enableEncryption && !this.config.features.files.supportedFormats.length) {
      errors.push('Encryption enabled but no supported file formats specified');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Export current configuration as JSON
  exportConfig() {
    return {
      appConfig: this.config,
      mockConfig: this.mockConfig,
      exportedAt: new Date().toISOString(),
      version: this.config.metadata.version
    };
  }

  // Get console commands for debugging
  getConsoleCommands(): Record<string, string> {
    return this.config.debugging.consoleCommands;
  }

  // Check if feature is enabled
  isFeatureEnabled(featurePath: string): boolean {
    const value = this.getConfigValue(`features.${featurePath}`);
    return Boolean(value);
  }

  // Get themed value
  getThemedValue(theme: string, property: string): string {
    return this.config.ui.themes[theme]?.[property] || '#000000';
  }

  // Log if debugging is enabled
  private logIfEnabled(message: string, data?: any) {
    if (this.config.debugging.enableLogs) {
      console.log(message);
      if (data) {
        console.log(data);
      }
    }
  }

  // Performance tracking
  startPerformanceTimer(label: string): (() => void) | null {
    if (!this.config.debugging.enablePerformanceTracking) {
      return null;
    }
    
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.logIfEnabled(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    };
  }
}

// Create global configuration manager
export const configManager = new JSONConfigManager();

// React hook for configuration
export function useJSONConfig() {
  return {
    config: configManager.getConfig(),
    mockConfig: configManager.getMockConfig(),
    getBlockchainConfig: (mode: 'real' | 'mock') => configManager.getBlockchainConfig(mode),
    getConfigValue: (path: string) => configManager.getConfigValue(path),
    updateConfig: (path: string, value: any) => configManager.updateConfig(path, value),
    isFeatureEnabled: (feature: string) => configManager.isFeatureEnabled(feature),
    getThemedValue: (theme: string, property: string) => configManager.getThemedValue(theme, property),
    exportConfig: () => configManager.exportConfig(),
    validateConfig: () => configManager.validateConfig()
  };
}

// Add to global window for debugging
if (typeof window !== 'undefined') {
  window.configManager = configManager;
  
  window.showAppConfig = function() {
    console.log('📋 Current App Configuration:', configManager.getConfig());
  };
  
  window.validateAppConfig = function() {
    const validation = configManager.validateConfig();
    console.log('✅ Configuration Validation:', validation);
    return validation;
  };
  
  window.exportAppConfig = function() {
    const exported = configManager.exportConfig();
    console.log('📤 Exported Configuration:', exported);
    return exported;
  };
  
  // Add console commands from config
  const commands = configManager.getConsoleCommands();
  Object.entries(commands).forEach(([name, command]) => {
    console.log(`💡 Debug command available: ${command}`);
  });
}

export { JSONConfigManager };
