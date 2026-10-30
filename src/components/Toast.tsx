import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppIcon } from './icons.tsx';

export interface ToastMessage {
  id: string;
  title: string;
  detail?: string;
  kind?: 'success' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastRegion: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed top-5 right-5 z-[80] grid gap-2.5 w-[min(350px,calc(100vw-32px))] pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3300);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isError = toast.kind === 'error';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.92, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-[15px] shadow-[0_16px_36px_rgba(20,40,24,0.24)] text-white text-xs backdrop-blur-md ${
        isError ? 'bg-[#8e3f35]/95' : 'bg-[#21382a]/95'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        <AppIcon name={isError ? 'info' : 'check'} size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <strong className="block text-xs font-bold leading-tight">{toast.title}</strong>
        {toast.detail && <span className="block mt-0.5 text-[11px] text-white/80">{toast.detail}</span>}
      </div>
    </motion.div>
  );
};
