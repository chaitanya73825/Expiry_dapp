import React, { useState } from 'react';
import { Permission } from '../App';

interface AdvancedFiltersProps {
  permissions: Permission[];
  onFiltersChange: (filteredPermissions: Permission[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface FilterState {
  status: 'all' | 'active' | 'expired' | 'revoked';
  accessLevel: 'all' | 'view' | 'download' | 'full';
  dateRange: 'all' | '24h' | '7d' | '30d' | 'custom';
  fileType: 'all' | 'image' | 'document' | 'video' | 'other' | 'no-file';
  fileSize: 'all' | 'small' | 'medium' | 'large';
  recipient: string;
  customDateFrom: string;
  customDateTo: string;
  sortBy: 'date-desc' | 'date-asc' | 'expiry-desc' | 'expiry-asc' | 'size-desc' | 'size-asc';
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ 
  permissions, 
  onFiltersChange, 
  isOpen, 
  onClose 
}) => {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    accessLevel: 'all',
    dateRange: 'all',
    fileType: 'all',
    fileSize: 'all',
    recipient: '',
    customDateFrom: '',
    customDateTo: '',
    sortBy: 'date-desc'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const applyFilters = (newFilters: FilterState) => {
    let filtered = [...permissions];
    const now = Date.now();

    // Status filter
    if (newFilters.status !== 'all') {
      filtered = filtered.filter(p => p.status === newFilters.status);
    }

    // Access level filter
    if (newFilters.accessLevel !== 'all') {
      filtered = filtered.filter(p => p.accessLevel === newFilters.accessLevel);
    }

    // Date range filter
    if (newFilters.dateRange !== 'all') {
      const createdTime = (permission: Permission) => new Date(permission.id).getTime();
      
      switch (newFilters.dateRange) {
        case '24h':
          filtered = filtered.filter(p => createdTime(p) > now - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          filtered = filtered.filter(p => createdTime(p) > now - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          filtered = filtered.filter(p => createdTime(p) > now - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          if (newFilters.customDateFrom && newFilters.customDateTo) {
            const fromTime = new Date(newFilters.customDateFrom).getTime();
            const toTime = new Date(newFilters.customDateTo).getTime() + 24 * 60 * 60 * 1000; // End of day
            filtered = filtered.filter(p => {
              const pTime = createdTime(p);
              return pTime >= fromTime && pTime <= toTime;
            });
          }
          break;
      }
    }

    // File type filter
    if (newFilters.fileType !== 'all') {
      if (newFilters.fileType === 'no-file') {
        filtered = filtered.filter(p => !p.file);
      } else {
        filtered = filtered.filter(p => {
          if (!p.file) return false;
          const type = p.file.type.toLowerCase();
          
          switch (newFilters.fileType) {
            case 'image':
              return type.includes('image');
            case 'document':
              return type.includes('pdf') || type.includes('doc') || type.includes('text') || type.includes('application');
            case 'video':
              return type.includes('video');
            case 'other':
              return !type.includes('image') && !type.includes('pdf') && !type.includes('doc') && !type.includes('text') && !type.includes('video') && !type.includes('application');
            default:
              return true;
          }
        });
      }
    }

    // File size filter
    if (newFilters.fileSize !== 'all') {
      filtered = filtered.filter(p => {
        if (!p.file) return newFilters.fileSize === 'small';
        const size = p.file.size;
        
        switch (newFilters.fileSize) {
          case 'small':
            return size < 1024 * 1024; // < 1MB
          case 'medium':
            return size >= 1024 * 1024 && size < 10 * 1024 * 1024; // 1MB - 10MB
          case 'large':
            return size >= 10 * 1024 * 1024; // > 10MB
          default:
            return true;
        }
      });
    }

    // Recipient filter
    if (newFilters.recipient.trim()) {
      const searchTerm = newFilters.recipient.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.recipient.toLowerCase().includes(searchTerm) ||
        p.fullSpender.toLowerCase().includes(searchTerm)
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (newFilters.sortBy) {
        case 'date-asc':
          return new Date(a.id).getTime() - new Date(b.id).getTime();
        case 'date-desc':
          return new Date(b.id).getTime() - new Date(a.id).getTime();
        case 'expiry-asc':
          return a.expiry - b.expiry;
        case 'expiry-desc':
          return b.expiry - a.expiry;
        case 'size-asc':
          return (a.file?.size || 0) - (b.file?.size || 0);
        case 'size-desc':
          return (b.file?.size || 0) - (a.file?.size || 0);
        default:
          return 0;
      }
    });

    onFiltersChange(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      status: 'all',
      accessLevel: 'all',
      dateRange: 'all',
      fileType: 'all',
      fileSize: 'all',
      recipient: '',
      customDateFrom: '',
      customDateTo: '',
      sortBy: 'date-desc'
    };
    setFilters(defaultFilters);
    applyFilters(defaultFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.accessLevel !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.fileType !== 'all') count++;
    if (filters.fileSize !== 'all') count++;
    if (filters.recipient.trim()) count++;
    if (filters.sortBy !== 'date-desc') count++;
    return count;
  };

  const getStatusCounts = () => {
    return {
      active: permissions.filter(p => p.status === 'active').length,
      expired: permissions.filter(p => p.status === 'expired').length,
      revoked: permissions.filter(p => p.status === 'revoked').length
    };
  };

  const statusCounts = getStatusCounts();
  const activeFilterCount = getActiveFilterCount();

  if (!isOpen) return null;

  return (
    <div className="advanced-filters-overlay" onClick={onClose}>
      <div className="advanced-filters" onClick={e => e.stopPropagation()}>
        <div className="filters-header">
          <div className="filters-title">
            <h2>🔍 Advanced Filters</h2>
            {activeFilterCount > 0 && (
              <span className="active-filters-badge">{activeFilterCount} active</span>
            )}
          </div>
          <div className="filters-actions">
            <button className="filter-reset-btn" onClick={resetFilters}>
              Reset All
            </button>
            <button className="filters-close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="filters-content">
          {/* Quick Filters */}
          <div className="filter-section">
            <h3>Quick Filters</h3>
            <div className="filter-row">
              <div className="filter-group">
                <label>Status</label>
                <select 
                  value={filters.status} 
                  onChange={e => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All ({permissions.length})</option>
                  <option value="active">Active ({statusCounts.active})</option>
                  <option value="expired">Expired ({statusCounts.expired})</option>
                  <option value="revoked">Revoked ({statusCounts.revoked})</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Access Level</label>
                <select 
                  value={filters.accessLevel} 
                  onChange={e => handleFilterChange('accessLevel', e.target.value)}
                >
                  <option value="all">All Access Levels</option>
                  <option value="view">👁️ View Only</option>
                  <option value="download">📥 Download</option>
                  <option value="full">🔓 Full Access</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Date Range</label>
                <select 
                  value={filters.dateRange} 
                  onChange={e => handleFilterChange('dateRange', e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {filters.dateRange === 'custom' && (
              <div className="custom-date-range">
                <div className="filter-group">
                  <label>From</label>
                  <input
                    type="date"
                    value={filters.customDateFrom}
                    onChange={e => handleFilterChange('customDateFrom', e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>To</label>
                  <input
                    type="date"
                    value={filters.customDateTo}
                    onChange={e => handleFilterChange('customDateTo', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="advanced-toggle">
            <button 
              className="toggle-advanced-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '📄 Hide Advanced' : '⚙️ Show Advanced'}
            </button>
          </div>

          {showAdvanced && (
            <>
              {/* File Filters */}
              <div className="filter-section">
                <h3>File Filters</h3>
                <div className="filter-row">
                  <div className="filter-group">
                    <label>File Type</label>
                    <select 
                      value={filters.fileType} 
                      onChange={e => handleFilterChange('fileType', e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="image">🖼️ Images</option>
                      <option value="document">📄 Documents</option>
                      <option value="video">🎥 Videos</option>
                      <option value="other">📦 Other</option>
                      <option value="no-file">🚫 No File</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>File Size</label>
                    <select 
                      value={filters.fileSize} 
                      onChange={e => handleFilterChange('fileSize', e.target.value)}
                    >
                      <option value="all">All Sizes</option>
                      <option value="small">🐭 Small (&lt;1MB)</option>
                      <option value="medium">📊 Medium (1-10MB)</option>
                      <option value="large">🐘 Large (&gt;10MB)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Search & Sort */}
              <div className="filter-section">
                <h3>Search & Sort</h3>
                <div className="filter-row">
                  <div className="filter-group wide">
                    <label>Search Recipient</label>
                    <input
                      type="text"
                      placeholder="Enter address or name..."
                      value={filters.recipient}
                      onChange={e => handleFilterChange('recipient', e.target.value)}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Sort By</label>
                    <select 
                      value={filters.sortBy} 
                      onChange={e => handleFilterChange('sortBy', e.target.value)}
                    >
                      <option value="date-desc">📅 Newest First</option>
                      <option value="date-asc">📅 Oldest First</option>
                      <option value="expiry-desc">⏰ Expires Last</option>
                      <option value="expiry-asc">⏰ Expires First</option>
                      <option value="size-desc">📊 Largest Files</option>
                      <option value="size-asc">📊 Smallest Files</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="filters-footer">
          <div className="filter-summary">
            Showing {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
            {activeFilterCount > 0 && ` with ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied`}
          </div>
          <button className="apply-filters-btn" onClick={onClose}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
