import React, { useState, useEffect } from 'react';
import { Permission } from '../App';

interface AnalyticsDashboardProps {
  permissions: Permission[];
}

interface AnalyticsData {
  totalPermissions: number;
  activePermissions: number;
  expiredPermissions: number;
  revokedPermissions: number;
  totalFileSize: number;
  averageExpiryTime: number;
  mostUsedAccessLevel: string;
  recentActivity: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ permissions }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPermissions: 0,
    activePermissions: 0,
    expiredPermissions: 0,
    revokedPermissions: 0,
    totalFileSize: 0,
    averageExpiryTime: 0,
    mostUsedAccessLevel: 'view',
    recentActivity: 0
  });

  useEffect(() => {
    const calculateAnalytics = () => {
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

      const stats = permissions.reduce((acc, permission) => {
        acc.totalPermissions += 1;
        
        if (permission.status === 'active') acc.activePermissions += 1;
        else if (permission.status === 'expired') acc.expiredPermissions += 1;
        else if (permission.status === 'revoked') acc.revokedPermissions += 1;

        if (permission.file) {
          acc.totalFileSize += permission.file.size;
        }

        // Count access levels
        if (permission.accessLevel === 'view') acc.viewCount += 1;
        else if (permission.accessLevel === 'download') acc.downloadCount += 1;
        else if (permission.accessLevel === 'full') acc.fullCount += 1;

        // Recent activity (last 7 days)
        const permissionTime = new Date(permission.id).getTime();
        if (permissionTime > sevenDaysAgo) {
          acc.recentActivity += 1;
        }

        acc.totalExpiryTime += permission.expiry;

        return acc;
      }, {
        totalPermissions: 0,
        activePermissions: 0,
        expiredPermissions: 0,
        revokedPermissions: 0,
        totalFileSize: 0,
        viewCount: 0,
        downloadCount: 0,
        fullCount: 0,
        recentActivity: 0,
        totalExpiryTime: 0
      });

      // Determine most used access level
      let mostUsedAccessLevel = 'view';
      if (stats.downloadCount > stats.viewCount && stats.downloadCount > stats.fullCount) {
        mostUsedAccessLevel = 'download';
      } else if (stats.fullCount > stats.viewCount && stats.fullCount > stats.downloadCount) {
        mostUsedAccessLevel = 'full';
      }

      setAnalytics({
        totalPermissions: stats.totalPermissions,
        activePermissions: stats.activePermissions,
        expiredPermissions: stats.expiredPermissions,
        revokedPermissions: stats.revokedPermissions,
        totalFileSize: stats.totalFileSize,
        averageExpiryTime: stats.totalPermissions > 0 ? stats.totalExpiryTime / stats.totalPermissions : 0,
        mostUsedAccessLevel,
        recentActivity: stats.recentActivity
      });
    };

    calculateAnalytics();
  }, [permissions]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <div className="analytics-period">
          <span>Last 30 days</span>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Overview Stats */}
        <div className="analytics-card overview-card">
          <h3>Overview</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{analytics.totalPermissions}</div>
              <div className="stat-label">Total Permissions</div>
            </div>
            <div className="stat-item active">
              <div className="stat-value">{analytics.activePermissions}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-item expired">
              <div className="stat-value">{analytics.expiredPermissions}</div>
              <div className="stat-label">Expired</div>
            </div>
            <div className="stat-item revoked">
              <div className="stat-value">{analytics.revokedPermissions}</div>
              <div className="stat-label">Revoked</div>
            </div>
          </div>
        </div>

        {/* File Statistics */}
        <div className="analytics-card files-card">
          <h3>📁 File Statistics</h3>
          <div className="file-stats">
            <div className="file-stat">
              <span className="file-stat-label">Total Size:</span>
              <span className="file-stat-value">{formatBytes(analytics.totalFileSize)}</span>
            </div>
            <div className="file-stat">
              <span className="file-stat-label">Files Shared:</span>
              <span className="file-stat-value">{permissions.filter(p => p.file).length}</span>
            </div>
            <div className="file-stat">
              <span className="file-stat-label">Most Used Access:</span>
              <span className={`access-badge ${analytics.mostUsedAccessLevel}`}>
                {analytics.mostUsedAccessLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="analytics-card activity-card">
          <h3>🔥 Recent Activity</h3>
          <div className="activity-stats">
            <div className="activity-number">{analytics.recentActivity}</div>
            <div className="activity-label">New permissions this week</div>
            {analytics.recentActivity > 0 && (
              <div className="activity-trend positive">
                ↗️ {((analytics.recentActivity / analytics.totalPermissions) * 100).toFixed(1)}% of total
              </div>
            )}
          </div>
        </div>

        {/* Average Expiry Time */}
        <div className="analytics-card expiry-card">
          <h3>⏰ Expiry Insights</h3>
          <div className="expiry-stats">
            <div className="expiry-number">
              {formatTime(analytics.averageExpiryTime)}
            </div>
            <div className="expiry-label">Average expiry time</div>
            <div className="expiry-breakdown">
              <div className="expiry-item">
                <span>Short term (&lt;24h):</span>
                <span>{permissions.filter(p => p.expiry < 24 * 60 * 60 * 1000).length}</span>
              </div>
              <div className="expiry-item">
                <span>Medium term (1-7d):</span>
                <span>{permissions.filter(p => p.expiry >= 24 * 60 * 60 * 1000 && p.expiry <= 7 * 24 * 60 * 60 * 1000).length}</span>
              </div>
              <div className="expiry-item">
                <span>Long term (&gt;7d):</span>
                <span>{permissions.filter(p => p.expiry > 7 * 24 * 60 * 60 * 1000).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="analytics-progress">
        <div className="progress-item">
          <div className="progress-header">
            <span>Permission Status Distribution</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-segment active" 
              style={{ width: `${analytics.totalPermissions > 0 ? (analytics.activePermissions / analytics.totalPermissions) * 100 : 0}%` }}
            ></div>
            <div 
              className="progress-segment expired" 
              style={{ width: `${analytics.totalPermissions > 0 ? (analytics.expiredPermissions / analytics.totalPermissions) * 100 : 0}%` }}
            ></div>
            <div 
              className="progress-segment revoked" 
              style={{ width: `${analytics.totalPermissions > 0 ? (analytics.revokedPermissions / analytics.totalPermissions) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
