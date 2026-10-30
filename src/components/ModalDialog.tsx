import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppIcon } from './icons.tsx';

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus first actionable control
    const timer = setTimeout(() => {
      if (panelRef.current) {
        const focusable = panelRef.current.querySelector<HTMLElement>(
          'input:not([type=hidden]), select, textarea, button:not([aria-label="Tutup dialog"]):not([aria-label="Close dialog"])'
        );
        focusable?.focus();
      }
    }, 60);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131313]/60 backdrop-blur-sm"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.section
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-dialog-title"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[520px] max-h-[min(90dvh,820px)] overflow-y-auto bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[20px] shadow-[0_20px_60px_rgba(23,27,24,0.16)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-5 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-3 bg-white/95 dark:bg-[#1B211D]/95 backdrop-blur-md border-b border-[#E2E6DF] dark:border-[#28312B]">
              <div>
                <h2 id="modal-dialog-title" className="text-[18px] sm:text-[20px] font-heading font-bold tracking-tight text-[#171B18] dark:text-[#F0F0F0] text-left">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-1 text-[12px] sm:text-[13px] font-sans font-normal text-[#5C665F] dark:text-[#B7C1B8] leading-[1.35] text-left">
                    {subtitle}
                  </p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.15 }}
                onClick={onClose}
                aria-label="Tutup dialog"
                className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[#EBF0E8] dark:bg-[#222A25] text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#E2E6DF] dark:hover:bg-[#28312B] transition-colors cursor-pointer shrink-0"
              >
                <AppIcon name="close" size={16} />
              </motion.button>
            </div>
            <div className="p-4 sm:p-5 md:p-6">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
