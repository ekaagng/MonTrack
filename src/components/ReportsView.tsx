import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import type { Transaction, Category, Language } from '../types/finance.ts';
import {
  todayISO,
  calculateTotals,
  formatMoney,
  formatDisplayDate,
  exportTransactionsToCsv,
} from '../lib/calculations.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface ReportsViewProps {
  transactions: Transaction[];
  categories: Category[];
  lang: Language;
  onNavigateTransactions: () => void;
  onShowToast: (title: string, detail?: string, kind?: 'success' | 'error') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  categories,
  lang,
  onNavigateTransactions,
  onShowToast,
}) => {
  const t = (k: string) => getTranslation(k, lang);
  const [range, setRange] = useState<'month' | 'previous' | 'last30' | 'all'>('month');

  const categoryMap = useMemo(
    () => new Map<string, Category>(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    if (range === 'all') return transactions;

    if (range === 'last30') {
      const threshold = new Date(now);
      threshold.setDate(threshold.getDate() - 29);
      const iso = `${threshold.getFullYear()}-${String(threshold.getMonth() + 1).padStart(2, '0')}-${String(
        threshold.getDate()
      ).padStart(2, '0')}`;
      return transactions.filter((tx) => tx.date >= iso && tx.date <= todayISO());
    }

    let date = new Date(now.getFullYear(), now.getMonth(), 1);
    if (range === 'previous') {
      date = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return transactions.filter((tx) => tx.date && tx.date.startsWith(month));
  }, [transactions, range]);

  const totals = useMemo(() => calculateTotals(filtered), [filtered]);

  const categoryBreakdown = useMemo(() => {
    const expenses = filtered.filter((tx) => tx.type === 'expense');
    const map = new Map<string, number>();
    for (const tx of expenses) {
      map.set(tx.categoryId, (map.get(tx.categoryId) || 0) + tx.amount);
    }
    return Array.from(map.entries())
      .map(([catId, amount]) => ({
        category: categoryMap.get(catId),
        amount,
      }))
      .filter((v) => v.category && v.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [filtered, categoryMap]);

  const maxExpenseCategory = Math.max(1, ...categoryBreakdown.map((c) => c.amount));

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      onShowToast(t('exportEmpty'), undefined, 'error');
      return;
    }

    const headers = {
      date: t('dateHeader'),
      type: t('type'),
      category: t('category'),
      note: t('note'),
      amount: t('amountHeader'),
      incomeType: t('incomeType'),
      expenseType: t('expenseType'),
    };

    const csvContent = exportTransactionsToCsv(filtered, categories, headers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `money-tracker-${range}-${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    onShowToast(t('exportDone'));
  };

  const rangeLabel = {
    month: t('monthOption'),
    previous: t('lastMonthOption'),
    last30: t('last30Option'),
    all: t('allTimeOption'),
  }[range];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#27694c] dark:text-[#52ba88] mb-1.5 text-left">
            <span className="w-4 h-0.5 bg-[#27694c] dark:bg-[#52ba88] rounded-full" />
            <span>{t('navReports')}</span>
          </div>
          <h1 className="text-[22px] sm:text-[26px] font-heading font-black tracking-[-0.02em] leading-[1.25] text-[#1a1c19] dark:text-[#eef1ec] text-left">
            {t('navReports')}
          </h1>
          <p className="mt-1 text-[13px] sm:text-[14px] font-sans text-[#606c64] dark:text-[#a0aba2] leading-[1.45] text-left">
            {t('reportsIntro')}
          </p>
        </div>
        {/* Outlined Tertiary Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-[12px] border border-[#e7ebe4] dark:border-[#2a342c] bg-white dark:bg-[#181c19] hover:bg-[#f9faf5] dark:hover:bg-[#232924] text-[14px] font-sans font-semibold text-[#1a1c19] dark:text-[#f0f4f0] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] transition-all shrink-0"
        >
          <AppIcon name="download" size={16} />
          <span>{t('exportCsv')}</span>
        </motion.button>
      </div>

      {/* Toolbar / Range Filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="report-range" className="text-[12px] sm:text-[13px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2]">
            {t('reportPeriod')}:
          </label>
          <select
            id="report-range"
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="h-11 px-3.5 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-[13px] font-sans font-medium text-[#404943] focus:border-[#27694c] outline-none"
          >
            <option value="month">{t('monthOption')}</option>
            <option value="previous">{t('lastMonthOption')}</option>
            <option value="last30">{t('last30Option')}</option>
            <option value="all">{t('allTimeOption')}</option>
          </select>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#f3f4ef] dark:bg-[#252c27] text-[#404943] dark:text-[#c4cec6] text-[11px] font-sans font-semibold">
          {rangeLabel}
        </span>
      </div>

      {/* 3 KPI Summary Cards: 12-col Desktop / 4-col Mobile Grid */}
      <div className="grid grid-cols-4 md:grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
        <div className="col-span-2 md:col-span-4 p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] flex flex-col justify-between">
          <label className="text-[12px] sm:text-[13px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2] text-left block">{t('income')}</label>
          <div className="text-[20px] sm:text-[24px] font-heading font-extrabold tabular-nums tracking-[-0.02em] text-[#1a1c19] dark:text-[#eef1ec] mt-2 truncate text-left">
            {formatMoney(totals.income, lang)}
          </div>
          <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-1 block text-left">
            {filtered.filter((tx) => tx.type === 'income').length} {t('records')}
          </span>
        </div>

        <div className="col-span-2 md:col-span-4 p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] flex flex-col justify-between">
          <label className="text-[12px] sm:text-[13px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2] text-left block">{t('expenses')}</label>
          <div className="text-[20px] sm:text-[24px] font-heading font-extrabold tabular-nums tracking-[-0.02em] text-[#1a1c19] dark:text-[#eef1ec] mt-2 truncate text-left">
            {formatMoney(totals.expenses, lang)}
          </div>
          <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-1 block text-left">
            {filtered.filter((tx) => tx.type === 'expense').length} {t('records')}
          </span>
        </div>

        <div className="col-span-4 md:col-span-4 p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] flex flex-col justify-between">
          <label className="text-[12px] sm:text-[13px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2] text-left block">{t('net')}</label>
          <div
            className={`text-[20px] sm:text-[24px] font-heading font-black tabular-nums tracking-[-0.02em] mt-2 truncate text-left ${
              totals.net > 0 ? 'text-[#287448] dark:text-[#4ec985]' : totals.net < 0 ? 'text-[#ba1a1a] dark:text-[#e87063]' : 'text-[#1a1c19] dark:text-[#eef1ec]'
            }`}
          >
            {totals.net < 0 ? '−' : ''}
            {formatMoney(Math.abs(totals.net), lang)}
          </div>
          <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-1 block text-left">
            {t('totalTransactions')}: {filtered.length}
          </span>
        </div>
      </div>

      {/* 2-Column Split: Spending by Category & Transaction Summary (12-col Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Category Breakdown */}
        <section className="lg:col-span-7 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 md:p-6 shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)]">
          <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left mb-1">
            {t('spendingByCategory')}
          </h2>
          <p className="text-[12px] sm:text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2] mb-4 text-left">{t('spendingSub')}</p>

          <div className="space-y-4">
            {categoryBreakdown.length > 0 ? (
              categoryBreakdown.map(({ category, amount }) => {
                const pct = totals.expenses > 0 ? Math.round((amount / totals.expenses) * 100) : 0;
                return (
                  <div key={category?.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: category?.color }}
                        />
                        <span className="text-[14px] font-sans font-semibold text-[#1a1c19] dark:text-[#eef1ec] text-left">
                          {lang === 'en' && category?.nameEn ? category.nameEn : category?.name}
                        </span>
                      </div>
                      <div className="tabular-nums font-heading font-bold text-[14px] text-[#1a1c19] dark:text-[#eef1ec] text-right">
                        {formatMoney(amount, lang)}{' '}
                        <span className="text-[11px] font-sans font-normal text-[#606c64] dark:text-[#a0aba2]">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#f3f4ef] dark:bg-[#232924] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (amount / maxExpenseCategory) * 100)}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          backgroundColor: category?.color || '#27694c',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2]">
                <p>{t('noSpending')}</p>
                <p className="mt-1">{t('noSpendingDesc')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Transaction Summary */}
        <section className="lg:col-span-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 md:p-6 shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">
                  {t('transactionSummary')}
                </h2>
                <p className="text-[12px] sm:text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-0.5 text-left">
                  {filtered.length} {t('records')}
                </p>
              </div>
              <button
                onClick={onNavigateTransactions}
                className="text-[13px] font-sans font-semibold text-[#27694c] dark:text-[#52ba88] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>{t('viewAll')}</span>
                <AppIcon name="arrowRight" size={12} />
              </button>
            </div>

            <div className="divide-y divide-[#e7ebe4] dark:divide-[#2a342c]">
              {filtered.slice(0, 6).map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="py-2.5 sm:py-3 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2 text-left">
                      <strong className="block text-[14px] font-sans font-semibold text-[#1a1c19] dark:text-[#eef1ec] truncate">
                        {tx.note || (lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name)}
                      </strong>
                      <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] block mt-0.5">
                        {formatDisplayDate(tx.date, lang, { day: 'numeric', month: 'short' })} ·{' '}
                        {lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name}
                      </span>
                    </div>
                    <span
                      className={`tabular-nums font-heading font-bold text-[14px] text-right shrink-0 ${
                        isIncome ? 'text-[#287448] dark:text-[#4ec985]' : 'text-[#1a1c19] dark:text-[#eef1ec]'
                      }`}
                    >
                      {isIncome ? '+' : '−'}
                      {formatMoney(tx.amount, lang)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-[#e7ebe4] dark:border-[#2a342c] flex items-center justify-between text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2]">
            <span>{rangeLabel}</span>
            <button
              onClick={onNavigateTransactions}
              className="text-[13px] font-sans font-semibold text-[#27694c] dark:text-[#52ba88] hover:underline flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <AppIcon name="arrowRight" size={12} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
