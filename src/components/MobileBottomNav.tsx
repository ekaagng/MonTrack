import React from 'react';
import { motion } from 'motion/react';
import type { PageId, Language } from '../types/finance.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface MobileBottomNavProps {
  currentPage: PageId;
  lang: Language;
  onNavigate: (page: PageId) => void;
  onAddTransaction: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  lang,
  onNavigate,
  onAddTransaction,
}) => {
  const t = (k: string) => getTranslation(k, lang);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[55] md:hidden h-[64px] bg-white/90 dark:bg-[#151916]/90 backdrop-blur-xl border-t border-[#e7ebe4]/80 dark:border-[#2a322c]/80 shadow-[0_-8px_30px_-4px_rgba(0,0,0,0.18)] flex items-center justify-around px-3 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigasi bawah"
    >
      {/* 1. Beranda / Ringkasan */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('dashboard')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-semibold tracking-tight transition-colors ${
          currentPage === 'dashboard'
            ? 'text-[#045136] dark:text-[#52ba88] font-bold'
            : 'text-[#606c64] dark:text-[#88938a] hover:text-[#1a1c19] dark:hover:text-[#eef1ec]'
        }`}
      >
        <AppIcon name="grid" size={20} />
        <span>{t('navDashboard')}</span>
      </motion.button>

      {/* 2. Transaksi */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('transactions')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-semibold tracking-tight transition-colors ${
          currentPage === 'transactions'
            ? 'text-[#045136] dark:text-[#52ba88] font-bold'
            : 'text-[#606c64] dark:text-[#88938a] hover:text-[#1a1c19] dark:hover:text-[#eef1ec]'
        }`}
      >
        <AppIcon name="list" size={20} />
        <span>{t('navTransactions')}</span>
      </motion.button>

      {/* 3. Centered Speed Log + Button in Deep Forest Emerald with Soft Olive Lime Accent Ring */}
      <div className="flex-1 flex justify-center -mt-6">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88, rotate: 90 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={onAddTransaction}
          aria-label={t('addTransaction')}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#27694c] hover:bg-[#174d36] text-white shadow-[0_6px_20px_rgba(39,105,76,0.35)] border-[3px] border-[#f9faf5] dark:border-[#151916] ring-2 ring-[#cbe7a1] dark:ring-[#52ba88]"
        >
          <AppIcon name="plus" size={22} />
        </motion.button>
      </div>

      {/* 4. Anggaran */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('budgets')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-semibold tracking-tight transition-colors ${
          currentPage === 'budgets'
            ? 'text-[#045136] dark:text-[#52ba88] font-bold'
            : 'text-[#606c64] dark:text-[#88938a] hover:text-[#1a1c19] dark:hover:text-[#eef1ec]'
        }`}
      >
        <AppIcon name="wallet" size={20} />
        <span>{t('navBudgets')}</span>
      </motion.button>

      {/* 5. Tujuan */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('goals')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-semibold tracking-tight transition-colors ${
          currentPage === 'goals'
            ? 'text-[#045136] dark:text-[#52ba88] font-bold'
            : 'text-[#606c64] dark:text-[#88938a] hover:text-[#1a1c19] dark:hover:text-[#eef1ec]'
        }`}
      >
        <AppIcon name="target" size={20} />
        <span>{t('navGoals')}</span>
      </motion.button>
    </nav>
  );
};
