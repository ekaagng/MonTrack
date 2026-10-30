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
      <p className="text-[13px] sm:text-[14px] font-sans text-[#5C665F] dark:text-[#B7C1B8] leading-relaxed text-left">
        {description}
      </p>

      {itemLabel && (
        <div className="p-3.5 bg-[#EBF0E8] dark:bg-[#222A25] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[13px] sm:text-[14px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] text-left">
          {itemLabel}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E6DF] dark:border-[#28312B]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onCancel}
          className="h-11 px-5 rounded-[12px] bg-[#EBF0E8] dark:bg-[#222A25] hover:bg-[#E2E6DF] dark:hover:bg-[#28312B] text-[14px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] transition-all cursor-pointer"
        >
          Batal
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onConfirm}
          className={`inline-flex items-center gap-2 h-11 px-5 rounded-[12px] text-[14px] font-sans font-semibold transition-all cursor-pointer ${
            isDestructive
              ? 'bg-[#B94E48] hover:bg-[#9E3E39] text-white shadow-sm'
              : 'bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] shadow-sm'
          }`}
        >
          {isDestructive && <AppIcon name="trash" size={16} />}
          <span>{confirmLabel}</span>
        </motion.button>
      </div>
    </div>
  );
};
