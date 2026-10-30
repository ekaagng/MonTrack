import React from 'react';
import { motion } from 'motion/react';
import type { Goal, GoalContribution, Language } from '../types/finance.ts';
import { calculateGoalProgress, formatMoney } from '../lib/calculations.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface GoalsViewProps {
  goals: Goal[];
  contributions: GoalContribution[];
  lang: Language;
  onAddGoal: () => void;
  onEditGoal: (g: Goal) => void;
  onDeleteGoal: (g: Goal) => void;
  onContributeGoal: (g: Goal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  contributions,
  lang,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onContributeGoal,
}) => {
  const t = (k: string) => getTranslation(k, lang);

  const priorityLabel = (p: string) => {
    if (p === 'high') return t('highPriority');
    if (p === 'low') return t('lowPriority');
    return t('mediumPriority');
  };

  const goalIcon = (g: Goal) => {
    if (g.priority === 'high') return 'target';
    const low = g.name.toLowerCase();
    if (low.includes('libur') || low.includes('travel') || low.includes('trip')) return 'plane';
    if (low.includes('laptop') || low.includes('work') || low.includes('gadget')) return 'briefcase';
    return 'heart';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#27694c] dark:text-[#52ba88] mb-1.5 text-left">
            <span className="w-4 h-0.5 bg-[#27694c] dark:bg-[#52ba88] rounded-full" />
            <span>{t('navGoals')}</span>
          </div>
          <h1 className="text-[22px] sm:text-[26px] font-heading font-black tracking-[-0.02em] leading-[1.25] text-[#1a1c19] dark:text-[#eef1ec] text-left">
            {t('navGoals')}
          </h1>
          <p className="mt-1 text-[13px] sm:text-[14px] font-sans text-[#606c64] dark:text-[#a0aba2] leading-[1.45] text-left">
            {t('goalPageIntro')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddGoal}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-[12px] bg-[#27694c] hover:bg-[#174d36] text-white text-[14px] font-sans font-semibold leading-none shadow-[0_4px_16px_rgba(39,105,76,0.22)] transition-all shrink-0"
        >
          <AppIcon name="plus" size={16} />
          <span>{t('addGoal')}</span>
        </motion.button>
      </div>

      {/* Goal Cards Grid (12-col Desktop Grid / 16px Mobile Padding) */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
          {goals.map((g) => {
            const prog = calculateGoalProgress(g, contributions);
            const etaText = prog.isCompleted
              ? t('goalComplete')
              : prog.etaMonths !== null
              ? `${t('goalEta')}: ${prog.etaMonths} ${t('goalEtaMonths')}`
              : t('goalNoEta');

            return (
              <article
                key={g.id}
                className="md:col-span-6 p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] flex flex-col justify-between gap-4 tactile-card"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center justify-center w-11 h-11 rounded-[14px] bg-[#edf4e8] dark:bg-[#1a3424] text-[#27694c] dark:text-[#52ba88] shrink-0">
                      <AppIcon name={goalIcon(g)} size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-sans font-medium bg-[#edeee9] dark:bg-[#252c27] text-[#404943] dark:text-[#c4cec6]">
                        {priorityLabel(g.priority)}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEditGoal(g)}
                        aria-label={`${t('edit')}: ${g.name}`}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#707972] dark:text-[#a0aba2] hover:bg-[#e9f3ec] dark:hover:bg-[#1a3424] hover:text-[#27694c] dark:hover:text-[#52ba88] transition-colors"
                      >
                        <AppIcon name="edit" size={15} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDeleteGoal(g)}
                        aria-label={`${t('delete')}: ${g.name}`}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#707972] dark:text-[#a0aba2] hover:bg-[#fff0ed] dark:hover:bg-[#381a17] hover:text-[#b84b40] dark:hover:text-[#e87063] transition-colors"
                      >
                        <AppIcon name="trash" size={15} />
                      </motion.button>
                    </div>
                  </div>

                  <h3 className="text-[15px] sm:text-[16px] font-heading font-bold text-[#1a1c19] dark:text-[#eef1ec] mt-3 text-left">{g.name}</h3>
                  <p className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-0.5 text-left">{g.note || t('goalTarget')}</p>

                  <div className="text-[22px] sm:text-[26px] font-heading font-black tabular-nums text-[#1a1c19] dark:text-[#eef1ec] mt-3 text-left">
                    {formatMoney(prog.currentSaved, lang)}
                  </div>
                  <div className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] text-left">
                    {t('goalTarget').toLowerCase()} {formatMoney(g.targetAmount, lang)}
                  </div>

                  <div className="w-full h-2 bg-[#f3f4ef] dark:bg-[#252c27] rounded-full overflow-hidden mt-3">
                    <motion.div
                      className="h-full bg-[#27694c] dark:bg-[#52ba88] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${prog.percentage}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-2">
                    <span className="font-semibold text-left">
                      {prog.percentage}% {t('goalProgress').toLowerCase()}
                    </span>
                    <span className="tabular-nums text-right">
                      {prog.remaining > 0
                        ? `${formatMoney(prog.remaining, lang)} ${t('goalRemaining')}`
                        : t('goalComplete')}
                    </span>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#e7ebe4] dark:border-[#2a342c] flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] truncate text-left">{etaText}</span>
                  {/* Soft Secondary Button with Tactile Motion */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onContributeGoal(g)}
                    disabled={prog.isCompleted}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[12px] bg-[#e9f3ec] dark:bg-[#1a3424] hover:bg-[#d8ebd9] dark:hover:bg-[#204430] disabled:opacity-40 text-[14px] font-sans font-semibold text-[#27694c] dark:text-[#52ba88] transition-all shrink-0"
                  >
                    <AppIcon name="plus" size={13} />
                    <span>{t('contribute')}</span>
                  </motion.button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-8 sm:p-12 text-center bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2]">
          <p className="font-heading font-bold text-[#1a1c19] dark:text-[#eef1ec] text-[15px] sm:text-[16px] mb-1">{t('noGoals')}</p>
          <p className="max-w-xs mx-auto mb-4">{t('noGoalsDesc')}</p>
          <button
            onClick={onAddGoal}
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-[12px] bg-[#27694c] hover:bg-[#174d36] text-white text-[14px] font-sans font-semibold"
          >
            <AppIcon name="plus" size={14} />
            <span>{t('addGoal')}</span>
          </button>
        </div>
      )}

      {/* Educational Notice */}
      <section className="bg-white border border-[#e7ebe4] rounded-[20px] p-5 shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)]">
        <div className="flex items-start gap-3 text-xs text-[#606c64]">
          <div className="text-[#27694c] mt-0.5">
            <AppIcon name="info" size={16} />
          </div>
          <div>
            <strong className="block text-xs font-bold text-[#1a1c19] mb-0.5">
              {t('goalDataNote')}
            </strong>
            <p className="leading-relaxed">{t('contributionHint')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
