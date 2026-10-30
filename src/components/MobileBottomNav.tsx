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
      className="fixed bottom-0 left-0 right-0 z-[55] md:hidden h-[60px] bg-white/95 dark:bg-[#161B18]/95 backdrop-blur-xl border-t border-[#E2E6DF] dark:border-[#28312B] shadow-[0_-4px_20px_rgba(23,27,24,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigasi bawah"
    >
      {/* 1. Beranda / Ringkasan */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('dashboard')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-sans font-semibold tracking-tight transition-colors cursor-pointer ${
          currentPage === 'dashboard'
            ? 'text-[#167C35] dark:text-[#00B000] font-bold'
            : 'text-[#5C665F] dark:text-[#B7C1B8] hover:text-[#171B18] dark:hover:text-[#F0F0F0]'
        }`}
      >
        <AppIcon name="grid" size={20} />
        <span>{t('navDashboard')}</span>
      </motion.button>

      {/* 2. Transaksi */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('transactions')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-sans font-semibold tracking-tight transition-colors cursor-pointer ${
          currentPage === 'transactions'
            ? 'text-[#167C35] dark:text-[#00B000] font-bold'
            : 'text-[#5C665F] dark:text-[#B7C1B8] hover:text-[#171B18] dark:hover:text-[#F0F0F0]'
        }`}
      >
        <AppIcon name="list" size={20} />
        <span>{t('navTransactions')}</span>
      </motion.button>

      {/* 3. Centered Speed Log + Button with Refined Green Gradient */}
      <div className="flex-1 flex justify-center -mt-5">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88, rotate: 90 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={onAddTransaction}
          aria-label={t('addTransaction')}
          className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#167C35] via-[#105E28] to-[#171B18] text-[#A4D65A] shadow-[0_4px_16px_rgba(22,124,53,0.38)] border-2 border-[#F4F6F2] dark:border-[#131313] cursor-pointer"
        >
          <AppIcon name="plus" size={20} />
        </motion.button>
      </div>

      {/* 4. Anggaran */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('budgets')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-sans font-semibold tracking-tight transition-colors cursor-pointer ${
          currentPage === 'budgets'
            ? 'text-[#167C35] dark:text-[#00B000] font-bold'
            : 'text-[#5C665F] dark:text-[#B7C1B8] hover:text-[#171B18] dark:hover:text-[#F0F0F0]'
        }`}
      >
        <AppIcon name="wallet" size={20} />
        <span>{t('navBudgets')}</span>
      </motion.button>

      {/* 5. Tujuan */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onNavigate('goals')}
        className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-sans font-semibold tracking-tight transition-colors cursor-pointer ${
          currentPage === 'goals'
            ? 'text-[#167C35] dark:text-[#00B000] font-bold'
            : 'text-[#5C665F] dark:text-[#B7C1B8] hover:text-[#171B18] dark:hover:text-[#F0F0F0]'
        }`}
      >
        <AppIcon name="target" size={20} />
        <span>{t('navGoals')}</span>
      </motion.button>
    </nav>
  );
};
