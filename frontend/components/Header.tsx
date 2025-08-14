import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import WalletSelector from './WalletSelector';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  activeTab: 'dashboard' | 'permissions' | 'analytics';
  onTabChange: (tab: 'dashboard' | 'permissions' | 'analytics') => void;
  notificationCount: number;
}

const Header: React.FC<HeaderProps> = ({ 
  theme, 
  onToggleTheme, 
  onOpenSettings, 
  onOpenNotifications, 
  activeTab, 
  onTabChange, 
  notificationCount 
}) => {
  const { account, connected } = useWallet();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">Ex</span>
            <span className="logo-text">ExpiryX</span>
          </div>
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onTabChange('dashboard')}
            >
              🏠 Dashboard
            </button>
            <button 
              className={`nav-tab ${activeTab === 'permissions' ? 'active' : ''}`}
              onClick={() => onTabChange('permissions')}
            >
              � Permissions
            </button>
            <button 
              className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => onTabChange('analytics')}
            >
              � Analytics
            </button>
          </nav>
          </nav>
        </div>
        
                <div className="header-right">
          <div className="header-actions">
            <button 
              className="notification-btn"
              onClick={onOpenNotifications}
              title="Notifications"
            >
              🔔
              {notificationCount > 0 && (
                <span className="notification-count">{notificationCount}</span>
              )}
            </button>
            
            <button 
              className="theme-toggle" 
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
            <button 
              className="settings-btn" 
              onClick={onOpenSettings}
              title="Settings"
            >
              ⚙️
            </button>
          </div>
      </div>
    </header>
  );
};

export default Header;
