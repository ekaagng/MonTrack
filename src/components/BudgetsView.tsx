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
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] sm:text-[25px] font-heading font-bold tracking-tight leading-tight text-[#171B18] dark:text-[#F0F0F0]">
          {t('navBudgets')}
        </h1>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onAddBudget}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[11px] bg-[#167C35] px-3.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#11632a] dark:bg-[#00B000] dark:text-[#131313] dark:hover:bg-[#009900] sm:px-4 sm:text-[14px]"
        >
          <AppIcon name="plus" size={15} />
          <span>{t('addBudget')}</span>
        </motion.button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <label
            htmlFor="budget-month-filter"
            className="shrink-0 text-[11px] font-medium text-[#5C665F] dark:text-[#B7C1B8] sm:text-[13px]"
          >
            {t('budgetMonth')}:
          </label>
          <select
            id="budget-month-filter"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-9 min-w-0 max-w-[190px] rounded-[10px] border border-[#E2E6DF] bg-white px-2.5 text-[12px] font-medium text-[#171B18] outline-none focus:border-[#167C35] dark:border-[#28312B] dark:bg-[#1B211D] dark:text-[#F0F0F0] dark:focus:border-[#00B000] sm:h-10 sm:px-3 sm:text-[13px]"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <span className="shrink-0 text-[10px] font-medium text-[#5C665F] dark:text-[#B7C1B8] sm:text-[12px]">
          {monthBudgets.length} {t('budgets').toLowerCase()}
        </span>
      </div>

      {/* Two-column cards on mobile; same two-card rhythm on desktop */}
      {monthBudgets.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-12 lg:gap-5">
          {monthBudgets.map((b) => {
            const fillClass =
              b.usage.status === 'over_budget'
                ? 'bg-[#B94E48] dark:bg-[#E06D67]'
                : b.usage.status === 'near_limit'
                ? 'bg-[#A4D65A]'
                : 'bg-[#167C35] dark:bg-[#00B000]';

            const badgeClass =
              b.usage.status === 'over_budget'
                ? 'border-[#F7CFCD]/60 bg-[#FDF1F0] text-[#B94E48] dark:border-[#5c2420]/40 dark:bg-[#2F1816] dark:text-[#E06D67]'
                : b.usage.status === 'near_limit'
                ? 'border-[#FAE8B4]/60 bg-[#FEF8E7] text-[#946200] dark:border-[#594416]/40 dark:bg-[#382B10] dark:text-[#F3C868]'
                : 'border-[#C8E7D1]/60 bg-[#EBF6EE] text-[#167C35] dark:border-[#00B000]/30 dark:bg-[#14291B] dark:text-[#00B000]';

            const statusText =
              b.usage.status === 'over_budget'
                ? t('overBudget')
                : b.usage.status === 'near_limit'
                ? t('almostThere')
                : t('onTrack');

            const isOverBudget = b.usage.remaining < 0;
            const remainingLabel = isOverBudget ? t('budgetExceeded') : t('budgetRemaining');
            const remainingAmount = formatMoney(Math.abs(b.usage.remaining), lang);
            const categoryName =
              lang === 'en' && b.category?.nameEn ? b.category.nameEn : b.category?.name;

            return (
              <article
                key={b.id}
                className="flex aspect-square min-w-0 min-h-0 flex-col gap-2 rounded-[14px] border border-[#E2E6DF] bg-white p-2.5 shadow-xs dark:border-[#28312B] dark:bg-[#1B211D] sm:gap-3 sm:p-4 md:col-span-6"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] sm:h-9 sm:w-9 sm:rounded-[11px]"
                    style={{
                      backgroundColor: `${b.category?.color || '#167C35'}18`,
                      color: b.category?.color || '#167C35',
                    }}
                    aria-hidden="true"
                  >
                    <AppIcon name={b.category?.icon || 'tag'} size={16} />
                  </span>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEditBudget(b)}
                      aria-label={`${t('edit')}: ${categoryName || t('budgets')}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5C665F] transition-colors hover:bg-[#EBF6EE] hover:text-[#167C35] dark:text-[#B7C1B8] dark:hover:bg-[#14291B] dark:hover:text-[#00B000] sm:h-8 sm:w-8"
                    >
                      <AppIcon name="edit" size={14} />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDeleteBudget(b)}
                      aria-label={`${t('delete')}: ${categoryName || t('budgets')}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5C665F] transition-colors hover:bg-[#FDF1F0] hover:text-[#B94E48] dark:text-[#B7C1B8] dark:hover:bg-[#2F1816] dark:hover:text-[#E06D67] sm:h-8 sm:w-8"
                    >
                      <AppIcon name="trash" size={14} />
                    </motion.button>
                  </div>
                </div>

                <div className="min-w-0">
                  <h2 className="min-h-[2.25rem] break-words text-[12px] font-heading font-bold leading-[1.25] text-[#171B18] dark:text-[#F0F0F0] sm:text-[14px]">
                    {categoryName || t('budgets')}
                  </h2>
                  <span
                    className={`mt-1 inline-flex max-w-full whitespace-normal rounded-full border px-1.5 py-0.5 text-[9px] font-semibold leading-tight sm:px-2 sm:text-[10px] ${badgeClass}`}
                  >
                    {statusText}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="text-[9px] font-medium uppercase tracking-wide text-[#5C665F] dark:text-[#B7C1B8] sm:text-[10px]">
                    {t('budgetUsed')}
                  </div>
                  <div className="mt-0.5 break-words text-[12px] font-heading font-bold leading-tight tabular-nums text-[#171B18] dark:text-[#F0F0F0] sm:text-[15px] [overflow-wrap:anywhere]">
                    {formatMoney(b.usage.spent, lang)}
                  </div>
                  <div className="mt-0.5 break-words text-[10px] leading-tight tabular-nums text-[#5C665F] dark:text-[#B7C1B8] sm:text-[11px] [overflow-wrap:anywhere]">
                    / {formatMoney(b.amount, lang)}
                  </div>
                </div>

                <div className="mt-auto min-w-0">
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-[#EBF0E8] dark:bg-[#222A25]"
                    role="progressbar"
                    aria-label={`${categoryName || t('budgets')} — ${t('budgetUsed')}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.max(0, Math.min(100, b.usage.percentage))}
                  >
                    <motion.div
                      className={`h-full rounded-full ${fillClass}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(100, b.usage.percentage))}%` }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <div className="mt-1.5 flex min-w-0 flex-col gap-0.5 text-[10px] leading-[1.35] text-[#5C665F] dark:text-[#B7C1B8] sm:text-[11px]">
                    <span className="font-semibold text-[#171B18] dark:text-[#F0F0F0]">
                      {b.usage.percentage}% {t('budgetUsed')}
                    </span>
                    <span className="break-words [overflow-wrap:anywhere]">
                      {remainingAmount} {remainingLabel}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[14px] border border-[#E2E6DF] bg-white p-8 text-center text-[#5C665F] shadow-xs dark:border-[#28312B] dark:bg-[#1B211D] dark:text-[#B7C1B8] sm:p-10">
          <p className="text-[13px]">{t('noBudgets')}</p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onAddBudget}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-[11px] bg-[#167C35] px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-[#11632a] dark:bg-[#00B000] dark:text-[#131313] dark:hover:bg-[#009900]"
          >
            <AppIcon name="plus" size={15} />
            <span>{t('addBudget')}</span>
          </motion.button>
        </div>
      )}

      <section className="flex items-start gap-2.5 rounded-[13px] border border-[#E2E6DF] bg-white p-3 text-[11px] leading-relaxed text-[#5C665F] shadow-xs dark:border-[#28312B] dark:bg-[#1B211D] dark:text-[#B7C1B8] sm:text-[12px]">
        <span className="mt-0.5 shrink-0 text-[#167C35] dark:text-[#00B000]">
          <AppIcon name="info" size={16} />
        </span>
        <div className="min-w-0">
          <strong className="mb-0.5 block text-[12px] font-semibold text-[#171B18] dark:text-[#F0F0F0]">
            {t('budgetOverview')}
          </strong>
          <span>{t('budgetHint')}</span>
        </div>
      </section>
    </div>
  );
};
