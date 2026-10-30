import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PageId, UserProfile, Language } from '../types/finance.ts';
import { AppIcon, type IconName } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface SidebarProps {
  currentPage: PageId;
  profile: UserProfile;
  lang: Language;
  isOpenMobile: boolean;
  onNavigate: (page: PageId) => void;
  onCloseMobile: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
}

interface NavItem {
  id: PageId;
  labelKey: string;
  icon: IconName;
}

const navItems: NavItem[] = [
  { id: 'dashboard', labelKey: 'navDashboard', icon: 'grid' },
  { id: 'transactions', labelKey: 'navTransactions', icon: 'list' },
  { id: 'budgets', labelKey: 'navBudgets', icon: 'wallet' },
  { id: 'goals', labelKey: 'navGoals', icon: 'target' },
  { id: 'reports', labelKey: 'navReports', icon: 'chart' },
  { id: 'categories', labelKey: 'navCategories', icon: 'tag' },
  { id: 'settings', labelKey: 'navSettings', icon: 'settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  profile,
  lang,
  isOpenMobile,
  onNavigate,
  onCloseMobile,
  onExportCsv,
  onExportPdf,
}) => {
  const t = (k: string) => getTranslation(k, lang);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

  const runExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') onExportCsv();
    else onExportPdf();
    onCloseMobile();
  };

  return (
    <>
      <AnimatePresence>
        {isOpenMobile && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[65] bg-[rgba(23,27,24,0.45)] backdrop-blur-sm md:hidden"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        id="sidebar"
        aria-label={t('workspace')}
        className={`fixed bottom-0 left-0 top-0 z-[70] flex h-screen w-[min(84vw,280px)] flex-col justify-between border-r border-[#E2E6DF] bg-[#F4F6F2] p-5 transition-transform duration-250 ease-out dark:border-[#28312B] dark:bg-[#161B18] md:sticky md:top-0 md:w-[244px] md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="min-h-0">
          <div className="mb-6 flex items-center gap-3 px-2 py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#167C35]/30 bg-gradient-to-br from-[#167C35] via-[#105E28] to-[#171B18] text-[#A4D65A] shadow-md">
              <AppIcon name="logo" size={20} />
            </div>
            <div className="text-left">
              <div className="text-[16px] font-heading font-bold tracking-tight text-[#171B18] dark:text-[#F0F0F0]">MONTRACK</div>
              <div className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#5C665F] dark:text-[#B7C1B8]">Personal Finance</div>
            </div>
          </div>

          <div className="mb-2 px-3 text-left text-[11px] font-sans font-bold uppercase tracking-wider text-[#5C665F] dark:text-[#B7C1B8]">
            {t('workspace')}
          </div>

          <nav className="grid gap-1" aria-label={t('workspace')}>
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-left text-[14px] font-sans font-semibold transition-colors ${
                    active
                      ? 'border border-[#C8E7D1]/60 bg-[#EBF6EE] text-[#167C35] shadow-xs dark:border-[#00B000]/30 dark:bg-[#1B2B20] dark:text-[#00B000]'
                      : 'text-[#5C665F] hover:bg-[#EBF0E8] hover:text-[#171B18] dark:text-[#B7C1B8] dark:hover:bg-[#222A25] dark:hover:text-[#F0F0F0]'
                  }`}
                >
                  <AppIcon name={item.icon} size={18} />
                  <span>{t(item.labelKey)}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="mt-2 border-t border-[#E2E6DF] pt-2 dark:border-[#28312B]">
            <button
              type="button"
              onClick={() => setIsExportOpen((open) => !open)}
              aria-expanded={isExportOpen}
              aria-controls="sidebar-export-options"
              className="flex min-h-[44px] w-full items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-left text-[14px] font-sans font-semibold text-[#5C665F] transition-colors hover:bg-[#EBF0E8] hover:text-[#171B18] dark:text-[#B7C1B8] dark:hover:bg-[#222A25] dark:hover:text-[#F0F0F0]"
            >
              <AppIcon name="download" size={18} />
              <span>{t('exportFiles')}</span>
              <span className="ml-auto text-[15px] leading-none" aria-hidden="true">{isExportOpen ? '−' : '+'}</span>
            </button>

            <AnimatePresence initial={false}>
              {isExportOpen && (
                <motion.div
                  id="sidebar-export-options"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.14 }}
                  className="ml-9 mt-1 grid gap-1"
                >
                  <button
                    type="button"
                    onClick={() => runExport('pdf')}
                    className="flex min-h-[40px] items-center gap-2 rounded-[10px] px-3 text-left text-[13px] font-medium text-[#5C665F] transition-colors hover:bg-[#EBF0E8] hover:text-[#167C35] dark:text-[#B7C1B8] dark:hover:bg-[#222A25] dark:hover:text-[#00B000]"
                  >
                    <span className="w-8 rounded-md border border-[#E2E6DF] px-1.5 py-0.5 text-center text-[9px] font-bold tracking-wide dark:border-[#37443B]">PDF</span>
                    <span>{t('exportPdf')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => runExport('csv')}
                    className="flex min-h-[40px] items-center gap-2 rounded-[10px] px-3 text-left text-[13px] font-medium text-[#5C665F] transition-colors hover:bg-[#EBF0E8] hover:text-[#167C35] dark:text-[#B7C1B8] dark:hover:bg-[#222A25] dark:hover:text-[#00B000]"
                  >
                    <span className="w-8 rounded-md border border-[#E2E6DF] px-1.5 py-0.5 text-center text-[9px] font-bold tracking-wide dark:border-[#37443B]">CSV</span>
                    <span>{t('exportCsv')}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#E2E6DF] pt-4 dark:border-[#28312B]">
          <div className="mb-3 rounded-[14px] border border-[#E2E6DF] bg-white p-3.5 dark:border-[#28312B] dark:bg-[#1B211D]">
            <div className="flex items-center gap-2 text-left text-[12px] font-sans font-bold text-[#167C35] dark:text-[#00B000]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#167C35] dark:bg-[#00B000]" />
              <span>{t('demoMode')}</span>
            </div>
            <p className="mt-1 text-left text-[11px] leading-[1.4] text-[#5C665F] dark:text-[#B7C1B8]">{t('demoNote')}</p>
          </div>

          <div className="flex items-center gap-3 px-1 pt-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C8E7D1]/50 bg-[#EBF6EE] font-heading text-xs font-bold text-[#167C35] dark:border-[#00B000]/20 dark:bg-[#1B2B20] dark:text-[#A4D65A]">
              {initial}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-[13px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0]">{profile.name || 'Pengguna'}</div>
              <div className="truncate text-[11px] font-sans text-[#5C665F] dark:text-[#B7C1B8]">{t('personalSpace')}</div>
            </div>
            <motion.button
              type="button"
              whileHover={{ rotate: 30, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                onNavigate('settings');
                onCloseMobile();
              }}
              aria-label={t('navSettings')}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5C665F] transition-colors hover:bg-[#EBF0E8] hover:text-[#171B18] dark:text-[#B7C1B8] dark:hover:bg-[#222A25] dark:hover:text-[#F0F0F0]"
            >
              <AppIcon name="settings" size={16} />
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  );
};
