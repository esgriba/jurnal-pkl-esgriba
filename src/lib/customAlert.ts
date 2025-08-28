"use client";

import { useAlert } from '@/components/ui/Alert';

// Global context holder
let globalAlertContext: any = null;

// Set global context
export const setGlobalAlertContext = (context: any) => {
  globalAlertContext = context;
};

// Helper function to get context
const getAlertContext = () => {
  if (!globalAlertContext) {
    console.warn('Alert system not initialized. Make sure AlertProvider is set up.');
    return null;
  }
  return globalAlertContext;
};

// Direct export functions for backward compatibility
export const showSuccess = (title: string, text?: string, timer: number = 3000) => {
  const context = getAlertContext();
  if (!context) return Promise.resolve();
  
  if (timer && timer > 0) {
    context.showToast(title, 'success', timer);
    return Promise.resolve();
  } else {
    return context.showAlert({
      title,
      message: text,
      type: 'success',
      showConfirmButton: true
    });
  }
};

export const showError = (title: string, text?: string) => {
  const context = getAlertContext();
  if (!context) return Promise.resolve();
  
  return context.showAlert({
    title,
    message: text,
    type: 'error',
    showConfirmButton: true
  });
};

export const showWarning = (title: string, text?: string) => {
  const context = getAlertContext();
  if (!context) return Promise.resolve();
  
  return context.showAlert({
    title,
    message: text,
    type: 'warning',
    showConfirmButton: true
  });
};

export const showInfo = (title: string, text?: string) => {
  const context = getAlertContext();
  if (!context) return Promise.resolve();
  
  return context.showAlert({
    title,
    message: text,
    type: 'info',
    showConfirmButton: true
  });
};

export const showConfirmation = async (
  title: string,
  text?: string,
  confirmButtonText: string = 'Ya, Lanjutkan',
  cancelButtonText: string = 'Batal'
): Promise<boolean> => {
  const context = getAlertContext();
  if (!context) return false;
  
  return await context.showAlert({
    title,
    message: text,
    type: 'warning',
    showConfirmButton: true,
    showCancelButton: true,
    confirmText: confirmButtonText,
    cancelText: cancelButtonText
  });
};

export const showToast = (
  message: string,
  icon: 'success' | 'error' | 'warning' | 'info' = 'info',
  timer: number = 3000
) => {
  const context = getAlertContext();
  if (!context) return;
  
  context.showToast(message, icon, timer);
};

// Loading functions (simplified since we don't need complex loading states)
export const showLoading = (title: string = 'Memproses...', text?: string) => {
  const context = getAlertContext();
  if (!context) return Promise.resolve();
  
  // For loading, we'll show a toast notification
  context.showToast(`${title}${text ? ` - ${text}` : ''}`, 'info', 0);
  return Promise.resolve();
};

export const closeLoading = () => {
  // Since we're using toasts, loading will auto-dismiss or can be manually closed
  console.log('Loading closed');
};

// Custom alert function
export interface SweetAlertOptions {
  title: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  showConfirmButton?: boolean;
  timer?: number;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
  width?: string | number;
  background?: string;
  color?: string;
  customClass?: {
    popup?: string;
    title?: string;
    htmlContainer?: string;
    confirmButton?: string;
    cancelButton?: string;
  };
  didOpen?: () => void;
}

export const showCustomAlert = (options: SweetAlertOptions) => {
  const context = getAlertContext();
  if (!context) return Promise.resolve();
  
  const type = options.icon === 'question' ? 'warning' : (options.icon || 'info');
  
  return context.showAlert({
    title: options.title,
    message: options.text,
    type,
    showConfirmButton: options.showConfirmButton !== false,
    showCancelButton: options.showCancelButton || false,
    confirmText: options.confirmButtonText,
    cancelText: options.cancelButtonText,
    duration: options.timer
  });
};

// Wrapper hooks for component-based usage
export const useSweetAlert = () => {
  const { showAlert, showToast } = useAlert();

  return {
    showSuccess: (title: string, text?: string, timer: number = 3000) => {
      if (timer && timer > 0) {
        showToast(title, 'success', timer);
      } else {
        return showAlert({
          title,
          message: text,
          type: 'success',
          showConfirmButton: true
        });
      }
    },

    showError: (title: string, text?: string) => {
      return showAlert({
        title,
        message: text,
        type: 'error',
        showConfirmButton: true
      });
    },

    showWarning: (title: string, text?: string) => {
      return showAlert({
        title,
        message: text,
        type: 'warning',
        showConfirmButton: true
      });
    },

    showInfo: (title: string, text?: string) => {
      return showAlert({
        title,
        message: text,
        type: 'info',
        showConfirmButton: true
      });
    },

    showConfirmation: async (
      title: string,
      text?: string,
      confirmButtonText: string = 'Ya, Lanjutkan',
      cancelButtonText: string = 'Batal'
    ): Promise<boolean> => {
      return await showAlert({
        title,
        message: text,
        type: 'warning',
        showConfirmButton: true,
        showCancelButton: true,
        confirmText: confirmButtonText,
        cancelText: cancelButtonText
      });
    },

    showToast: (
      message: string,
      icon: 'success' | 'error' | 'warning' | 'info' = 'info',
      timer: number = 3000
    ) => {
      showToast(message, icon, timer);
    }
  };
};
