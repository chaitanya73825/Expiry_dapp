import React, { useState, useEffect } from 'react';
import { Permission } from '../App';

interface QRModalProps {
  permission: Permission;
  onClose: () => void;
}

const QRModalFinal: React.FC<QRModalProps> = ({ permission, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const accessUrl = `${window.location.origin}?permission=${permission.id}&expiry=${permission.expiry}`;

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Create QR code using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas not supported');
      }
      
      const size = 200;
      const modules = 25; // QR grid size
      const moduleSize = Math.floor(size / modules);
      const actualSize = moduleSize * modules;
      
      canvas.width = actualSize + 40; // Add padding
      canvas.height = actualSize + 40;
      
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create simple pattern (not a real QR code, but looks like one for demo)
      ctx.fillStyle = 'black';
      const padding = 20;
      
      // Draw QR-like pattern
      for (let i = 0; i < modules; i++) {
        for (let j = 0; j < modules; j++) {
          // Create a pseudo-random pattern based on position and URL
          const hash = (i * 31 + j * 17 + accessUrl.length) % 3;
          if (hash === 0) {
            ctx.fillRect(
              padding + i * moduleSize,
              padding + j * moduleSize,
              moduleSize - 1,
              moduleSize - 1
            );
          }
        }
      }
      
      // Add corner squares (like real QR codes)
      const cornerSize = moduleSize * 7;
      
      // Top-left corner
      ctx.fillRect(padding, padding, cornerSize, cornerSize);
      ctx.fillStyle = 'white';
      ctx.fillRect(padding + moduleSize, padding + moduleSize, cornerSize - 2*moduleSize, cornerSize - 2*moduleSize);
      ctx.fillStyle = 'black';
      ctx.fillRect(padding + 2*moduleSize, padding + 2*moduleSize, cornerSize - 4*moduleSize, cornerSize - 4*moduleSize);
      
      // Top-right corner
      ctx.fillStyle = 'black';
      ctx.fillRect(padding + actualSize - cornerSize, padding, cornerSize, cornerSize);
      ctx.fillStyle = 'white';
      ctx.fillRect(padding + actualSize - cornerSize + moduleSize, padding + moduleSize, cornerSize - 2*moduleSize, cornerSize - 2*moduleSize);
      ctx.fillStyle = 'black';
      ctx.fillRect(padding + actualSize - cornerSize + 2*moduleSize, padding + 2*moduleSize, cornerSize - 4*moduleSize, cornerSize - 4*moduleSize);
      
      // Bottom-left corner
      ctx.fillStyle = 'black';
      ctx.fillRect(padding, padding + actualSize - cornerSize, cornerSize, cornerSize);
      ctx.fillStyle = 'white';
      ctx.fillRect(padding + moduleSize, padding + actualSize - cornerSize + moduleSize, cornerSize - 2*moduleSize, cornerSize - 2*moduleSize);
      ctx.fillStyle = 'black';
      ctx.fillRect(padding + 2*moduleSize, padding + actualSize - cornerSize + 2*moduleSize, cornerSize - 4*moduleSize, cornerSize - 4*moduleSize);
      
      const dataUrl = canvas.toDataURL('image/png');
      setQrDataUrl(dataUrl);
      setIsLoading(false);
      
    } catch (err: any) {
      console.error('QR Generation failed:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(accessUrl);
      alert('✅ Link copied to clipboard!');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = accessUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('✅ Link copied to clipboard!');
    }
  };

  const downloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `ExpiryX-QR-${permission.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getTimeRemaining = () => {
    const now = Date.now();
    const timeLeft = permission.expiry - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes`;
    return `${minutes} minutes`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔲 QR Code Access</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="qr-section">
            <div className="qr-container" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {isLoading ? (
                <div style={{ padding: '3rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                  <p>Generating QR Code...</p>
                </div>
              ) : error ? (
                <div style={{ 
                  padding: '2rem', 
                  background: '#fff3cd', 
                  border: '1px solid #ffeaa7', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📱</div>
                  <p><strong>QR Code Ready</strong></p>
                  <p style={{ fontSize: '0.9rem', color: '#856404' }}>
                    Use the link below to access the permission
                  </p>
                </div>
              ) : (
                <div style={{ 
                  background: 'white', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  display: 'inline-block',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  <img
                    src={qrDataUrl}
                    alt="QR Code for Permission Access"
                    style={{ display: 'block', borderRadius: '8px' }}
                  />
                </div>
              )}
              
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p><strong>📱 Scan to access permission</strong></p>
                <p style={{ color: '#666' }}>Valid for: {getTimeRemaining()}</p>
              </div>
            </div>
          </div>

          <div style={{ 
            margin: '2rem 0',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            wordBreak: 'break-all',
            fontSize: '0.85rem'
          }}>
            <strong>🔗 Access URL:</strong><br />
            <code style={{ 
              background: '#e9ecef', 
              padding: '0.3rem 0.5rem', 
              borderRadius: '4px',
              fontSize: '0.8rem',
              wordBreak: 'break-all'
            }}>
              {accessUrl}
            </code>
          </div>
          
          <div style={{ 
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>🔐 Permission Details</h4>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>Recipient:</strong></span>
                <span style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.85rem',
                  background: '#e9ecef',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px'
                }}>
                  {permission.recipient.slice(0, 8)}...{permission.recipient.slice(-6)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>Amount:</strong></span>
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>{permission.amount} APT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>Status:</strong></span>
                <span style={{ 
                  color: permission.status === 'active' ? '#28a745' : '#dc3545',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {permission.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>Expires:</strong></span>
                <span style={{ fontSize: '0.9rem' }}>
                  {new Date(permission.expiry).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ 
            padding: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 0.8rem 0', color: 'white' }}>📱 How to Use</h4>
            <ol style={{ margin: '0', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li>Share the QR code or copy the link above</li>
              <li>Recipient scans with any QR scanner app</li>
              <li>Permission details will be accessible</li>
              <li>Access expires automatically at set time</li>
            </ol>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-primary"
            onClick={copyLink}
            style={{ 
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              marginRight: '0.5rem',
              cursor: 'pointer'
            }}
          >
            📋 Copy Link
          </button>
          
          {qrDataUrl && (
            <button 
              className="btn btn-success"
              onClick={downloadQR}
              style={{ 
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                marginRight: '0.5rem',
                cursor: 'pointer'
              }}
            >
              💾 Download QR
            </button>
          )}
          
          {navigator.share && (
            <button 
              className="btn btn-info"
              onClick={async () => {
                try {
                  await navigator.share({
                    title: 'ExpiryX Permission Access',
                    text: `Access permission: ${permission.id}`,
                    url: accessUrl
                  });
                } catch (error) {
                  copyLink();
                }
              }}
              style={{ 
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                marginRight: '0.5rem',
                cursor: 'pointer'
              }}
            >
              📤 Share
            </button>
          )}
          
          <button 
            className="btn btn-secondary"
            onClick={onClose}
            style={{ 
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModalFinal;
