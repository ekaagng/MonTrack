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

  const priorityBadgeStyle = (p: string) => {
    if (p === 'high') {
      return 'bg-[#FDF1F0] text-[#B94E48] dark:bg-[#2F1816] dark:text-[#E06D67] border border-[#F7CFCD]/60 dark:border-[#5c2420]/40';
    }
    if (p === 'low') {
      return 'bg-[#FEF8E7] text-[#946200] dark:bg-[#382B10] dark:text-[#F3C868] border border-[#FAE8B4]/60 dark:border-[#594416]/40';
    }
    // medium / menengah
    return 'bg-[#EDF4FE] text-[#1E5EB5] dark:bg-[#152A48] dark:text-[#8AB4F8] border border-[#CBE0FC]/60 dark:border-[#224472]/40';
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
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-[22px] sm:text-[26px] font-heading font-bold tracking-tight leading-[1.25] text-[#171B18] dark:text-[#F0F0F0] text-left">
          {t('navGoals')}
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddGoal}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] text-[14px] font-sans font-semibold leading-none shadow-sm transition-all shrink-0 cursor-pointer"
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
                className="md:col-span-6 p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex flex-col justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center justify-center w-11 h-11 rounded-[12px] bg-[#EBF6EE] dark:bg-[#14291B] text-[#167C35] dark:text-[#A4D65A] shrink-0 border border-[#C8E7D1]/50 dark:border-[#00B000]/20">
                      <AppIcon name={goalIcon(g)} size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold ${priorityBadgeStyle(g.priority)}`}>
                        {priorityLabel(g.priority)}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEditGoal(g)}
                        aria-label={`${t('edit')}: ${g.name}`}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#EBF6EE] dark:hover:bg-[#14291B] hover:text-[#167C35] dark:hover:text-[#00B000] transition-colors cursor-pointer"
                      >
                        <AppIcon name="edit" size={15} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDeleteGoal(g)}
                        aria-label={`${t('delete')}: ${g.name}`}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#FDF1F0] dark:hover:bg-[#2F1816] hover:text-[#B94E48] dark:hover:text-[#E06D67] transition-colors cursor-pointer"
                      >
                        <AppIcon name="trash" size={15} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] sm:text-[16px] font-heading font-semibold text-[#171B18] dark:text-[#F0F0F0] text-left leading-[1.3] truncate">
                        {g.name}
                      </h3>
                      <p className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 text-left leading-[1.35] truncate">
                        {g.note || t('goalTarget')}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[18px] sm:text-[20px] font-heading font-bold tabular-nums text-[#171B18] dark:text-[#F0F0F0] leading-[1.2]">
                        {formatMoney(prog.currentSaved, lang)}
                      </div>
                      <div className="text-[11px] sm:text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 tabular-nums text-right">
                        {t('goalTarget').toLowerCase()} {formatMoney(g.targetAmount, lang)}
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-[#EBF0E8] dark:bg-[#222A25] rounded-full overflow-hidden mt-3">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#167C35] to-[#A4D65A] dark:from-[#00B000] dark:to-[#A4D65A] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${prog.percentage}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-2">
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

                <div className="pt-3 border-t border-[#E2E6DF] dark:border-[#28312B] flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] truncate text-left">{etaText}</span>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onContributeGoal(g)}
                    disabled={prog.isCompleted}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[12px] bg-[#EBF6EE] dark:bg-[#14291B] hover:bg-[#DDF0E2] dark:hover:bg-[#1C3A26] disabled:opacity-40 text-[14px] font-sans font-semibold text-[#167C35] dark:text-[#00B000] border border-[#C8E7D1]/50 dark:border-[#00B000]/20 transition-all shrink-0 cursor-pointer"
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
        <div className="p-12 text-center bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] text-[#5C665F] dark:text-[#B7C1B8] shadow-xs">
          <p className="text-[14px] font-sans">{t('noGoals')}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onAddGoal}
            className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] text-[14px] font-sans font-semibold cursor-pointer shadow-sm"
          >
            <AppIcon name="plus" size={16} />
            <span>{t('addGoal')}</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};
