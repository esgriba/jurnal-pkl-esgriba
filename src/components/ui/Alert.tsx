"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { setGlobalAlertContext } from '@/lib/customAlert';

export interface AlertOptions {
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => Promise<boolean>;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertOptions | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [resolveAlert, setResolveAlert] = useState<((value: boolean) => void) | null>(null);

  const showAlert = useCallback((options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlert(options);
      setResolveAlert(() => resolve);
    });
  }, []);

  const handleAlertClose = useCallback((confirmed: boolean) => {
    if (confirmed && alert?.onConfirm) {
      alert.onConfirm();
    } else if (!confirmed && alert?.onCancel) {
      alert.onCancel();
    }
    
    setAlert(null);
    if (resolveAlert) {
      resolveAlert(confirmed);
      setResolveAlert(null);
    }
  }, [alert, resolveAlert]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastItem = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  // Initialize global alert context
  const contextValue = { showAlert, showToast };
  
  useEffect(() => {
    setGlobalAlertContext(contextValue);
  }, [showAlert, showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500 dark:text-blue-400" />;
      default:
        return <Info className="w-6 h-6 text-blue-500 dark:text-blue-400" />;
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 dark:border-green-600 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 dark:border-red-600 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getModalBackground = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-white dark:bg-green-900';
      case 'error':
        return 'bg-white dark:bg-red-900';
      case 'warning':
        return 'bg-white dark:bg-yellow-900';
      case 'info':
        return 'bg-white dark:bg-blue-900';
      default:
        return 'bg-white dark:bg-blue-900';
    }
  };

  const getModalTextColors = (type: string) => {
    // Untuk semua warna di dark mode, kita gunakan text-white agar kontras tinggi
    return {
      title: 'text-gray-900 dark:text-white',
      message: 'text-gray-600 dark:text-gray-100'
    };
  };

  const getModalButtonColors = (type: string) => {
    return {
      cancel: 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
      confirm: {
        success: 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:ring-green-500',
        error: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:ring-red-500',
        warning: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 focus:ring-yellow-500',
        info: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-blue-500'
      }
    };
  };

  const getToastColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 dark:bg-green-600 text-white';
      case 'error':
        return 'bg-red-500 dark:bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 dark:bg-yellow-600 text-white';
      case 'info':
        return 'bg-blue-500 dark:bg-blue-600 text-white';
      default:
        return 'bg-blue-500 dark:bg-blue-600 text-white';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showToast }}>
      {children}
      
      {/* Alert Modal */}
      {alert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70">
          <div 
            className={`
              w-full max-w-md mx-auto ${getModalBackground(alert.type)} rounded-lg shadow-xl border-2 
              ${getAlertColors(alert.type)}
              transform transition-all duration-300 ease-out
              animate-alert-show
            `}
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-semibold mb-2 ${getModalTextColors(alert.type).title}`}>
                    {alert.title}
                  </h3>
                  {alert.message && (
                    <p className={`text-sm leading-relaxed ${getModalTextColors(alert.type).message}`}>
                      {alert.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                {alert.showCancelButton && (
                  <button
                    onClick={() => handleAlertClose(false)}
                    className={`px-4 py-2 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors ${getModalButtonColors(alert.type).cancel}`}
                  >
                    {alert.cancelText || 'Batal'}
                  </button>
                )}
                <button
                  onClick={() => handleAlertClose(true)}
                  className={`
                    px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors
                    ${alert.type === 'error' ? getModalButtonColors(alert.type).confirm.error :
                      alert.type === 'warning' ? getModalButtonColors(alert.type).confirm.warning :
                      alert.type === 'success' ? getModalButtonColors(alert.type).confirm.success :
                      getModalButtonColors(alert.type).confirm.info
                    }
                  `}
                >
                  {alert.confirmText || 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications - Desktop */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full hidden sm:block">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              ${getToastColors(toast.type)}
              px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-out
              animate-toast-slide-in
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  {getAlertIcon(toast.type)}
                </div>
                <p className="text-sm font-medium">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 flex-shrink-0 text-white hover:text-gray-200 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Notifications - Mobile */}
      <div className="fixed top-4 left-4 right-4 z-50 space-y-2 sm:hidden">
        {toasts.map((toast) => (
          <div
            key={`mobile-${toast.id}`}
            className={`
              ${getToastColors(toast.type)}
              px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-out
              animate-toast-slide-down
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  {getAlertIcon(toast.type)}
                </div>
                <p className="text-sm font-medium">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 flex-shrink-0 text-white hover:text-gray-200 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

// Convenience hooks
export const useSuccess = () => {
  const { showAlert, showToast } = useAlert();
  
  return {
    alert: (title: string, message?: string) => showAlert({
      title,
      message,
      type: 'success',
      showConfirmButton: true
    }),
    toast: (message: string, duration?: number) => showToast(message, 'success', duration)
  };
};

export const useError = () => {
  const { showAlert, showToast } = useAlert();
  
  return {
    alert: (title: string, message?: string) => showAlert({
      title,
      message,
      type: 'error',
      showConfirmButton: true
    }),
    toast: (message: string, duration?: number) => showToast(message, 'error', duration)
  };
};

export const useWarning = () => {
  const { showAlert, showToast } = useAlert();
  
  return {
    alert: (title: string, message?: string) => showAlert({
      title,
      message,
      type: 'warning',
      showConfirmButton: true
    }),
    toast: (message: string, duration?: number) => showToast(message, 'warning', duration)
  };
};

export const useConfirm = () => {
  const { showAlert } = useAlert();
  
  return (
    title: string, 
    message?: string,
    confirmText?: string,
    cancelText?: string
  ) => showAlert({
    title,
    message,
    type: 'warning',
    showConfirmButton: true,
    showCancelButton: true,
    confirmText,
    cancelText
  });
};
