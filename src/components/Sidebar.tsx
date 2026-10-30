import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PageId, Language, UserProfile } from '../types/finance.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface SidebarProps {
  currentPage: PageId;
  profile: UserProfile;
  lang: Language;
  isOpenMobile: boolean;
  onNavigate: (page: PageId) => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  profile,
  lang,
  isOpenMobile,
  onNavigate,
  onCloseMobile,
}) => {
  const t = (k: string) => getTranslation(k, lang);

  const navItems: Array<{ id: PageId; labelKey: string; icon: string }> = [
    { id: 'dashboard', labelKey: 'navDashboard', icon: 'grid' },
    { id: 'transactions', labelKey: 'navTransactions', icon: 'list' },
    { id: 'budgets', labelKey: 'navBudgets', icon: 'wallet' },
    { id: 'goals', labelKey: 'navGoals', icon: 'target' },
    { id: 'reports', labelKey: 'navReports', icon: 'chart' },
    { id: 'categories', labelKey: 'navCategories', icon: 'tag' },
    { id: 'settings', labelKey: 'navSettings', icon: 'settings' },
  ];

  const initial = (profile.name || 'U').trim().charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Drawer Backdrop with Blur */}
      <AnimatePresence>
        {isOpenMobile && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[65] bg-[rgba(24,35,27,0.4)] backdrop-blur-sm md:hidden"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        id="sidebar"
        aria-label="Navigasi utama"
        className={`fixed top-0 bottom-0 left-0 z-[70] w-[min(84vw,280px)] md:w-[244px] md:sticky md:top-0 h-screen bg-[#f9faf5] border-r border-[#e7ebe4] p-5 flex flex-col justify-between transition-transform duration-250 ease-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 py-1 mb-7">
            <div className="flex items-center justify-center w-9 h-9 rounded-[13px] bg-[#27694c] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
              <AppIcon name="logo" size={20} />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-[#1a1c19] dark:text-[#eef1ec]">
                money tracker
              </div>
              <div className="text-[10px] tracking-wider uppercase text-[#606c64] dark:text-[#88938a]">
                personal finance
              </div>
            </div>
          </div>

          <div className="text-[10px] tracking-wider font-extrabold uppercase text-[#9ba29b] dark:text-[#727d75] px-3 mb-2.5">
            {t('workspace')}
          </div>

          {/* Navigation Links with Tactile Feedback */}
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[13px] text-[13px] font-bold text-left transition-all ${
                    active
                      ? 'bg-[#e5efe7] dark:bg-[#183626] text-[#174d36] dark:text-[#92d5b1] shadow-xs'
                      : 'text-[#687169] dark:text-[#a0aba2] hover:bg-[#ecefe8] dark:hover:bg-[#202622] hover:text-[#202923] dark:hover:text-[#eef1ec]'
                  }`}
                >
                  <AppIcon name={item.icon} size={17} />
                  <span>{t(item.labelKey)}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Status */}
        <div className="pt-4 border-t border-[#e8ece5] dark:border-[#2a322c]">
          <div className="p-3 mb-3 bg-[#f9faf6] dark:bg-[#1a1f1b] border border-[#e3e8df] dark:border-[#2a322c] rounded-[15px]">
            <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#174d36] dark:text-[#52ba88]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6ca875]" />
              <span>{t('demoMode')}</span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#788079] dark:text-[#88938a] leading-relaxed">
              {t('demoNote')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 px-1 pt-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#dce8d8] dark:bg-[#1e3b2b] text-[#174d36] dark:text-[#92d5b1] font-extrabold text-xs shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#202923] dark:text-[#eef1ec] truncate">
                {profile.name || 'Pengguna'}
              </div>
              <div className="text-[10px] text-[#788079] dark:text-[#88938a] truncate">
                {t('personalSpace')}
              </div>
            </div>
            <motion.button
              whileHover={{ rotate: 30, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                onNavigate('settings');
                onCloseMobile();
              }}
              aria-label={t('navSettings')}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-[#788079] dark:text-[#88938a] hover:bg-[#e9ede5] dark:hover:bg-[#202622] hover:text-[#202923] dark:hover:text-[#eef1ec] transition-colors"
            >
              <AppIcon name="settings" size={16} />
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  );
};
