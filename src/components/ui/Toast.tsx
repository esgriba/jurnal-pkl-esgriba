"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastIcon = ({ type }: { type: Toast["type"] }) => {
  const iconClass = "h-5 w-5";

  switch (type) {
    case "success":
      return <CheckCircle className={`${iconClass} text-green-600`} />;
    case "error":
      return <AlertCircle className={`${iconClass} text-red-600`} />;
    case "warning":
      return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
    case "info":
      return <Info className={`${iconClass} text-blue-600`} />;
    default:
      return <Info className={`${iconClass} text-gray-600`} />;
  }
};

const ToastItem = ({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) => {
  const getToastStyles = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-xl ring-1 ring-green-500 ring-opacity-25";
      case "error":
        return "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 shadow-xl ring-1 ring-red-500 ring-opacity-25";
      case "warning":
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 shadow-xl ring-1 ring-yellow-500 ring-opacity-25";
      case "info":
        return "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-xl ring-1 ring-blue-500 ring-opacity-25";
      default:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 shadow-xl ring-1 ring-gray-500 ring-opacity-25";
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`
        ${getToastStyles(toast.type)}
        w-full max-w-lg sm:max-w-md rounded-2xl pointer-events-auto overflow-hidden
        transform transition-all duration-500 ease-out
        hover:scale-[1.02] hover:shadow-2xl
        animate-slideInDown
        backdrop-blur-sm
        min-h-[80px] mx-auto
      `}
    >
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <div className="p-1 rounded-full bg-white bg-opacity-80">
              <ToastIcon type={toast.type} />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-bold text-gray-800 leading-6 tracking-wide break-words">
              {toast.title}
            </p>
            {toast.message && (
              <p className="mt-2 text-sm text-gray-600 leading-relaxed break-words">
                {toast.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              onClick={() => onRemove(toast.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Progress bar */}
      <div className="h-1.5 bg-white bg-opacity-30 backdrop-blur-sm">
        <div
          className={`h-full transition-all ease-linear rounded-full ${
            toast.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : toast.type === "error"
              ? "bg-gradient-to-r from-red-500 to-rose-600"
              : toast.type === "warning"
              ? "bg-gradient-to-r from-yellow-500 to-amber-600"
              : "bg-gradient-to-r from-blue-500 to-indigo-600"
          }`}
          style={{
            animation: `shrink ${toast.duration || 5000}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "success", title, message });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "error", title, message });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "warning", title, message });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "info", title, message });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      {/* Toast Container - Centered Top */}
      <div
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center space-y-3 pointer-events-none px-4"
        style={{
          maxHeight: "calc(100vh - 3rem)",
          width: "fit-content",
          maxWidth: "calc(100vw - 2rem)",
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx global>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideOutUp {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-100%) scale(0.95);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }

        @keyframes bounce {
          0%,
          20%,
          53%,
          80%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          40%,
          43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }

        .animate-slideInDown {
          animation: slideInDown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)
            forwards;
        }

        .animate-slideOutUp {
          animation: slideOutUp 0.3s ease-in forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)
            forwards;
        }

        .animate-slideOutRight {
          animation: slideOutRight 0.3s ease-in forwards;
        }

        .animate-bounce-gentle {
          animation: bounce 0.6s ease-in-out;
        }

        /* Enhanced backdrop blur support */
        @supports (backdrop-filter: blur(10px)) {
          .backdrop-blur-toast {
            backdrop-filter: blur(10px);
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .toast-container {
            left: 1rem;
            right: 1rem;
            transform: none;
            width: auto;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
