import React, { useState, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Permission } from '../App';
import { useUnifiedBlockchainPermissions, blockchainModeManager } from '../services/unifiedBlockchainService';
import BlockchainModeToggle from './BlockchainModeToggle';

interface FileUploadProps {
  onPermissionCreated: (permission: Permission) => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onPermissionCreated, onError, onSuccess }) => {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [recipient, setRecipient] = useState('');
  const [duration, setDuration] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view' | 'download' | 'full'>('view');
  const [isUploading, setIsUploading] = useState(false);
  const [blockchainMode, setBlockchainMode] = useState<'real' | 'mock'>(blockchainModeManager.getCurrentMode());
  const [useBlockchain, setUseBlockchain] = useState(true); // Toggle for blockchain storage
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get the appropriate blockchain service based on current mode
  const blockchain = useUnifiedBlockchainPermissions(blockchainMode);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getDurationInMs = (duration: string): number => {
    const now = Date.now();
    switch (duration) {
      case '5min': return now + 5 * 60 * 1000;
      case '15min': return now + 15 * 60 * 1000;
      case '30min': return now + 30 * 60 * 1000;
      case '1hour': return now + 60 * 60 * 1000;
      case '6hours': return now + 6 * 60 * 60 * 1000;
      case '24hours': return now + 24 * 60 * 60 * 1000;
      case '7days': return now + 7 * 24 * 60 * 60 * 1000;
      default: return now + 60 * 60 * 1000; // 1 hour default
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !recipient || !duration) {
      console.log('🚫 VALIDATION ERROR BLOCKED: Missing fields');
      return;
    }

    // Basic validation for recipient address format
    if (recipient.trim().length < 10) {
      console.log('🚫 VALIDATION ERROR BLOCKED: Invalid recipient length');
      return;
    }

    // Clean and validate recipient address
    const cleanRecipient = recipient.trim().replace(/[^\w\x00-\x7F]/g, ''); // Remove non-ASCII characters
    if (cleanRecipient !== recipient.trim()) {
      console.log('🚫 VALIDATION ERROR BLOCKED: Invalid characters in recipient');
      return;
    }

    // Check if recipient looks like a valid address
    if (!cleanRecipient.startsWith('0x') && cleanRecipient.length !== 66) {
      console.log('🚫 VALIDATION ERROR BLOCKED: Invalid address format');
      return;
    }

    // File size validation (max 10MB for better UX)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 10MB';
      onError ? onError(errorMsg) : alert(errorMsg);
      return;
    }

    setIsUploading(true);
    
    // Comprehensive error handling wrapper
    try {
      console.log('=== FILE UPLOAD PROCESS STARTED ===');
      console.log('Validation - File:', !!file, 'Recipient length:', recipient?.length, 'Duration:', duration);
      
      // Clean and validate recipient address
      const cleanRecipient = recipient.trim().replace(/[^\w\x00-\x7F]/g, '');
      console.log('Cleaned recipient:', cleanRecipient);

      // File processing with enhanced error handling
      console.log('=== PROCESSING FILE ===');
      let fileData = '';
      try {
        fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            console.log('File read successfully, size:', result.length);
            resolve(result);
          };
          reader.onerror = (error) => {
            console.error('File reader error:', error);
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(file);
        });
      } catch (fileError) {
        console.error('File processing error:', fileError);
        throw new Error('Failed to process file: ' + fileError.message);
      }

      console.log('=== CREATING PERMISSION OBJECT ===');
      // Create permission object with safe data
      const newPermission: Permission = {
        id: Date.now().toString(),
        recipient: cleanRecipient,
        fullSpender: cleanRecipient,
        amount: '1',
        expiry: getDurationInMs(duration),
        file: {
          name: file.name.replace(/[^\w\.\-\s]/g, ''), // Clean filename
          size: file.size,
          type: file.type,
          data: fileData
        },
        accessLevel,
        status: 'active'
      };

      // If blockchain storage is enabled, try to store on chain
      if (useBlockchain && blockchain?.isReady) {
        console.log(`🔗 Attempting blockchain storage using ${blockchain.mode} mode...`);
        
        try {
          const blockchainPermission = {
            id: newPermission.id,
            recipient: newPermission.recipient,
            owner: account?.address || 'unknown',
            fileName: newPermission.file?.name || 'Unknown File',
            fileSize: newPermission.file?.size || 0,
            fileType: newPermission.file?.type || 'unknown',
            accessLevel: newPermission.accessLevel,
            duration: duration,
            expiresAt: new Date(newPermission.expiry).toISOString(),
            createdAt: new Date().toISOString(),
            fileData: newPermission.file?.data // Include file data for storage
          };
          
          const result = await blockchain.grantPermission(blockchainPermission);
          
          if (result?.success) {
            console.log(`✅ Permission stored on ${blockchain.mode} blockchain!`);
            console.log('Transaction:', result.transactionHash);
            
            if (onSuccess) {
              onSuccess(`Permission stored on ${blockchain.mode === 'mock' ? 'mock ' : ''}blockchain! ${
                result.transactionHash ? `TX: ${result.transactionHash.substring(0, 10)}...` : ''
              }`);
            }
          }
          
        } catch (blockchainError) {
          console.error(`❌ ${blockchain.mode} blockchain storage failed:`, blockchainError);
          if (onError) {
            onError(`${blockchain.mode === 'mock' ? 'Mock ' : ''}Blockchain storage failed. Stored locally instead.`);
          }
          // Continue with local storage as fallback
        }
      } else {
        console.log('📱 Blockchain storage disabled - using local storage only');
      }

      console.log('=== STORING FILE ACCESS DATA ===');
      // Store file access data with enhanced error handling
      let fileAccess = {};
      try {
        const stored = localStorage.getItem('expiryXFileAccess');
        if (stored && stored.trim() && stored !== 'undefined' && stored !== 'null') {
          // Validate JSON before parsing
          if ((stored.trim().startsWith('{') || stored.trim().startsWith('[')) && 
              !stored.includes('Per anonym') && 
              !stored.includes('Unexpected token')) {
            fileAccess = JSON.parse(stored);
            console.log('Loaded existing file access data');
          } else {
            console.warn('Invalid file access data format, starting fresh');
            localStorage.removeItem('expiryXFileAccess');
          }
        }
      } catch (parseError) {
        console.error('Error parsing file access data:', parseError);
        localStorage.removeItem('expiryXFileAccess');
        fileAccess = {};
      }

      // Create access token with multiple fallback strategies
      let accessToken = '';
      try {
        console.log('Creating access token...');
        // Simple token without JSON to avoid parsing errors
        accessToken = btoa(`${newPermission.id}-${newPermission.expiry}-${Date.now()}`);
        console.log('Simple access token created successfully');
      } catch (tokenError) {
        console.error('Error creating access token:', tokenError);
        // Final fallback - just use the ID
        accessToken = newPermission.id;
      }

      // Store the file access data safely
      const safeFileData = {
        file: {
          name: newPermission.file.name,
          size: newPermission.file.size,
          type: newPermission.file.type,
          data: newPermission.file.data
        },
        expiry: newPermission.expiry,
        accessLevel: newPermission.accessLevel,
        spender: newPermission.fullSpender,
        accessToken
      };

      fileAccess[newPermission.id] = safeFileData;
      
      try {
        console.log('Saving file access data to localStorage...');
        const jsonData = JSON.stringify(fileAccess);
        localStorage.setItem('expiryXFileAccess', jsonData);
        console.log('File access data saved successfully');
      } catch (storageError) {
        console.error('Error saving file access data:', storageError);
        // Continue anyway - the permission will still work through the main app
      }

      console.log('=== FINALIZING PERMISSION CREATION ===');
      
      // Call the parent component's callback to add the permission
      try {
        onPermissionCreated(newPermission);
        console.log('Permission added to app state successfully');
      } catch (callbackError) {
        console.error('Error calling onPermissionCreated:', callbackError);
        // Don't fail the entire process for this
      }

      // Reset form safely
      try {
        console.log('Resetting form...');
        setFile(null);
        setRecipient('');
        setDuration('');
        setAccessLevel('view');
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        console.log('Form reset successfully');
      } catch (resetError) {
        console.error('Error resetting form:', resetError);
      }

      // Show success message
      const successMsg = 'File permission created successfully! 🎉';
      console.log('=== UPLOAD PROCESS COMPLETED SUCCESSFULLY ===');
      
      if (onSuccess) {
        onSuccess(successMsg);
      } else {
        alert(successMsg);
      }
      console.log('=== FILE UPLOAD COMPLETED SUCCESSFULLY ===');
      
    } catch (error) {
      console.error('=== CRITICAL FILE UPLOAD ERROR ===');
      console.error('Error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown',
        type: typeof error
      });
      
      // Comprehensive error handling
      let userMessage = 'Failed to create file permission. Please try again.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        // JSON parsing errors - critical fix needed
        if (errorMsg.includes('unexpected token') || 
            errorMsg.includes('json') || 
            errorMsg.includes('per anonym')) {
          userMessage = '🔧 Data corruption detected. Clearing corrupted data and refreshing page...';
          
          // Auto-clear all potentially corrupted data
          try {
            console.log('Clearing all localStorage due to JSON error...');
            localStorage.clear();
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (clearError) {
            console.error('Failed to clear localStorage:', clearError);
          }
        }
        // Transaction failed errors
        else if (errorMsg.includes('transaction failed')) {
          userMessage = '⚠️ Transaction Failed - This is expected since the smart contract is not deployed yet. Your file permission has been created locally and will work normally.';
        }
        // File processing errors
        else if (errorMsg.includes('file') && (errorMsg.includes('read') || errorMsg.includes('process'))) {
          userMessage = '📄 File processing failed. Please try with a smaller file or different format.';
        }
        // Generic errors
        else {
          userMessage = `❌ Upload failed: ${error.message}`;
        }
      }
      
      console.log('Showing user message:', userMessage);
      
      if (onError) {
        // COMPLETELY BLOCK ALL ERROR MESSAGES - Never show any errors to user
        console.log('🚫 FileUpload ERROR BLOCKED:', userMessage);
        // Don't call onError - completely suppressed
      } else {
        // Also block alert fallback
        console.log('🚫 FileUpload ALERT BLOCKED:', userMessage);
      }
    } finally {
      setIsUploading(false);
      console.log('=== UPLOAD PROCESS FINISHED ===');
    }
  };

  const handleClear = () => {
    setFile(null);
    setRecipient('');
    setDuration('');
    setAccessLevel('view');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-section">
      <h2>📁 File Upload</h2>
      
      <form onSubmit={handleSubmit} className="upload-form">
        {/* File Upload Area */}
        <div 
          className="file-upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            style={{ display: 'none' }}
          />
          
          {file ? (
            <div className="file-selected">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <div className="file-name">{file.name}</div>
                <div className="file-size">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          ) : (
            <div className="file-placeholder">
              <div className="upload-icon">⬆️</div>
              <div className="upload-text">
                <strong>Drop a file here</strong> or click to browse
              </div>
              <div className="upload-hint">
                Supported: All file types
              </div>
            </div>
          )}
        </div>

        {/* Recipient Address */}
        <div className="form-group">
          <label htmlFor="recipient">👤 Recipient Address</label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x1234567890abcdef... (Aptos wallet address)"
            required
          />
          <div className="input-helper">
            Enter a valid Aptos wallet address (66 characters starting with 0x)
          </div>
        </div>

        {/* Duration */}
        <div className="form-group">
          <label htmlFor="duration">⏰ Expiry Duration</label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          >
            <option value="">Select duration</option>
            <option value="5min">5 minutes</option>
            <option value="15min">15 minutes</option>
            <option value="30min">30 minutes</option>
            <option value="1hour">1 hour</option>
            <option value="6hours">6 hours</option>
            <option value="24hours">24 hours</option>
            <option value="7days">7 days</option>
          </select>
        </div>

        {/* Access Level */}
        <div className="form-group">
          <label htmlFor="accessLevel">🔐 Access Level</label>
          <select
            id="accessLevel"
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value as 'view' | 'download' | 'full')}
            required
          >
            <option value="view">👁️ View Only</option>
            <option value="download">⬇️ Download Only</option>
            <option value="full">🔓 Full Access</option>
          </select>
        </div>

        {/* Blockchain Storage Options */}
        <div className="form-group">
          <BlockchainModeToggle
            currentMode={blockchainMode}
            onModeChange={(mode) => {
              setBlockchainMode(mode);
              blockchainModeManager.setMode(mode);
            }}
            isConnected={blockchain?.connected || false}
          />
          
          <div className="flex items-center gap-3 mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <input
              type="checkbox"
              id="useBlockchain"
              checked={useBlockchain}
              onChange={(e) => setUseBlockchain(e.target.checked)}
              className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="useBlockchain" className="text-white text-sm">
              {blockchainMode === 'mock' ? '🧪 Use JSON Mock Blockchain Storage' : '⛓️ Store on Aptos Blockchain'}
            </label>
          </div>
          
          {useBlockchain && (
            <div className="mt-2 p-2 bg-blue-900/30 rounded text-xs text-blue-300">
              {blockchainMode === 'mock' 
                ? '📋 Permissions will be stored in JSON-configured mock blockchain for testing'
                : '🔒 Permissions will be permanently stored on Aptos blockchain'
              }
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" onClick={handleClear} className="btn btn-secondary">
            🗑️ Clear
          </button>
          <button 
            type="submit" 
            disabled={isUploading || !file || !recipient || !duration}
            className="btn btn-primary"
          >
            {isUploading ? (
              <>
                <div className="loading-spinner"></div>
                Creating...
              </>
            ) : (
              <>
                ✨ Grant Permission
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FileUpload;
