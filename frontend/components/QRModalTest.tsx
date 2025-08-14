import React from 'react';
import { Permission } from '../App';

interface QRModalProps {
  permission: Permission;
  onClose: () => void;
}

const QRModalTest: React.FC<QRModalProps> = ({ permission, onClose }) => {
  const accessUrl = `${window.location.origin}?permission=${permission.id}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔲 QR Test Modal</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div style={{ 
            background: '#f0f0f0', 
            padding: '2rem', 
            borderRadius: '12px',
            textAlign: 'center',
            margin: '1rem 0'
          }}>
            <h4>✅ Modal Working!</h4>
            <p>Permission ID: {permission.id}</p>
            <p>Access URL: {accessUrl}</p>
            <div style={{ 
              background: 'white',
              padding: '2rem',
              margin: '1rem 0',
              border: '2px dashed #ccc',
              borderRadius: '8px'
            }}>
              QR CODE WOULD APPEAR HERE
              <br />
              <small>(Testing if modal displays correctly first)</small>
            </div>
          </div>
          
          <div className="permission-details">
            <h4>🔐 Permission Details</h4>
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
              <p><strong>Recipient:</strong> {permission.recipient}</p>
              <p><strong>Amount:</strong> {permission.amount} APT</p>
              <p><strong>Status:</strong> {permission.status}</p>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              navigator.clipboard.writeText(accessUrl);
              alert('Link copied to clipboard!');
            }}
          >
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

export default QRModalTest;
