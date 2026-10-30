import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import type { Budget, Category, Transaction, Language } from '../types/finance.ts';
import {
  currentMonth,
  monthLabel,
  calculateBudgetUsage,
  formatMoney,
} from '../lib/calculations.ts';
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
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-[22px] sm:text-[26px] font-heading font-bold tracking-tight leading-[1.25] text-[#171B18] dark:text-[#F0F0F0] text-left">
          {t('navBudgets')}
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddBudget}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] text-[14px] font-sans font-semibold leading-none shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <AppIcon name="plus" size={16} />
          <span>{t('addBudget')}</span>
        </motion.button>
      </div>

      {/* Toolbar / Month Filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="budget-month-filter" className="text-[12px] sm:text-[13px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8]">
            {t('budgetMonth')}:
          </label>
          <select
            id="budget-month-filter"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-11 px-3.5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] outline-none cursor-pointer"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[12px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8]">
          {monthBudgets.length} {t('budgets').toLowerCase()}
        </span>
      </div>

      {/* Budget Cards Grid (12-col Desktop Grid / 16px Mobile Padding) */}
      {monthBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
          {monthBudgets.map((b) => {
            const fillClass =
              b.usage.status === 'over_budget'
                ? 'bg-[#B94E48] dark:bg-[#E06D67]'
                : b.usage.status === 'near_limit'
                ? 'bg-[#A4D65A] dark:bg-[#A4D65A]'
                : 'bg-[#167C35] dark:bg-[#00B000]';

            const badgeBg =
              b.usage.status === 'over_budget'
                ? 'bg-[#FDF1F0] dark:bg-[#2F1816] text-[#B94E48] dark:text-[#E06D67] border border-[#F7CFCD]/60 dark:border-[#5c2420]/40'
                : b.usage.status === 'near_limit'
                ? 'bg-[#FEF8E7] dark:bg-[#382B10] text-[#946200] dark:text-[#F3C868] border border-[#FAE8B4]/60 dark:border-[#594416]/40'
                : 'bg-[#EBF6EE] dark:bg-[#14291B] text-[#167C35] dark:text-[#00B000] border border-[#C8E7D1]/60 dark:border-[#00B000]/30';

            const statusText =
              b.usage.status === 'over_budget'
                ? t('overBudget')
                : b.usage.status === 'near_limit'
                ? t('almostThere')
                : t('onTrack');

            return (
              <article
                key={b.id}
                className="md:col-span-6 p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex flex-col justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold shrink-0"
                      style={{
                        backgroundColor: `${b.category?.color || '#167C35'}18`,
                        color: b.category?.color || '#167C35',
                      }}
                    >
                      <AppIcon name={b.category?.icon || 'tag'} size={18} />
                    </span>
                    <div className="min-w-0 text-left">
                      <strong className="block text-[15px] sm:text-[16px] font-heading font-semibold text-[#171B18] dark:text-[#F0F0F0] truncate text-left">
                        {lang === 'en' && b.category?.nameEn ? b.category.nameEn : b.category?.name}
                      </strong>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold ${badgeBg}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEditBudget(b)}
                      aria-label={`${t('edit')}: ${b.category?.name}`}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#EBF6EE] dark:hover:bg-[#14291B] hover:text-[#167C35] dark:hover:text-[#00B000] transition-colors cursor-pointer"
                    >
                      <AppIcon name="edit" size={15} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDeleteBudget(b)}
                      aria-label={`${t('delete')}: ${b.category?.name}`}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#FDF1F0] dark:hover:bg-[#2F1816] hover:text-[#B94E48] dark:hover:text-[#E06D67] transition-colors cursor-pointer"
                    >
                      <AppIcon name="trash" size={15} />
                    </motion.button>
                  </div>
                </div>

                <div>
                  <div className="text-[20px] sm:text-[22px] font-heading font-bold tabular-nums text-[#171B18] dark:text-[#F0F0F0] text-left">
                    {formatMoney(b.usage.spent, lang)}
                    <span className="text-[13px] font-sans font-normal text-[#5C665F] dark:text-[#B7C1B8]">
                      {' '}
                      / {formatMoney(b.amount, lang)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#EBF0E8] dark:bg-[#222A25] rounded-full overflow-hidden mt-3">
                    <motion.div
                      className={`h-full rounded-full ${fillClass}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, b.usage.percentage)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-2">
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
        <div className="p-12 text-center bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] text-[#5C665F] dark:text-[#B7C1B8] shadow-xs">
          <p className="text-[14px] font-sans">{t('noBudgets')}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onAddBudget}
            className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] text-[14px] font-sans font-semibold cursor-pointer shadow-sm"
          >
            <AppIcon name="plus" size={16} />
            <span>{t('addBudget')}</span>
          </motion.button>
        </div>
      )}

      {/* Educational Hint Box */}
      <section className="p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex items-center gap-3 text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] shadow-xs">
        <div className="text-[#167C35] dark:text-[#00B000] shrink-0">
          <AppIcon name="info" size={18} />
        </div>
        <div className="text-left">
          <strong className="block text-[13px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] mb-0.5">{t('budgetOverview')}</strong>
          <span>{t('budgetHint')}</span>
        </div>
      </section>
    </div>
  );
};
