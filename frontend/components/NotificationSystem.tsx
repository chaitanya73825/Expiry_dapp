import React, { useState, useEffect } from 'react';
import { Permission } from '../App';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

interface NotificationSystemProps {
  permissions: Permission[];
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ permissions, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'warnings'>('all');

  useEffect(() => {
    const generateNotifications = () => {
      const now = Date.now();
      const newNotifications: Notification[] = [];

      // Check for expiring permissions (within 24 hours)
      permissions.forEach(permission => {
        if (permission.status === 'active') {
          const timeToExpiry = permission.expiry - (now - new Date(permission.id).getTime());
          
          if (timeToExpiry <= 24 * 60 * 60 * 1000 && timeToExpiry > 0) {
            newNotifications.push({
              id: `expiring-${permission.id}`,
              type: 'warning',
              title: '⏰ Permission Expiring Soon',
              message: `Permission for ${permission.recipient.slice(0, 8)}... expires in ${Math.ceil(timeToExpiry / (60 * 60 * 1000))} hours`,
              timestamp: now,
              isRead: false,
              action: {
                label: 'Extend',
                callback: () => console.log('Extend permission', permission.id)
              }
            });
          }
        }
      });

      // Check for large file sizes (> 50MB)
      permissions.forEach(permission => {
        if (permission.file && permission.file.size > 50 * 1024 * 1024) {
          newNotifications.push({
            id: `large-file-${permission.id}`,
            type: 'info',
            title: '📦 Large File Shared',
            message: `File "${permission.file.name}" (${(permission.file.size / (1024 * 1024)).toFixed(1)}MB) was shared`,
            timestamp: new Date(permission.id).getTime(),
            isRead: false
          });
        }
      });

      // Security notifications for full access permissions
      permissions.filter(p => p.accessLevel === 'full' && p.status === 'active').forEach(permission => {
        newNotifications.push({
          id: `full-access-${permission.id}`,
          type: 'warning',
          title: '🔐 Full Access Granted',
          message: `Full access permission granted to ${permission.recipient.slice(0, 8)}...`,
          timestamp: new Date(permission.id).getTime(),
          isRead: false,
          action: {
            label: 'Review',
            callback: () => console.log('Review permission', permission.id)
          }
        });
      });

      // Welcome notification for first-time users
      if (permissions.length === 1) {
        newNotifications.push({
          id: 'welcome',
          type: 'success',
          title: '🎉 Welcome to ExpiryX!',
          message: 'You\'ve created your first permission! Explore analytics and manage your shared files.',
          timestamp: now,
          isRead: false
        });
      }

      // Achievement notifications
      if (permissions.length === 10) {
        newNotifications.push({
          id: 'achievement-10',
          type: 'success',
          title: '🏆 Power User Achievement',
          message: 'You\'ve created 10 permissions! You\'re becoming a sharing expert.',
          timestamp: now,
          isRead: false
        });
      }

      setNotifications(prev => {
        // Merge with existing, avoiding duplicates
        const existingIds = prev.map(n => n.id);
        const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.id));
        return [...prev, ...uniqueNew].sort((a, b) => b.timestamp - a.timestamp);
      });
    };

    generateNotifications();
  }, [permissions]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'warnings':
        return notification.type === 'warning' || notification.type === 'error';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isOpen) return null;

  return (
    <div className="notification-system-overlay" onClick={onClose}>
      <div className="notification-system" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <div className="notification-title">
            <h2>🔔 Notifications</h2>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>
          <div className="notification-actions">
            <button 
              className="notification-filter-btn"
              onClick={() => setFilter(filter === 'all' ? 'unread' : filter === 'unread' ? 'warnings' : 'all')}
            >
              {filter === 'all' ? '📋 All' : filter === 'unread' ? '👁️ Unread' : '⚠️ Warnings'}
            </button>
            <button className="notification-action-btn" onClick={markAllAsRead}>
              Mark All Read
            </button>
            <button className="notification-action-btn secondary" onClick={clearAll}>
              Clear All
            </button>
            <button className="notification-close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="notification-list">
          {filteredNotifications.length === 0 ? (
            <div className="notification-empty">
              <div className="empty-icon">🔕</div>
              <h3>No notifications</h3>
              <p>You're all caught up! New notifications will appear here.</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.type} ${notification.isRead ? 'read' : 'unread'}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-content">
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-body">
                    <div className="notification-title-text">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTimeAgo(notification.timestamp)}</div>
                  </div>
                  <div className="notification-controls">
                    {notification.action && (
                      <button
                        className="notification-action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          notification.action!.callback();
                        }}
                      >
                        {notification.action.label}
                      </button>
                    )}
                    <button
                      className="notification-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="notification-footer">
            <div className="notification-summary">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;
