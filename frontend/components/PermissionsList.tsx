import React from 'react';
import { Permission } from '../App';

interface PermissionsListProps {
  permissions: Permission[];
  onRevokePermission: (id: string) => void;
  onShowQR: (permission: Permission) => void;
}

const PermissionsList: React.FC<PermissionsListProps> = ({ 
  permissions, 
  onRevokePermission, 
  onShowQR 
}) => {
  const getTimeRemaining = (expiry: number) => {
    const now = Date.now();
    const timeLeft = expiry - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'expired': return '🔴';
      case 'revoked': return '🚫';
      default: return '⚪';
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'view': return '👁️';
      case 'download': return '⬇️';
      case 'full': return '🔓';
      default: return '❓';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="permissions-section">
      <div className="section-header">
        <h2>Active Permissions</h2>
        <button className="refresh-btn" onClick={() => window.location.reload()}>
          🔄 Refresh
        </button>
      </div>
      
      {permissions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No permissions yet</h3>
          <p>Upload a file and create your first permission to get started.</p>
        </div>
      ) : (
        <div className="permissions-grid">
          {permissions.map((permission) => (
            <div key={permission.id} className={`permission-card ${permission.status}`}>
              <div className="permission-header">
                <div className="permission-status">
                  {getStatusIcon(permission.status)} {permission.status.toUpperCase()}
                </div>
                <div className="permission-time">
                  ⏱️ {getTimeRemaining(permission.expiry)}
                </div>
              </div>
              
              {permission.file && (
                <div className="file-info">
                  <div className="file-icon-name">
                    <div className="file-icon-large">📄</div>
                    <div className="file-details">
                      <div className="file-name">{permission.file.name}</div>
                      <div className="file-meta">
                        {formatFileSize(permission.file.size)} • {permission.file.type}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Separator line for better visual separation */}
              <div className="section-divider"></div>
              
              <div className="permission-details">
                <div className="detail-row">
                  <span className="label">👤 Recipient:</span>
                  <span className="value recipient-address">
                    {permission.recipient.slice(0, 8)}...{permission.recipient.slice(-6)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">💰 Amount:</span>
                  <span className="value">{permission.amount} APT</span>
                </div>
                <div className="detail-row">
                  <span className="label">🔐 Access:</span>
                  <span className="value">
                    {getAccessLevelIcon(permission.accessLevel)} {permission.accessLevel}
                  </span>
                </div>
              </div>
              
              <div className="permission-actions">
                {permission.status === 'active' && (
                  <>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onShowQR(permission)}
                      title="Generate QR Code"
                    >
                      🔲 QR Code
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => onRevokePermission(permission.id)}
                      title="Revoke Permission"
                    >
                      🚫 Revoke
                    </button>
                  </>
                )}
                {permission.status === 'expired' && (
                  <div className="status-message">
                    ⏰ This permission has expired
                  </div>
                )}
                {permission.status === 'revoked' && (
                  <div className="status-message">
                    🚫 This permission was revoked
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionsList;
