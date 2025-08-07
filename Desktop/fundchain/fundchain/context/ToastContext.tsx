import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleIcon, ExclamationCircleIcon, XIcon } from '../components/icons';

type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

const Toast: React.FC<{ toast: Toast; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === 'success';
  const Icon = isSuccess ? CheckCircleIcon : ExclamationCircleIcon;
  const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-slate-800 shadow-2xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden w-full max-w-sm animate-fade-in-right">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-slate-100">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button onClick={() => onRemove(toast.id)} className="rounded-md inline-flex text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
              <span className="sr-only">Close</span>
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: number) => void }> = ({ toasts, onRemove }) => {
  return createPortal(
    <div className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>,
    document.body
  );
};


export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    setToasts((currentToasts) => [...currentToasts, { id: toastId++, message, type }]);
  }, []);
  
  const removeToast = useCallback((id: number) => {
    setToasts((currentToasts) => currentToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
