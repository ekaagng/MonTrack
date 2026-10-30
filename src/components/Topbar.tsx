import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PageId, Language, Theme } from '../types/finance.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface TopbarProps {
  currentPage: PageId;
  lang: Language;
  theme: Theme;
  onLanguageChange: (lang: Language) => void;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  onQuickAdd: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentPage,
  lang,
  theme,
  onLanguageChange,
  onToggleTheme,
  onOpenMobileMenu,
  onQuickAdd,
}) => {
  const t = (k: string) => getTranslation(k, lang);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const pageTitles: Record<PageId, string> = {
    dashboard: t('navDashboard'),
    transactions: t('navTransactions'),
    budgets: t('navBudgets'),
    goals: t('navGoals'),
    reports: t('navReports'),
    categories: t('navCategories'),
    settings: t('navSettings'),
  };

  return (
    <header className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
      <div className="flex items-center gap-3 min-w-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpenMobileMenu}
          aria-label="Buka menu"
          className="flex md:hidden items-center justify-center w-10 h-10 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25] shrink-0 cursor-pointer"
        >
          <AppIcon name="menu" size={18} />
        </motion.button>

        <div className="flex items-center gap-2 text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8]">
          <span className="hidden sm:inline font-medium">{t('breadcrumbHome')}</span>
          <span className="hidden sm:inline" aria-hidden="true">/</span>
          <strong className="font-heading font-bold text-[#171B18] dark:text-[#F0F0F0] text-[15px] sm:text-[16px] truncate">
            {pageTitles[currentPage]}
          </strong>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Selector Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            aria-haspopup="menu"
            aria-expanded={langMenuOpen}
            className="flex items-center gap-1.5 h-10 px-3 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[13px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25] transition-colors cursor-pointer"
          >
            <span>{lang.toUpperCase()}</span>
            <motion.span
              animate={{ rotate: langMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              aria-hidden="true"
              className="text-[10px] text-[#5C665F] dark:text-[#B7C1B8]"
            >
              ⌄
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {langMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-30"
                  onClick={() => setLangMenuOpen(false)}
                  aria-hidden="true"
                />
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, scale: 0.93, y: -8, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, y: -6, filter: 'blur(4px)' }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-2 w-48 p-2 bg-white/95 dark:bg-[#1B211D]/95 backdrop-blur-xl border border-[#E2E6DF] dark:border-[#28312B] rounded-[14px] shadow-[0_16px_36px_rgba(23,27,24,0.14)] z-40"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#5C665F] dark:text-[#B7C1B8] uppercase tracking-wider">
                    {t('chooseLanguage')}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    role="menuitemradio"
                    aria-checked={lang === 'id'}
                    onClick={() => {
                      onLanguageChange('id');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[10px] text-[13px] font-sans font-semibold transition-colors cursor-pointer ${
                      lang === 'id'
                        ? 'bg-[#EBF6EE] dark:bg-[#14291B] text-[#167C35] dark:text-[#00B000]'
                        : 'text-[#171B18] dark:text-[#F0F0F0] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25]'
                    }`}
                  >
                    <span>Bahasa Indonesia</span>
                    {lang === 'id' && <span className="text-[#167C35] dark:text-[#00B000]">✓</span>}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    role="menuitemradio"
                    aria-checked={lang === 'en'}
                    onClick={() => {
                      onLanguageChange('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[10px] text-[13px] font-sans font-semibold transition-colors cursor-pointer ${
                      lang === 'en'
                        ? 'bg-[#EBF6EE] dark:bg-[#14291B] text-[#167C35] dark:text-[#00B000]'
                        : 'text-[#171B18] dark:text-[#F0F0F0] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25]'
                    }`}
                  >
                    <span>English</span>
                    {lang === 'en' && <span className="text-[#167C35] dark:text-[#00B000]">✓</span>}
                  </motion.button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Dark / Light Mode Direct Single-Click Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9, rotate: 20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? t('themeToggleToLight') : t('themeToggleToDark')}
          title={theme === 'dark' ? t('themeToggleToLight') : t('themeToggleToDark')}
          className="flex items-center justify-center w-10 h-10 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25] hover:text-[#167C35] dark:hover:text-[#00B000] transition-colors shrink-0 cursor-pointer"
        >
          <AppIcon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </motion.button>

        {/* Quick Add Button (Desktop) with Refined Green */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9, rotate: 45 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={onQuickAdd}
          aria-label={t('addTransaction')}
          title={t('addTransaction')}
          className="hidden sm:flex items-center justify-center w-10 h-10 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#EBF6EE] dark:hover:bg-[#14291B] hover:text-[#167C35] dark:hover:text-[#00B000] hover:border-[#167C35]/40 transition-colors shrink-0 cursor-pointer"
        >
          <AppIcon name="plus" size={18} />
        </motion.button>
      </div>
    </header>
  );
};
