import React from 'react';

interface SettingsModalProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  theme, 
  onToggleTheme, 
  onClose 
}) => {
  const clearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('expiryX_permissions');
      localStorage.removeItem('expiryXFileAccess');
      localStorage.removeItem('expiryX_theme');
      alert('All data cleared successfully!');
      window.location.reload();
    }
  };

  const exportData = () => {
    const permissions = localStorage.getItem('expiryX_permissions') || '[]';
    const fileAccess = localStorage.getItem('expiryXFileAccess') || '{}';
    
    const data = {
      permissions: JSON.parse(permissions),
      fileAccess: JSON.parse(fileAccess),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExpiryX-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚙️ Settings</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="settings-section">
            <h4>🎨 Appearance</h4>
            <div className="setting-item">
              <div className="setting-info">
                <label>Theme</label>
                <p>Choose between light and dark mode</p>
              </div>
              <button 
                className={`theme-toggle-btn ${theme}`}
                onClick={onToggleTheme}
              >
                <div className="toggle-slider">
                  <span className="toggle-icon">
                    {theme === 'light' ? '☀️' : '🌙'}
                  </span>
                </div>
              </button>
            </div>
          </div>
          
          <div className="settings-section">
            <h4>💾 Data Management</h4>
            <div className="setting-item">
              <div className="setting-info">
                <label>Export Data</label>
                <p>Download your permissions and files as JSON</p>
              </div>
              <button className="btn btn-success" onClick={exportData}>
                📤 Export
              </button>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>Clear All Data</label>
                <p>Remove all permissions and stored files</p>
              </div>
              <button className="btn btn-danger" onClick={clearData}>
                🗑️ Clear All
              </button>
            </div>
          </div>
          
          <div className="settings-section">
            <h4>ℹ️ About ExpiryX</h4>
            <div className="about-info">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Built with:</strong> React + Aptos</p>
              <p><strong>Features:</strong> File sharing with QR codes, time-based permissions, secure access control</p>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
