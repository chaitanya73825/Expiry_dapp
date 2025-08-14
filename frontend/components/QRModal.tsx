import React, { useEffect, useState } from 'react';
import { Permission } from '../App';
import QRCodeReact from 'react-qr-code';

interface QRModalProps {
  permission: Permission;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ permission, onClose }) => {
  const [accessUrl, setAccessUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  useEffect(() => {
    generateAccessUrl();
  }, [permission]);

  const generateAccessUrl = async () => {
    try {
      console.log('Generating access URL for permission:', permission.id);
      setIsLoadingQR(true);
      setQrError('');
      
      // Create access token with error handling
      let accessToken = '';
      try {
        const tokenData = {
          id: permission.id,
          expiry: permission.expiry,
          spender: permission.fullSpender
        };
        accessToken = btoa(JSON.stringify(tokenData));
      } catch (tokenError) {
        console.error('Error creating access token:', tokenError);
        // Fallback token
        accessToken = btoa(`${permission.id}-${Date.now()}`);
      }

      const url = `${window.location.origin}${window.location.pathname}?token=${accessToken}`;
      setAccessUrl(url);
      console.log('Generated URL:', url);
      
      setQrError('');
    } catch (error) {
      console.error('URL generation failed:', error);
      setQrError(`Failed to generate access URL: ${error.message}`);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const downloadQR = () => {
    // Create a temporary canvas to generate the QR code for download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx || !accessUrl) return;
    
    canvas.width = 300;
    canvas.height = 300;
    
    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create a temporary QR code using a simpler approach
    const link = document.createElement('a');
    link.download = `ExpiryX-QR-${permission.file?.name || permission.id}.txt`;
    
    // For now, download the access URL as text
    const blob = new Blob([`ExpiryX Access Link:\n\n${accessUrl}\n\nScan the QR code on screen to access this link.`], 
      { type: 'text/plain' });
    link.href = URL.createObjectURL(blob);
    link.click();
    
    // Clean up
    URL.revokeObjectURL(link.href);
  };

  const shareQR = async () => {
    if (navigator.share && accessUrl) {
      try {
        await navigator.share({
          title: 'ExpiryX File Access',
          text: `Access file: ${permission.file?.name || 'File'}`,
          url: accessUrl
        });
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to copying the link
        await copyLink();
      }
    } else {
      // Fallback to copying the link
      await copyLink();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(accessUrl);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const getAccessLevelDescription = (level: string) => {
    switch (level) {
      case 'view':
        return 'Recipient can view the file in browser';
      case 'download':
        return 'Recipient can download the file';
      case 'full':
        return 'Recipient can view and download the file';
      default:
        return 'Access level not specified';
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
            {qrError ? (
              <div className="qr-error">
                <div className="error-icon">⚠️</div>
                <div className="error-message">{qrError}</div>
                <button onClick={generateAccessUrl} className="retry-btn">
                  🔄 Retry
                </button>
              </div>
            ) : isLoadingQR ? (
              <div className="qr-loading">
                <div className="loading-spinner"></div>
                <p>Generating QR Code...</p>
              </div>
            ) : (
              <div className="qr-container">
                <div style={{ 
                  background: 'white', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  display: 'inline-block'
                }}>
                  <QRCodeReact
                    value={accessUrl}
                    size={256}
                    bgColor="#ffffff"
                    fgColor="#1e293b"
                    level="M"
                  />
                </div>
                <div className="qr-info">
                  <p><strong>Scan to access file</strong></p>
                  <p>Valid for: {getTimeRemaining()}</p>
                </div>
              </div>
            )}
          </div>
          
          {permission.file && (
            <div className="file-details">
              <h4>📄 File Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Name:</span>
                  <span className="value">{permission.file.name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Size:</span>
                  <span className="value">{(permission.file.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="detail-item">
                  <span className="label">Access:</span>
                  <span className="value">{permission.accessLevel}</span>
                </div>
              </div>
              <div className="access-description">
                {getAccessLevelDescription(permission.accessLevel)}
              </div>
            </div>
          )}
          
          <div className="permission-details">
            <h4>🔐 Permission Details</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Recipient:</span>
                <span className="value">
                  {permission.recipient.slice(0, 10)}...{permission.recipient.slice(-8)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`status ${permission.status}`}>
                  {permission.status.toUpperCase()}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Expires:</span>
                <span className="value">
                  {new Date(permission.expiry).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="instructions">
            <h4>📱 How to Use</h4>
            <ol>
              <li>Share this QR code with the recipient</li>
              <li>They can scan it with any QR scanner</li>
              <li>The file will open based on access level</li>
              <li>Access expires automatically</li>
            </ol>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={copyLink}>
            📋 Copy Link
          </button>
          <button className="btn btn-success" onClick={downloadQR}>
            💾 Download QR
          </button>
          {navigator.share !== undefined && (
            <button className="btn btn-info" onClick={shareQR}>
              📤 Share QR
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

export default QRModal;
