import React from 'react';
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
}) => {
  const t = (k: string) => getTranslation(k, lang);
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

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
            className="fixed inset-0 z-[65] bg-[rgba(23,27,24,0.45)] backdrop-blur-sm md:hidden"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        id="sidebar"
        aria-label="Navigasi utama"
        className={`fixed top-0 bottom-0 left-0 z-[70] w-[min(84vw,280px)] md:w-[244px] md:sticky md:top-0 h-screen bg-[#F4F6F2] dark:bg-[#161B18] border-r border-[#E2E6DF] dark:border-[#28312B] p-5 flex flex-col justify-between transition-transform duration-250 ease-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand with Refined Green Gradient */}
          <div className="flex items-center gap-3 px-2 py-1 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#167C35] via-[#105E28] to-[#171B18] text-[#A4D65A] shadow-md border border-[#167C35]/30">
              <AppIcon name="logo" size={20} />
            </div>
            <div className="text-left">
              <div className="text-[16px] font-heading font-bold tracking-tight text-[#171B18] dark:text-[#F0F0F0]">
                MONTRACK
              </div>
              <div className="text-[11px] font-sans font-medium tracking-wider uppercase text-[#5C665F] dark:text-[#B7C1B8]">
                Personal Finance
              </div>
            </div>
          </div>

          <div className="text-[11px] tracking-wider font-sans font-bold uppercase text-[#5C665F] dark:text-[#B7C1B8] px-3 mb-2 text-left">
            {t('workspace')}
          </div>

          {/* Navigation Links with Inter 14px and >=44px touch targets */}
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
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[14px] font-sans font-semibold text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-[#EBF6EE] dark:bg-[#1B2B20] text-[#167C35] dark:text-[#00B000] border border-[#C8E7D1]/60 dark:border-[#00B000]/30 shadow-xs'
                      : 'text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25] hover:text-[#171B18] dark:hover:text-[#F0F0F0]'
                  }`}
                >
                  <AppIcon name={item.icon} size={18} />
                  <span>{t(item.labelKey)}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Status */}
        <div className="pt-4 border-t border-[#E2E6DF] dark:border-[#28312B]">
          <div className="p-3.5 mb-3 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[14px]">
            <div className="flex items-center gap-2 text-[12px] font-sans font-bold text-[#167C35] dark:text-[#00B000] text-left">
              <span className="w-1.5 h-1.5 rounded-full bg-[#167C35] dark:bg-[#00B000]" />
              <span>{t('demoMode')}</span>
            </div>
            <p className="mt-1 text-[11px] font-sans text-[#5C665F] dark:text-[#B7C1B8] leading-[1.4] text-left">
              {t('demoNote')}
            </p>
          </div>

          <div className="flex items-center gap-3 px-1 pt-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#EBF6EE] dark:bg-[#1B2B20] text-[#167C35] dark:text-[#A4D65A] font-heading font-bold text-xs shrink-0 border border-[#C8E7D1]/50 dark:border-[#00B000]/20">
              {initial}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-[13px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] truncate">
                {profile.name || 'Pengguna'}
              </div>
              <div className="text-[11px] font-sans text-[#5C665F] dark:text-[#B7C1B8] truncate">
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
              className="flex items-center justify-center w-7 h-7 rounded-lg text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25] hover:text-[#171B18] dark:hover:text-[#F0F0F0] transition-colors cursor-pointer"
            >
              <AppIcon name="settings" size={16} />
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  );
};
