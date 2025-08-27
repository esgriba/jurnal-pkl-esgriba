import Swal from 'sweetalert2';

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

// Utility function to detect dark mode
const isDarkMode = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

// Utility function to get responsive positioning
const getResponsivePosition = (): any => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768 ? 'center' : 'top-end';
  }
  return 'top-end';
};

// Success alert
export const showSuccess = (title: string, text?: string, timer = 3000) => {
  const darkMode = isDarkMode();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer,
    showConfirmButton: false,
    toast: !isMobile,
    position: getResponsivePosition(),
    timerProgressBar: true,
    width: isMobile ? '90%' : undefined,
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#1f2937',
    iconColor: '#10b981',
    customClass: {
      popup: 'swal-responsive-popup',
      title: 'swal-responsive-title',
      htmlContainer: 'swal-responsive-text'
    },
    didOpen: () => {
      // Add custom styles for better mobile experience
      const popup = Swal.getPopup();
      if (popup && isMobile) {
        popup.style.fontSize = '14px';
        popup.style.borderRadius = '12px';
        popup.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }
    }
  });
};

// Error alert
export const showError = (title: string, text?: string) => {
  const darkMode = isDarkMode();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc2626',
    width: isMobile ? '90%' : undefined,
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#1f2937',
    iconColor: '#ef4444',
    customClass: {
      popup: 'swal-responsive-popup',
      title: 'swal-responsive-title',
      htmlContainer: 'swal-responsive-text',
      confirmButton: 'swal-responsive-button'
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup && isMobile) {
        popup.style.fontSize = '14px';
        popup.style.borderRadius = '12px';
        popup.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }
    }
  });
};

// Warning alert
export const showWarning = (title: string, text?: string) => {
  const darkMode = isDarkMode();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ea580c',
    width: isMobile ? '90%' : undefined,
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#1f2937',
    iconColor: '#f59e0b',
    customClass: {
      popup: 'swal-responsive-popup',
      title: 'swal-responsive-title',
      htmlContainer: 'swal-responsive-text',
      confirmButton: 'swal-responsive-button'
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup && isMobile) {
        popup.style.fontSize = '14px';
        popup.style.borderRadius = '12px';
        popup.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }
    }
  });
};

// Info alert
export const showInfo = (title: string, text?: string) => {
  const darkMode = isDarkMode();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
    width: isMobile ? '90%' : undefined,
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#1f2937',
    iconColor: '#3b82f6',
    customClass: {
      popup: 'swal-responsive-popup',
      title: 'swal-responsive-title',
      htmlContainer: 'swal-responsive-text',
      confirmButton: 'swal-responsive-button'
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup && isMobile) {
        popup.style.fontSize = '14px';
        popup.style.borderRadius = '12px';
        popup.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }
    }
  });
};

// Confirmation dialog
export const showConfirmation = async (
  title: string,
  text?: string,
  confirmButtonText = 'Ya, Lanjutkan',
  cancelButtonText = 'Batal'
): Promise<boolean> => {
  const darkMode = isDarkMode();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    focusCancel: true,
    width: isMobile ? '90%' : undefined,
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#1f2937',
    iconColor: '#3b82f6',
    customClass: {
      popup: 'swal-responsive-popup',
      title: 'swal-responsive-title',
      htmlContainer: 'swal-responsive-text',
      confirmButton: 'swal-responsive-button',
      cancelButton: 'swal-responsive-button'
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup && isMobile) {
        popup.style.fontSize = '14px';
        popup.style.borderRadius = '12px';
        popup.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }
    }
  });

  return result.isConfirmed;
};

// Loading alert
export const showLoading = (title = 'Memproses...', text?: string) => {
  const darkMode = isDarkMode();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    width: isMobile ? '90%' : undefined,
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#1f2937',
    customClass: {
      popup: 'swal-responsive-popup',
      title: 'swal-responsive-title',
      htmlContainer: 'swal-responsive-text'
    },
    didOpen: () => {
      Swal.showLoading();
      const popup = Swal.getPopup();
      if (popup && isMobile) {
        popup.style.fontSize = '14px';
        popup.style.borderRadius = '12px';
        popup.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }
    },
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};

// Custom alert
export const showCustomAlert = (options: SweetAlertOptions) => {
  const darkMode = isDarkMode();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  const customOptions = {
    ...options,
    width: isMobile ? '90%' : options.width || undefined,
    background: options.background || (darkMode ? '#1f2937' : '#ffffff'),
    color: options.color || (darkMode ? '#f9fafb' : '#1f2937'),
    customClass: {
      popup: 'swal-responsive-popup',
      title: 'swal-responsive-title',
      htmlContainer: 'swal-responsive-text',
      confirmButton: 'swal-responsive-button',
      cancelButton: 'swal-responsive-button',
      ...options.customClass
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup && isMobile) {
        popup.style.fontSize = '14px';
        popup.style.borderRadius = '12px';
        popup.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }
      if (options.didOpen) {
        options.didOpen();
      }
    }
  };
  
  return Swal.fire(customOptions);
};

// Toast notification
export const showToast = (
  message: string,
  icon: 'success' | 'error' | 'warning' | 'info' = 'info',
  timer = 3000
) => {
  const darkMode = isDarkMode();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  const Toast = Swal.mixin({
    toast: !isMobile,
    position: getResponsivePosition(),
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    width: isMobile ? '90%' : undefined,
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#1f2937',
    customClass: {
      popup: 'swal-responsive-popup',
      title: 'swal-responsive-title'
    },
    didOpen: (toast) => {
      if (isMobile) {
        toast.style.fontSize = '14px';
        toast.style.borderRadius = '12px';
        toast.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      }
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon,
    title: message,
  });
};
