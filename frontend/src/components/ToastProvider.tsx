import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import Toast from './Toast';
import type { ToastVariant } from './Toast';

const TOAST_DURATION_MS = 3000;

interface ToastState {
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'error') => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setToast({ message, variant });
      timeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    },
    [],
  );

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? <Toast message={toast.message} variant={toast.variant} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
