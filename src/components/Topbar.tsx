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
    <header className="flex items-center justify-between gap-4 mb-6 md:mb-8">
      <div className="flex items-center gap-3 min-w-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpenMobileMenu}
          aria-label="Buka menu"
          className="flex md:hidden items-center justify-center w-9 h-9 bg-white dark:bg-[#1b201d] border border-[#e8ece5] dark:border-[#2a322c] rounded-xl text-[#5e685f] dark:text-[#a0aba2] hover:bg-[#f8faf6] dark:hover:bg-[#232924] shrink-0"
        >
          <AppIcon name="menu" size={17} />
        </motion.button>

        <div className="flex items-center gap-2 text-[12px] font-sans text-[#788079] dark:text-[#8d978f]">
          <span className="hidden sm:inline font-medium">{t('breadcrumbHome')}</span>
          <span className="hidden sm:inline" aria-hidden="true">/</span>
          <strong className="font-heading font-bold text-[#202923] dark:text-[#eff2ed] text-[14px] sm:text-[13px] truncate">
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
            className="flex items-center gap-1.5 h-9 px-3 bg-white dark:bg-[#1b201d] border border-[#e8ece5] dark:border-[#2a322c] rounded-xl text-[13px] font-sans font-semibold text-[#586159] dark:text-[#c4cec6] hover:bg-[#f8faf6] dark:hover:bg-[#232924] transition-colors shadow-xs"
          >
            <span>{lang.toUpperCase()}</span>
            <motion.span
              animate={{ rotate: langMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              aria-hidden="true"
              className="text-[10px] text-[#788079] dark:text-[#8d978f]"
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
                  className="absolute right-0 top-full mt-2 w-48 p-2 bg-white/95 dark:bg-[#1b201d]/95 backdrop-blur-xl border border-[#e8ece5] dark:border-[#2a322c] rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.18)] z-40"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#788079] dark:text-[#8d978f] uppercase tracking-wider">
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
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                      lang === 'id'
                        ? 'bg-[#e9f3ec] dark:bg-[#183526] text-[#174d36] dark:text-[#92d5b1]'
                        : 'text-[#202923] dark:text-[#eff2ed] hover:bg-[#f5f6f1] dark:hover:bg-[#232924]'
                    }`}
                  >
                    <span>Bahasa Indonesia</span>
                    {lang === 'id' && <span className="text-[#27694c] dark:text-[#52ba88]">✓</span>}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    role="menuitemradio"
                    aria-checked={lang === 'en'}
                    onClick={() => {
                      onLanguageChange('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                      lang === 'en'
                        ? 'bg-[#e9f3ec] dark:bg-[#183526] text-[#174d36] dark:text-[#92d5b1]'
                        : 'text-[#202923] dark:text-[#eff2ed] hover:bg-[#f5f6f1] dark:hover:bg-[#232924]'
                    }`}
                  >
                    <span>English</span>
                    {lang === 'en' && <span className="text-[#27694c] dark:text-[#52ba88]">✓</span>}
                  </motion.button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Dark / Light Mode Direct Single-Click Toggle Button with Tactile Rotation */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9, rotate: 20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? t('themeToggleToLight') : t('themeToggleToDark')}
          title={theme === 'dark' ? t('themeToggleToLight') : t('themeToggleToDark')}
          className="flex items-center justify-center w-9 h-9 bg-white dark:bg-[#1b201d] border border-[#e8ece5] dark:border-[#2a322c] rounded-xl text-[#586159] dark:text-[#c4cec6] hover:bg-[#f8faf6] dark:hover:bg-[#232924] hover:text-[#27694c] dark:hover:text-[#52ba88] transition-colors shrink-0 shadow-xs"
        >
          <AppIcon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
        </motion.button>

        {/* Quick Add Button (Desktop) with Tactile Spring */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9, rotate: 45 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={onQuickAdd}
          aria-label={t('addTransaction')}
          title={t('addTransaction')}
          className="hidden sm:flex items-center justify-center w-9 h-9 bg-white dark:bg-[#1b201d] border border-[#e8ece5] dark:border-[#2a322c] rounded-xl text-[#5e685f] dark:text-[#c4cec6] hover:bg-[#f8faf6] dark:hover:bg-[#232924] hover:text-[#27694c] dark:hover:text-[#52ba88] transition-colors shrink-0 shadow-xs"
        >
          <AppIcon name="plus" size={17} />
        </motion.button>
      </div>
    </header>
  );
};
