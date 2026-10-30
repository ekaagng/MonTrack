import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import type { Budget, Category, Transaction, Language } from '../types/finance.ts';
import { currentMonth, monthLabel, calculateBudgetUsage, formatMoney } from '../lib/calculations.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  lang: Language;
  onAddBudget: () => void;
  onEditBudget: (b: Budget) => void;
  onDeleteBudget: (b: Budget) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  transactions,
  lang,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
}) => {
  const t = (k: string) => getTranslation(k, lang);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth());

  const categoryMap = useMemo(
    () => new Map<string, Category>(categories.map((c) => [c.id, c])),
    [categories]
  );

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const now = new Date();
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return { value: m, label: monthLabel(m, lang) };
    });
  }, [lang]);

  const monthBudgets = useMemo(() => {
    return budgets
      .filter((b) => b.month === selectedMonth)
      .map((b) => ({
        ...b,
        category: categoryMap.get(b.categoryId),
        usage: calculateBudgetUsage(b, transactions),
      }))
      .sort((a, b) => b.usage.percentage - a.usage.percentage);
  }, [budgets, selectedMonth, categoryMap, transactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#27694c] dark:text-[#52ba88] mb-1.5 text-left">
            <span className="w-4 h-0.5 bg-[#27694c] dark:bg-[#52ba88] rounded-full" />
            <span>{t('currentMonth')}</span>
          </div>
          <h1 className="text-[22px] sm:text-[26px] font-heading font-black tracking-[-0.02em] leading-[1.25] text-[#1a1c19] dark:text-[#eef1ec] text-left">
            {t('navBudgets')}
          </h1>
          <p className="mt-1 text-[13px] sm:text-[14px] font-sans text-[#606c64] dark:text-[#a0aba2] leading-[1.45] text-left">
            {t('budgetPageIntro')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddBudget}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-[12px] bg-[#27694c] hover:bg-[#174d36] text-white text-[14px] font-sans font-semibold leading-none shadow-[0_4px_16px_rgba(39,105,76,0.22)] transition-all shrink-0"
        >
          <AppIcon name="plus" size={16} />
          <span>{t('addBudget')}</span>
        </motion.button>
      </div>

      {/* Toolbar / Month Filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="budget-month-filter" className="text-[12px] sm:text-[13px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2]">
            {t('budgetMonth')}:
          </label>
          <select
            id="budget-month-filter"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-11 px-3.5 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-[13px] font-sans font-medium text-[#404943] focus:border-[#27694c] outline-none"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[12px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2]">
          {monthBudgets.length} {t('budgets').toLowerCase()}
        </span>
      </div>

      {/* Budget Cards Grid (12-col Desktop Grid / 16px Mobile Padding) */}
      {monthBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
          {monthBudgets.map((b) => {
            const fillClass =
              b.usage.status === 'over_budget'
                ? 'bg-[#ba1a1a] dark:bg-[#e87063]'
                : b.usage.status === 'near_limit'
                ? 'bg-[#db815e] dark:bg-[#e89574]'
                : 'bg-[#27694c] dark:bg-[#52ba88]';

            const badgeBg =
              b.usage.status === 'over_budget'
                ? 'bg-[#fff0ed] dark:bg-[#331714] text-[#b84b40] dark:text-[#e87063]'
                : b.usage.status === 'near_limit'
                ? 'bg-[#fcf2ee] dark:bg-[#321c15] text-[#db815e] dark:text-[#e89574]'
                : 'bg-[#e9f4eb] dark:bg-[#142a1d] text-[#287448] dark:text-[#4ec985]';

            const statusText =
              b.usage.status === 'over_budget'
                ? t('overBudget')
                : b.usage.status === 'near_limit'
                ? t('almostThere')
                : t('onTrack');

            return (
              <article
                key={b.id}
                className="md:col-span-6 p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] flex flex-col justify-between gap-4 tactile-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold shrink-0"
                      style={{
                        backgroundColor: `${b.category?.color || '#27694c'}18`,
                        color: b.category?.color || '#27694c',
                      }}
                    >
                      <AppIcon name={b.category?.icon || 'tag'} size={18} />
                    </span>
                    <div className="min-w-0 text-left">
                      <strong className="block text-[15px] sm:text-[16px] font-heading font-bold text-[#1a1c19] dark:text-[#eef1ec] truncate">
                        {lang === 'en' && b.category?.nameEn ? b.category.nameEn : b.category?.name}
                      </strong>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-sans font-medium ${badgeBg}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEditBudget(b)}
                      aria-label={`${t('edit')}: ${b.category?.name}`}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-[#707972] dark:text-[#a0aba2] hover:bg-[#e9f3ec] dark:hover:bg-[#1a3424] hover:text-[#27694c] dark:hover:text-[#52ba88] transition-colors"
                    >
                      <AppIcon name="edit" size={15} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDeleteBudget(b)}
                      aria-label={`${t('delete')}: ${b.category?.name}`}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-[#707972] dark:text-[#a0aba2] hover:bg-[#fff0ed] dark:hover:bg-[#381a17] hover:text-[#b84b40] dark:hover:text-[#e87063] transition-colors"
                    >
                      <AppIcon name="trash" size={15} />
                    </motion.button>
                  </div>
                </div>

                <div>
                  <div className="text-[20px] sm:text-[22px] font-heading font-extrabold tabular-nums text-[#1a1c19] dark:text-[#eef1ec] text-left">
                    {formatMoney(b.usage.spent, lang)}
                    <span className="text-[13px] font-sans font-normal text-[#606c64] dark:text-[#a0aba2]">
                      {' '}
                      / {formatMoney(b.amount, lang)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#f3f4ef] dark:bg-[#252c27] rounded-full overflow-hidden mt-3">
                    <motion.div
                      className={`h-full rounded-full ${fillClass}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, b.usage.percentage)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-2">
                    <span className="font-semibold text-left">
                      {b.usage.percentage}% {t('budgetUsed')}
                    </span>
                    <span className="tabular-nums text-right">
                      {b.usage.remaining < 0
                        ? `${formatMoney(Math.abs(b.usage.remaining), lang)} ${t('budgetExceeded')}`
                        : `${formatMoney(b.usage.remaining, lang)} ${t('budgetRemaining')}`}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-8 sm:p-12 text-center bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2]">
          <p className="font-heading font-bold text-[#1a1c19] dark:text-[#eef1ec] text-[15px] sm:text-[16px] mb-1">{t('emptyBudgets')}</p>
          <p className="max-w-xs mx-auto mb-4">{t('emptyBudgetsDesc')}</p>
          <button
            onClick={onAddBudget}
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-[12px] bg-[#27694c] hover:bg-[#174d36] text-white text-[14px] font-sans font-semibold"
          >
            <AppIcon name="plus" size={14} />
            <span>{t('addBudgetFirst')}</span>
          </button>
        </div>
      )}

      {/* Educational Hint Box */}
      <section className="bg-white border border-[#e7ebe4] rounded-[20px] p-5 shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)]">
        <div className="flex items-start gap-3 text-xs text-[#606c64]">
          <div className="text-[#27694c] mt-0.5">
            <AppIcon name="info" size={16} />
          </div>
          <div>
            <strong className="block text-xs font-bold text-[#1a1c19] mb-0.5">
              {t('budgetHint')}
            </strong>
            <p className="leading-relaxed">
              {t('budgetHint')} {t('goalDataNote')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
