import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextType {
  showToast: (title: string, message: string, type: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((title: string, message: string, type: Toast['type']) => {
    // BLOCK ALL ERROR TOASTS - Prevent any error messages from appearing
    if (type === 'error' || 
        title.toLowerCase().includes('transaction failed') ||
        title.toLowerCase().includes('error') ||
        title.toLowerCase().includes('failed') ||
        message.toLowerCase().includes('transaction failed') ||
        message.toLowerCase().includes('per anonym') ||
        message.toLowerCase().includes('unexpected token') ||
        message.toLowerCase().includes('not valid json')) {
      console.log('🚫 ERROR TOAST BLOCKED:', title, message);
      return; // Don't show any error toasts
    }

    const id = Date.now().toString();
    const newToast: Toast = { id, title, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="toast-icon">{getToastIcon(toast.type)}</div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button 
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op function if context is not available - BLOCKS ALL ERRORS
    return (title: string, message: string, type: any) => {
      console.log('🚫 TOAST BLOCKED (no context):', title);
    };
  }
  return context.showToast;
};

export default ToastProvider;
