import React, { useState } from 'react';
import { Permission } from '../App';

interface BulkOperationsProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkAction: (action: 'revoke' | 'extend' | 'delete' | 'export', permissionIds: string[]) => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  permissions,
  selectedPermissions,
  onSelectionChange,
  onBulkAction
}) => {
  const [showConfirmation, setShowConfirmation] = useState<{
    action: 'revoke' | 'extend' | 'delete' | 'export' | null;
    message: string;
  }>({ action: null, message: '' });

  const selectedPermissionObjects = permissions.filter(p => selectedPermissions.includes(p.id));
  const isAllSelected = permissions.length > 0 && selectedPermissions.length === permissions.length;
  const isSomeSelected = selectedPermissions.length > 0 && selectedPermissions.length < permissions.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(permissions.map(p => p.id));
    }
  };

  const handleBulkAction = (action: 'revoke' | 'extend' | 'delete' | 'export') => {
    if (selectedPermissions.length === 0) return;

    let message = '';
    const count = selectedPermissions.length;

    switch (action) {
      case 'revoke':
        message = `Are you sure you want to revoke ${count} permission${count > 1 ? 's' : ''}? This action cannot be undone.`;
        break;
      case 'extend':
        message = `Extend expiry time for ${count} permission${count > 1 ? 's' : ''}? They will be extended by 7 days.`;
        break;
      case 'delete':
        message = `Permanently delete ${count} permission${count > 1 ? 's' : ''}? This action cannot be undone and will remove all associated data.`;
        break;
      case 'export':
        message = `Export ${count} permission${count > 1 ? 's' : ''} to CSV file?`;
        break;
    }

    setShowConfirmation({ action, message });
  };

  const confirmAction = () => {
    if (showConfirmation.action) {
      onBulkAction(showConfirmation.action, selectedPermissions);
      setShowConfirmation({ action: null, message: '' });
      onSelectionChange([]);
    }
  };

  const cancelAction = () => {
    setShowConfirmation({ action: null, message: '' });
  };

  const getSelectionStats = () => {
    const stats = {
      active: 0,
      expired: 0,
      revoked: 0,
      withFiles: 0,
      totalFileSize: 0,
      accessLevels: { view: 0, download: 0, full: 0 }
    };

    selectedPermissionObjects.forEach(permission => {
      if (permission.status === 'active') stats.active++;
      else if (permission.status === 'expired') stats.expired++;
      else if (permission.status === 'revoked') stats.revoked++;

      if (permission.file) {
        stats.withFiles++;
        stats.totalFileSize += permission.file.size;
      }

      stats.accessLevels[permission.accessLevel]++;
    });

    return stats;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = getSelectionStats();

  if (selectedPermissions.length === 0 && !showConfirmation.action) {
    return (
      <div className="bulk-operations-hint">
        <div className="bulk-hint-content">
          <div className="bulk-hint-icon">👆</div>
          <div className="bulk-hint-text">
            <strong>Tip:</strong> Select permissions to perform bulk operations
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bulk-operations">
        <div className="bulk-selection">
          <div className="select-all-container">
            <label className="bulk-checkbox-container">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = isSomeSelected;
                }}
                onChange={handleSelectAll}
              />
              <span className="bulk-checkmark"></span>
              <span className="select-all-text">
                {isAllSelected ? 'Deselect All' : isSomeSelected ? 'Select All' : 'Select All'}
              </span>
            </label>
            <div className="selection-count">
              {selectedPermissions.length} of {permissions.length} selected
            </div>
          </div>

          {selectedPermissions.length > 0 && (
            <div className="selection-stats">
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-label">Active:</span>
                  <span className="stat-value active">{stats.active}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Expired:</span>
                  <span className="stat-value expired">{stats.expired}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Revoked:</span>
                  <span className="stat-value revoked">{stats.revoked}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">With Files:</span>
                  <span className="stat-value">{stats.withFiles}</span>
                </div>
                {stats.totalFileSize > 0 && (
                  <div className="stat-item">
                    <span className="stat-label">Total Size:</span>
                    <span className="stat-value">{formatBytes(stats.totalFileSize)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {selectedPermissions.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-actions-title">Bulk Actions:</div>
            <div className="bulk-buttons">
              <button 
                className="bulk-btn extend-btn"
                onClick={() => handleBulkAction('extend')}
                disabled={stats.active === 0}
                title={stats.active === 0 ? 'No active permissions selected' : `Extend ${stats.active} active permissions`}
              >
                <span className="bulk-btn-icon">⏰</span>
                Extend ({stats.active})
              </button>

              <button 
                className="bulk-btn revoke-btn"
                onClick={() => handleBulkAction('revoke')}
                disabled={stats.active === 0}
                title={stats.active === 0 ? 'No active permissions to revoke' : `Revoke ${stats.active} active permissions`}
              >
                <span className="bulk-btn-icon">🚫</span>
                Revoke ({stats.active})
              </button>

              <button 
                className="bulk-btn export-btn"
                onClick={() => handleBulkAction('export')}
                title={`Export ${selectedPermissions.length} permissions to CSV`}
              >
                <span className="bulk-btn-icon">📊</span>
                Export ({selectedPermissions.length})
              </button>

              <button 
                className="bulk-btn delete-btn"
                onClick={() => handleBulkAction('delete')}
                title={`Permanently delete ${selectedPermissions.length} permissions`}
              >
                <span className="bulk-btn-icon">🗑️</span>
                Delete ({selectedPermissions.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation.action && (
        <div className="bulk-confirmation-overlay">
          <div className="bulk-confirmation">
            <div className="confirmation-header">
              <div className="confirmation-icon">
                {showConfirmation.action === 'delete' ? '⚠️' :
                 showConfirmation.action === 'revoke' ? '🚫' :
                 showConfirmation.action === 'extend' ? '⏰' : '📊'}
              </div>
              <h3>
                {showConfirmation.action === 'delete' ? 'Delete Permissions' :
                 showConfirmation.action === 'revoke' ? 'Revoke Permissions' :
                 showConfirmation.action === 'extend' ? 'Extend Permissions' : 'Export Permissions'}
              </h3>
            </div>

            <div className="confirmation-message">
              {showConfirmation.message}
            </div>

            <div className="confirmation-details">
              <h4>Selected Permissions:</h4>
              <div className="selected-permissions-preview">
                {selectedPermissionObjects.slice(0, 3).map(permission => (
                  <div key={permission.id} className="permission-preview">
                    <div className="preview-recipient">
                      {permission.recipient.slice(0, 8)}...{permission.recipient.slice(-4)}
                    </div>
                    <div className={`preview-status ${permission.status}`}>
                      {permission.status}
                    </div>
                    {permission.file && (
                      <div className="preview-file">📎 {permission.file.name}</div>
                    )}
                  </div>
                ))}
                {selectedPermissionObjects.length > 3 && (
                  <div className="preview-more">
                    +{selectedPermissionObjects.length - 3} more...
                  </div>
                )}
              </div>
            </div>

            <div className="confirmation-actions">
              <button className="cancel-btn" onClick={cancelAction}>
                Cancel
              </button>
              <button 
                className={`confirm-btn ${showConfirmation.action}`}
                onClick={confirmAction}
              >
                {showConfirmation.action === 'delete' ? '🗑️ Delete' :
                 showConfirmation.action === 'revoke' ? '🚫 Revoke' :
                 showConfirmation.action === 'extend' ? '⏰ Extend' : '📊 Export'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkOperations;
