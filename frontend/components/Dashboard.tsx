import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCard, setActiveCard] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      id: 'file-share',
      icon: '🚀',
      title: 'Smart File Share',
      description: 'Lightning-fast QR code sharing',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      stats: '10x Faster',
      glow: 'rgba(102, 126, 234, 0.3)'
    },
    {
      id: 'token-access',
      icon: '💎',
      title: 'Premium Tokens',
      description: 'Advanced permission control',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      stats: '99.9% Secure',
      glow: 'rgba(240, 147, 251, 0.3)'
    },
    {
      id: 'time-locked',
      icon: '⚡',
      title: 'Time Warp',
      description: 'Precision expiry management',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      stats: 'Nano-second',
      glow: 'rgba(79, 172, 254, 0.3)'
    },
    {
      id: 'analytics',
      icon: '🎯',
      title: 'AI Analytics',
      description: 'Smart insights & predictions',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      stats: 'ML Powered',
      glow: 'rgba(67, 233, 123, 0.3)'
    }
  ];

  const quickStats = [
    { label: 'Active Users', value: '2.4K+', change: '+12%', trend: 'up' },
    { label: 'Files Shared', value: '15.8K', change: '+28%', trend: 'up' },
    { label: 'Success Rate', value: '99.9%', change: '+0.1%', trend: 'up' },
    { label: 'Response Time', value: '0.3ms', change: '-15%', trend: 'down' }
  ];

  return (
    <div className="enhanced-dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">ExpiryX</span> Token Manager
          </h1>
          <p className="hero-subtitle">
            Revolutionizing blockchain permissions with AI-powered precision
          </p>
          <div className="hero-time">
            <div className="time-display">
              <span className="time-label">System Time:</span>
              <span className="time-value">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {quickStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-label">{stat.label}</span>
              <span className={`stat-trend ${stat.trend}`}>
                {stat.trend === 'up' ? '📈' : '📉'} {stat.change}
              </span>
            </div>
            <div className="stat-value-large">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Interactive Feature Cards */}
      <div className="feature-grid">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className={`feature-card ${activeCard === feature.id ? 'active' : ''}`}
            onMouseEnter={() => setActiveCard(feature.id)}
            onMouseLeave={() => setActiveCard(null)}
            style={{
              '--gradient': feature.gradient,
              '--glow': feature.glow,
              animationDelay: `${index * 0.1}s`
            } as React.CSSProperties}
          >
            <div className="feature-background"></div>
            <div className="feature-content">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-stats">{feature.stats}</div>
            </div>
            <div className="feature-overlay">
              <button className="explore-btn">
                Explore Now →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Activity Feed */}
      <div className="activity-feed">
        <h3 className="feed-title">🔥 Live Activity</h3>
        <div className="activity-items">
          <div className="activity-item">
            <div className="activity-dot active"></div>
            <span>New permission created for 0x4a2b...f8c3</span>
            <span className="activity-time">2 min ago</span>
          </div>
          <div className="activity-item">
            <div className="activity-dot warning"></div>
            <span>Permission expires in 1 hour</span>
            <span className="activity-time">5 min ago</span>
          </div>
          <div className="activity-item">
            <div className="activity-dot success"></div>
            <span>File successfully shared via QR</span>
            <span className="activity-time">8 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
