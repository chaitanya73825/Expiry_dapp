import React from 'react';
import { Permission } from '../App';
import QRCodeReact from 'react-qr-code';

interface QRModalProps {
  permission: Permission;
  onClose: () => void;
}

const QRModalSimple: React.FC<QRModalProps> = ({ permission, onClose }) => {
  // Create simple access URL
  const accessUrl = `${window.location.origin}?permission=${permission.id}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔲 QR Code Access</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="qr-section">
            <div className="qr-container">
              <div style={{ 
                background: 'white', 
                padding: '16px', 
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                display: 'inline-block',
                margin: '0 auto'
              }}>
                <QRCodeReact
                  value={accessUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              </div>
              <div className="qr-info" style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p><strong>Scan to access permission</strong></p>
                <p>ID: {permission.id}</p>
              </div>
            </div>
          </div>
          
          <div className="permission-details" style={{ marginTop: '2rem' }}>
            <h4>🔐 Permission Details</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Recipient:</span>
                <span className="value">
                  {permission.recipient.slice(0, 10)}...{permission.recipient.slice(-8)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Amount:</span>
                <span className="value">{permission.amount} APT</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`status ${permission.status}`}>
                  {permission.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => {
            navigator.clipboard.writeText(accessUrl);
            alert('Link copied to clipboard!');
          }}>
            📋 Copy Link
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModalSimple;
