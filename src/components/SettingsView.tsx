import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { UserProfile, Language, Theme } from '../types/finance.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface SettingsViewProps {
  profile: UserProfile;
  lang: Language;
  theme: Theme;
  onUpdateProfile: (name: string) => void;
  onUpdateLanguage: (lang: Language) => void;
  onUpdateTheme: (theme: Theme) => void;
  onRequestReset: () => void;
  onShowToast: (title: string, detail?: string, kind?: 'success' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  lang,
  theme,
  onUpdateProfile,
  onUpdateLanguage,
  onUpdateTheme,
  onRequestReset,
  onShowToast,
}) => {
  const t = (k: string) => getTranslation(k, lang);
  const [displayName, setDisplayName] = useState(profile.name || '');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      onShowToast(t('nameRequired'), undefined, 'error');
      return;
    }
    onUpdateProfile(trimmed);
    onShowToast(t('profileSaved'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-[22px] sm:text-[26px] font-heading font-black tracking-[-0.02em] leading-[1.25] text-[#171B18] dark:text-[#F0F0F0] text-left">
          {t('settings')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* Left Column: Profile & Language (12-col Desktop Grid) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Profile Section */}
          <section className="p-4 sm:p-5 md:p-6 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] sm:rounded-[20px] shadow-xs">
            <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
              {t('profileSettings')}
            </h2>
            <p className="text-[12px] sm:text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 mb-4 text-left">
              {t('profileSettingsDesc')}
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="settings-name"
                  className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left"
                >
                  {t('displayName')}
                </label>
                <input
                  id="settings-name"
                  type="text"
                  maxLength={60}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-11 px-4 bg-white dark:bg-[#161B18] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] text-[14px] font-sans font-semibold leading-none shadow-sm transition-all cursor-pointer"
              >
                <AppIcon name="check" size={16} />
                <span>{t('save')}</span>
              </motion.button>
            </form>
          </section>

          {/* Preferences / Language & Theme */}
          <section className="p-4 sm:p-5 md:p-6 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] sm:rounded-[20px] shadow-xs">
            <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
              {t('preferences')}
            </h2>
            <p className="text-[12px] sm:text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 mb-4 text-left">
              {t('preferencesDesc')}
            </p>

            <div>
              <label className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-2 text-left">
                {t('language')}
              </label>
              <div className="grid gap-2.5 sm:max-w-sm" role="radiogroup" aria-label={t('language')}>
                {/* ID Option */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  role="radio"
                  aria-checked={lang === 'id'}
                  onClick={() => onUpdateLanguage('id')}
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-[12px] sm:rounded-[14px] border text-left transition-all cursor-pointer ${
                    lang === 'id'
                      ? 'border-[#167C35] dark:border-[#00B000] bg-[#EBF6EE] dark:bg-[#14291B] text-[#167C35] dark:text-[#00B000]'
                      : 'border-[#E2E6DF] dark:border-[#28312B] bg-white dark:bg-[#1B211D] text-[#171B18] dark:text-[#F0F0F0] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25]'
                  }`}
                >
                  <div>
                    <strong className="block text-[14px] font-sans font-semibold text-left">{t('indonesian')}</strong>
                    <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] text-left">Bahasa Indonesia (ID)</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-[#167C35] dark:border-[#00B000] flex items-center justify-center shrink-0">
                    {lang === 'id' && <div className="w-2 h-2 rounded-full bg-[#167C35] dark:bg-[#00B000]" />}
                  </div>
                </motion.button>

                {/* EN Option */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  role="radio"
                  aria-checked={lang === 'en'}
                  onClick={() => onUpdateLanguage('en')}
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-[12px] sm:rounded-[14px] border text-left transition-all cursor-pointer ${
                    lang === 'en'
                      ? 'border-[#167C35] dark:border-[#00B000] bg-[#EBF6EE] dark:bg-[#14291B] text-[#167C35] dark:text-[#00B000]'
                      : 'border-[#E2E6DF] dark:border-[#28312B] bg-white dark:bg-[#1B211D] text-[#171B18] dark:text-[#F0F0F0] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25]'
                  }`}
                >
                  <div>
                    <strong className="block text-[14px] font-sans font-semibold text-left">{t('english')}</strong>
                    <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] text-left">English (EN)</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-[#167C35] dark:border-[#00B000] flex items-center justify-center shrink-0">
                    {lang === 'en' && <div className="w-2 h-2 rounded-full bg-[#167C35] dark:bg-[#00B000]" />}
                  </div>
                </motion.button>
              </div>

              {/* Theme selector */}
              <div className="mt-5 pt-4 border-t border-[#E2E6DF] dark:border-[#28312B]">
                <label className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-2 text-left">
                  {t('theme')}
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:max-w-sm" role="radiogroup" aria-label={t('theme')}>
                  {/* Light Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    role="radio"
                    aria-checked={theme === 'light'}
                    onClick={() => onUpdateTheme('light')}
                    className={`flex items-center justify-between p-3 rounded-[12px] sm:rounded-[14px] border text-left transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-[#167C35] bg-[#EBF6EE] text-[#167C35]'
                        : 'border-[#E2E6DF] dark:border-[#28312B] bg-white dark:bg-[#1B211D] text-[#171B18] dark:text-[#F0F0F0] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AppIcon name="sun" size={16} />
                      <strong className="block text-[13px] font-sans font-semibold">{t('themeLight')}</strong>
                    </div>
                    <div className="w-4 h-4 rounded-full border-[1.5px] border-[#167C35] flex items-center justify-center shrink-0">
                      {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-[#167C35]" />}
                    </div>
                  </motion.button>

                  {/* Dark Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    role="radio"
                    aria-checked={theme === 'dark'}
                    onClick={() => onUpdateTheme('dark')}
                    className={`flex items-center justify-between p-3 rounded-[12px] sm:rounded-[14px] border text-left transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-[#00B000] bg-[#14291B] text-[#00B000]'
                        : 'border-[#E2E6DF] dark:border-[#28312B] bg-white dark:bg-[#1B211D] text-[#171B18] dark:text-[#F0F0F0] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AppIcon name="moon" size={16} />
                      <strong className="block text-[13px] font-sans font-semibold">{t('themeDark')}</strong>
                    </div>
                    <div className="w-4 h-4 rounded-full border-[1.5px] border-[#00B000] flex items-center justify-center shrink-0">
                      {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-[#00B000]" />}
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Privacy & Demo Reset */}
        <div className="lg:col-span-5 space-y-4">
          {/* Privacy & Storage */}
          <section className="p-4 sm:p-5 md:p-6 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] sm:rounded-[20px] shadow-xs space-y-4">
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
                {t('dataAndPrivacy')}
              </h2>
              <p className="text-[12px] sm:text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 text-left">
                {t('dataAndPrivacyDesc')}
              </p>
            </div>

            <div className="pt-3.5 border-t border-[#E2E6DF] dark:border-[#28312B] flex items-center justify-between text-left">
              <div className="flex items-start gap-2.5">
                <div className="text-[#167C35] dark:text-[#00B000] mt-0.5 shrink-0">
                  <AppIcon name="shield" size={16} />
                </div>
                <div>
                  <strong className="block text-[14px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0]">
                    {t('localOnly')}
                  </strong>
                  <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] block max-w-[280px] mt-0.5 leading-relaxed">
                    {t('localOnlyDetail')}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-sans font-semibold bg-[#EBF0E8] dark:bg-[#222A25] text-[#171B18] dark:text-[#F0F0F0] border border-[#E2E6DF] dark:border-[#28312B] shrink-0">
                Browser
              </span>
            </div>

            <div className="pt-3.5 border-t border-[#E2E6DF] dark:border-[#28312B] text-left">
              <strong className="block text-[14px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0]">
                {t('demoMode')}
              </strong>
              <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] block mt-0.5 leading-relaxed">
                {t('accountNote')}
              </span>
            </div>
          </section>

          {/* Reset Demo Data */}
          <section className="p-4 sm:p-5 md:p-6 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] sm:rounded-[20px] shadow-xs">
            <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
              {t('resetDemo')}
            </h2>
            <p className="text-[12px] sm:text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 mb-4 text-left">
              {t('resetDemoDesc')}
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onRequestReset}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-[#FDF1F0] dark:bg-[#2F1816] hover:bg-[#FAE4E2] dark:hover:bg-[#3D1F1C] border border-[#F7CFCD] dark:border-[#5c2420] text-[#B94E48] dark:text-[#E06D67] text-[14px] font-sans font-semibold leading-none transition-all cursor-pointer"
            >
              <AppIcon name="refresh" size={16} />
              <span>{t('demoResetButton')}</span>
            </motion.button>
          </section>
        </div>
      </div>
    </div>
  );
};
