import React, { useState } from 'react';
import { Permission } from '../App';

interface QRModalProps {
  permission: Permission;
  onClose: () => void;
}

// Simple QR code generator using Google Charts API (reliable fallback)
const generateQRCodeURL = (text: string): string => {
  const size = '200x200';
  const encodedText = encodeURIComponent(text);
  return `https://chart.googleapis.com/chart?chs=${size}&cht=qr&chl=${encodedText}`;
};

const QRModalWorking: React.FC<QRModalProps> = ({ permission, onClose }) => {
  const [imageError, setImageError] = useState(false);
  const accessUrl = `${window.location.origin}?permission=${permission.id}&expiry=${permission.expiry}`;
  const qrImageUrl = generateQRCodeURL(accessUrl);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(accessUrl);
      alert('✅ Link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      // Fallback: select the text
      const textArea = document.createElement('textarea');
      textArea.value = accessUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('✅ Link copied to clipboard!');
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
            <div className="qr-container" style={{ textAlign: 'center' }}>
              {!imageError ? (
                <div style={{ 
                  background: 'white', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  display: 'inline-block',
                  margin: '0 auto'
                }}>
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    width="200"
                    height="200"
                    onError={() => setImageError(true)}
                    style={{ display: 'block' }}
                  />
                </div>
              ) : (
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                  <p><strong>QR Code Generation</strong></p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Unable to generate QR image.<br />
                    Please copy the link below instead.
                  </p>
                </div>
              )}
              
              <div className="qr-info" style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p><strong>Scan to access permission</strong></p>
                <p>Valid for: {getTimeRemaining()}</p>
              </div>
            </div>
          </div>

          <div className="access-url" style={{ 
            margin: '2rem 0',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            wordBreak: 'break-all',
            fontSize: '0.9rem'
          }}>
            <strong>Access URL:</strong><br />
            <code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
              {accessUrl}
            </code>
          </div>
          
          <div className="permission-details">
            <h4>🔐 Permission Details</h4>
            <div className="detail-grid" style={{ 
              display: 'grid', 
              gap: '0.8rem',
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label"><strong>Recipient:</strong></span>
                <span className="value">
                  {permission.recipient.slice(0, 8)}...{permission.recipient.slice(-6)}
                </span>
              </div>
              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label"><strong>Amount:</strong></span>
                <span className="value">{permission.amount} APT</span>
              </div>
              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label"><strong>Status:</strong></span>
                <span className={`status ${permission.status}`} style={{ 
                  color: permission.status === 'active' ? '#28a745' : '#dc3545',
                  fontWeight: 'bold'
                }}>
                  {permission.status.toUpperCase()}
                </span>
              </div>
              <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label"><strong>Expires:</strong></span>
                <span className="value">
                  {new Date(permission.expiry).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="instructions" style={{ 
            marginTop: '2rem',
            padding: '1rem',
            background: '#e8f4f8',
            borderRadius: '8px',
            borderLeft: '4px solid #17a2b8'
          }}>
            <h4>📱 How to Use</h4>
            <ol style={{ margin: '0.5rem 0 0 1.2rem' }}>
              <li>Share the QR code or link with the recipient</li>
              <li>They can scan it with any QR scanner app</li>
              <li>The permission details will be accessible</li>
              <li>Access expires automatically at the set time</li>
            </ol>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={copyLink}>
            📋 Copy Link
          </button>
          <button className="btn btn-success" onClick={() => {
            const link = document.createElement('a');
            link.href = qrImageUrl;
            link.download = `ExpiryX-QR-${permission.id}.png`;
            link.click();
          }}>
            💾 Download QR
          </button>
          {navigator.share && (
            <button className="btn btn-info" onClick={async () => {
              try {
                await navigator.share({
                  title: 'ExpiryX Permission Access',
                  text: `Access permission: ${permission.id}`,
                  url: accessUrl
                });
              } catch (error) {
                console.error('Share failed:', error);
                copyLink();
              }
            }}>
              📤 Share
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModalWorking;
