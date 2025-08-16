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
}

// Success alert
export const showSuccess = (title: string, text?: string, timer = 3000) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    timerProgressBar: true,
    background: '#f0f9ff',
    color: '#166534',
    iconColor: '#22c55e',
  });
};

// Error alert
export const showError = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#dc2626',
    background: '#fef2f2',
    color: '#991b1b',
  });
};

// Warning alert
export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ea580c',
    background: '#fffbeb',
    color: '#92400e',
  });
};

// Info alert
export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#2563eb',
    background: '#eff6ff',
    color: '#1d4ed8',
  });
};

// Confirmation dialog
export const showConfirmation = async (
  title: string,
  text?: string,
  confirmButtonText = 'Ya, Lanjutkan',
  cancelButtonText = 'Batal'
): Promise<boolean> => {
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
  });

  return result.isConfirmed;
};

// Loading alert
export const showLoading = (title = 'Memproses...', text?: string) => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};

// Custom alert
export const showCustomAlert = (options: SweetAlertOptions) => {
  return Swal.fire(options);
};

// Toast notification
export const showToast = (
  message: string,
  icon: 'success' | 'error' | 'warning' | 'info' = 'info',
  timer = 3000
) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon,
    title: message,
  });
};
