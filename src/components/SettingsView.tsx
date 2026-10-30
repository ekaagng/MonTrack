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
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#27694c] dark:text-[#52ba88] mb-1.5 text-left">
          <span className="w-4 h-0.5 bg-[#27694c] dark:bg-[#52ba88] rounded-full" />
          <span>{t('settings')}</span>
        </div>
        <h1 className="text-[22px] sm:text-[26px] font-heading font-black tracking-[-0.02em] leading-[1.25] text-[#1a1c19] dark:text-[#eef1ec] text-left">
          {t('settings')}
        </h1>
        <p className="mt-1 text-[13px] sm:text-[14px] font-sans text-[#606c64] dark:text-[#a0aba2] leading-[1.45] text-left">
          {t('settingsIntro')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* Left Column: Profile & Language (12-col Desktop Grid) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Profile Section */}
          <section className="p-4 sm:p-5 md:p-6 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)]">
            <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">{t('profileSettings')}</h2>
            <p className="text-[12px] sm:text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-0.5 mb-4 text-left">{t('profileSettingsDesc')}</p>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="settings-name" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#606c64] dark:text-[#a0aba2] uppercase mb-1.5 text-left">
                  {t('displayName')}
                </label>
                <input
                  id="settings-name"
                  type="text"
                  maxLength={60}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-11 sm:h-12 px-4 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-[14px] font-sans font-medium text-[#1a1c19] focus:border-[#27694c] focus:ring-[3px] focus:ring-[#e9f3ec] outline-none transition-all"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-[#27694c] hover:bg-[#174d36] text-white text-[14px] font-sans font-semibold leading-none shadow-[0_4px_16px_rgba(39,105,76,0.22)] transition-all"
              >
                <AppIcon name="check" size={16} />
                <span>{t('save')}</span>
              </motion.button>
            </form>
          </section>

          {/* Preferences / Language */}
          <section className="p-4 sm:p-5 md:p-6 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)]">
            <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">{t('preferences')}</h2>
            <p className="text-[12px] sm:text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-0.5 mb-4 text-left">{t('preferencesDesc')}</p>

            <div>
              <label className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#606c64] dark:text-[#a0aba2] uppercase mb-2 text-left">
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
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-[12px] sm:rounded-[14px] border text-left transition-all ${
                    lang === 'id'
                      ? 'border-[#27694c] bg-[#f1f7f0] dark:bg-[#183626] text-[#045136] dark:text-[#92d5b1]'
                      : 'border-[#e7ebe4] dark:border-[#2a342c] bg-white dark:bg-[#181c19] text-[#1a1c19] dark:text-[#f0f4f0] hover:bg-[#f9faf5] dark:hover:bg-[#232924]'
                  }`}
                >
                  <div>
                    <strong className="block text-[14px] font-sans font-semibold text-left">{t('indonesian')}</strong>
                    <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aca2] text-left">Bahasa Indonesia (ID)</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-[#27694c] dark:border-[#52ba88] flex items-center justify-center shrink-0">
                    {lang === 'id' && <div className="w-2 h-2 rounded-full bg-[#27694c] dark:bg-[#52ba88]" />}
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
                  className={`flex items-center justify-between p-3 sm:p-3.5 rounded-[12px] sm:rounded-[14px] border text-left transition-all ${
                    lang === 'en'
                      ? 'border-[#27694c] bg-[#f1f7f0] dark:bg-[#183626] text-[#045136] dark:text-[#92d5b1]'
                      : 'border-[#e7ebe4] dark:border-[#2a342c] bg-white dark:bg-[#181c19] text-[#1a1c19] dark:text-[#f0f4f0] hover:bg-[#f9faf5] dark:hover:bg-[#232924]'
                  }`}
                >
                  <div>
                    <strong className="block text-[14px] font-sans font-semibold text-left">{t('english')}</strong>
                    <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] text-left">English (EN)</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-[1.5px] border-[#27694c] dark:border-[#52ba88] flex items-center justify-center shrink-0">
                    {lang === 'en' && <div className="w-2 h-2 rounded-full bg-[#27694c] dark:bg-[#52ba88]" />}
                  </div>
                </motion.button>
              </div>

              {/* Theme selector */}
              <div className="mt-5 pt-4 border-t border-[#e7ebe4] dark:border-[#2a322c]">
                <label className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#606c64] dark:text-[#a2aba3] uppercase mb-2 text-left">
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
                    className={`flex items-center justify-between p-3 rounded-[12px] sm:rounded-[14px] border text-left transition-all ${
                      theme === 'light'
                        ? 'border-[#27694c] bg-[#f1f7f0] text-[#045136]'
                        : 'border-[#e7ebe4] dark:border-[#2a342c] bg-white dark:bg-[#181c19] text-[#1a1c19] dark:text-[#f0f4f0] hover:bg-[#f9faf5] dark:hover:bg-[#232924]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AppIcon name="sun" size={16} />
                      <strong className="block text-[13px] font-sans font-semibold">{t('themeLight')}</strong>
                    </div>
                    <div className="w-4 h-4 rounded-full border-[1.5px] border-[#27694c] flex items-center justify-center shrink-0">
                      {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-[#27694c]" />}
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
                    className={`flex items-center justify-between p-3 rounded-[12px] sm:rounded-[14px] border text-left transition-all ${
                      theme === 'dark'
                        ? 'border-[#52ba88] bg-[#142a1d] text-[#92d5b1]'
                        : 'border-[#e7ebe4] dark:border-[#2a342c] bg-white dark:bg-[#181c19] text-[#1a1c19] dark:text-[#f0f4f0] hover:bg-[#f9faf5] dark:hover:bg-[#232924]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AppIcon name="moon" size={16} />
                      <strong className="block text-[13px] font-sans font-semibold">{t('themeDark')}</strong>
                    </div>
                    <div className="w-4 h-4 rounded-full border-[1.5px] border-[#52ba88] flex items-center justify-center shrink-0">
                      {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-[#52ba88]" />}
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
          <section className="p-4 sm:p-5 md:p-6 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] space-y-4">
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">{t('dataAndPrivacy')}</h2>
              <p className="text-[12px] sm:text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-0.5 text-left">{t('dataAndPrivacyDesc')}</p>
            </div>

            <div className="pt-3.5 border-t border-[#e7ebe4] dark:border-[#2a342c] flex items-center justify-between text-left">
              <div className="flex items-start gap-2.5">
                <div className="text-[#27694c] dark:text-[#52ba88] mt-0.5 shrink-0">
                  <AppIcon name="shield" size={16} />
                </div>
                <div>
                  <strong className="block text-[14px] font-sans font-semibold text-[#1a1c19] dark:text-[#eef1ec]">{t('localOnly')}</strong>
                  <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] block max-w-[280px] mt-0.5 leading-relaxed">
                    {t('localOnlyDetail')}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-sans font-semibold bg-[#edeee9] dark:bg-[#252c27] text-[#404943] dark:text-[#c4cec6] shrink-0">
                Browser
              </span>
            </div>

            <div className="pt-3.5 border-t border-[#e7ebe4] dark:border-[#2a342c] text-left">
              <strong className="block text-[14px] font-sans font-semibold text-[#1a1c19] dark:text-[#eef1ec]">{t('demoMode')}</strong>
              <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] block mt-0.5 leading-relaxed">{t('accountNote')}</span>
            </div>
          </section>

          {/* Reset Demo Data */}
          <section className="p-4 sm:p-5 md:p-6 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)]">
            <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">{t('resetDemo')}</h2>
            <p className="text-[12px] sm:text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-0.5 mb-4 text-left">{t('resetDemoDesc')}</p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onRequestReset}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-[#fff0ed] dark:bg-[#341b18] hover:bg-[#ffe5e0] dark:hover:bg-[#44221d] border border-[#f4d9d4] dark:border-[#5a2a24] text-[#b84b40] dark:text-[#f28577] text-[14px] font-sans font-semibold leading-none transition-all"
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
