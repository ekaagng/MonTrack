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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(23,34,27,0.48)] backdrop-blur-md"
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
            initial={{ opacity: 0, scale: 0.94, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, y: 10, filter: 'blur(6px)' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[520px] max-h-[min(90dvh,820px)] overflow-y-auto bg-white dark:bg-[#181c19] border border-white/70 dark:border-[#2a342c] rounded-[23px] shadow-[0_25px_80px_rgba(25,40,29,0.22)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.7)]"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-5 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-3 bg-white/95 dark:bg-[#181c19]/95 backdrop-blur-md border-b border-[#eff1ec] dark:border-[#273029]">
              <div>
                <h2 id="modal-dialog-title" className="text-[18px] sm:text-[20px] font-heading font-bold tracking-[-0.01em] text-[#141a16] dark:text-[#f2f5f1] text-left">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-1 text-[12px] sm:text-[13px] font-sans font-normal text-[#445047] dark:text-[#b2bdb5] leading-relaxed text-left">
                    {subtitle}
                  </p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={onClose}
                aria-label="Tutup dialog"
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#f2f4ef] dark:bg-[#232a25] text-[#556157] dark:text-[#c1ccc3] hover:bg-[#e6ebe2] dark:hover:bg-[#2c362f] transition-colors"
              >
                <AppIcon name="close" size={16} />
              </motion.button>
            </div>
            <div className="p-6">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
