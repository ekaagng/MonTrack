import React from 'react';
import { motion } from 'motion/react';
import { AppIcon } from './icons.tsx';

interface ConfirmModalProps {
  title: string;
  description: string;
  itemLabel?: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  description,
  itemLabel,
  confirmLabel,
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[#526055] dark:text-[#b0bca2] leading-relaxed">
        {description}
      </p>

      {itemLabel && (
        <div className="p-3 bg-[#f8faf6] dark:bg-[#1a201c] border border-[#e8ece5] dark:border-[#2a342c] rounded-xl text-xs font-bold text-[#141a16] dark:text-[#f0f4f0]">
          {itemLabel}
        </div>
      )}

      <div className="flex justify-end gap-2.5 pt-4 border-t border-[#edf0eb] dark:border-[#2a342c]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-[#dfe5dc] dark:border-[#2a342c] bg-white dark:bg-[#181c19] hover:bg-[#f8faf6] dark:hover:bg-[#232924] text-xs font-bold text-[#435047] dark:text-[#c4cec6] transition-all"
        >
          Batal
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onConfirm}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            isDestructive
              ? 'bg-[#b84b40] hover:bg-[#963c32] text-white shadow-[0_5px_14px_rgba(184,75,64,0.22)]'
              : 'bg-[#27694c] hover:bg-[#174d36] text-white shadow-[0_5px_14px_rgba(39,105,76,0.22)]'
          }`}
        >
          {isDestructive && <AppIcon name="trash" size={14} />}
          {confirmLabel}
        </motion.button>
      </div>
    </div>
  );
};
