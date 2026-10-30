import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import type { Transaction, Category, Language } from '../types/finance.ts';
import {
  currentMonth,
  calculateTotals,
  formatMoney,
  formatDisplayDate,
  exportTransactionsToCsv,
  todayISO,
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

  const filtered = useMemo(() => {
    const now = new Date();
    const currM = currentMonth();

    if (range === 'month') {
      return transactions.filter((tx) => tx.date && tx.date.startsWith(currM));
    }
    if (range === 'previous') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevM = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
      return transactions.filter((tx) => tx.date && tx.date.startsWith(prevM));
    }
    if (range === 'last30') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(cutoff.getDate()).padStart(2, '0')}`;
      return transactions.filter((tx) => tx.date && tx.date >= cutoffStr);
    }
    return [...transactions];
  }, [transactions, range]);

  const totals = useMemo(() => calculateTotals(filtered), [filtered]);

  const categoryMap = useMemo(
    () => new Map<string, Category>(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Spending by category breakdown
  const categoryBreakdown = useMemo(() => {
    const expenses = filtered.filter((tx) => tx.type === 'expense');
    const map = new Map<string, number>();
    for (const tx of expenses) {
      map.set(tx.categoryId, (map.get(tx.categoryId) || 0) + tx.amount);
    }
    return Array.from(map.entries())
      .map(([id, amount]) => ({
        category: categoryMap.get(id),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered, categoryMap]);

  const maxExpenseCategory = Math.max(1, ...categoryBreakdown.map((c) => c.amount));

  const handleExportCsv = () => {
    const headers = {
      date: t('date'),
      category: t('category'),
      type: t('type'),
      amount: t('amount'),
      note: t('noteOptional'),
      incomeType: t('incomeType'),
      expenseType: t('expenseType'),
    };

    const csvContent = exportTransactionsToCsv(filtered, categories, headers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `montrack-${range}-${todayISO()}.csv`;
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
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-[22px] sm:text-[26px] font-heading font-bold tracking-tight leading-[1.25] text-[#171B18] dark:text-[#F0F0F0] text-left">
          {t('navReports')}
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] border border-[#E2E6DF] dark:border-[#28312B] bg-white dark:bg-[#1B211D] hover:bg-[#EBF0E8] dark:hover:bg-[#222A25] text-[14px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] transition-all shrink-0 cursor-pointer shadow-xs"
        >
          <AppIcon name="download" size={16} />
          <span>{t('exportCsv')}</span>
        </motion.button>
      </div>

      {/* Toolbar / Range Filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="report-range" className="text-[12px] sm:text-[13px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8]">
            {t('reportPeriod')}:
          </label>
          <select
            id="report-range"
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="h-11 px-3.5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[13px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] outline-none cursor-pointer"
          >
            <option value="month">{t('monthOption')}</option>
            <option value="previous">{t('lastMonthOption')}</option>
            <option value="last30">{t('last30Option')}</option>
            <option value="all">{t('allTimeOption')}</option>
          </select>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#EBF0E8] dark:bg-[#222A25] text-[#171B18] dark:text-[#F0F0F0] text-[11px] font-sans font-semibold border border-[#E2E6DF] dark:border-[#28312B]">
          {rangeLabel}
        </span>
      </div>

      {/* 3 KPI Summary Cards: 12-col Desktop / 4-col Mobile Grid */}
      <div className="grid grid-cols-4 md:grid-cols-12 gap-4 lg:gap-5">
        <div className="col-span-2 md:col-span-4 p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex flex-col justify-between shadow-xs">
          <label className="text-[12px] sm:text-[13px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8] text-left block">{t('income')}</label>
          <div className="text-[20px] sm:text-[24px] font-heading font-bold tabular-nums tracking-tight text-[#167C35] dark:text-[#00B000] mt-2 truncate text-left">
            {formatMoney(totals.income, lang)}
          </div>
          <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-1 block text-left">
            {filtered.filter((tx) => tx.type === 'income').length} {t('records')}
          </span>
        </div>

        <div className="col-span-2 md:col-span-4 p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex flex-col justify-between shadow-xs">
          <label className="text-[12px] sm:text-[13px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8] text-left block">{t('expenses')}</label>
          <div className="text-[20px] sm:text-[24px] font-heading font-bold tabular-nums tracking-tight text-[#B94E48] dark:text-[#E06D67] mt-2 truncate text-left">
            {formatMoney(totals.expenses, lang)}
          </div>
          <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-1 block text-left">
            {filtered.filter((tx) => tx.type === 'expense').length} {t('records')}
          </span>
        </div>

        <div className="col-span-4 md:col-span-4 p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex flex-col justify-between shadow-xs">
          <label className="text-[12px] sm:text-[13px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8] text-left block">{t('net')}</label>
          <div
            className={`text-[20px] sm:text-[24px] font-heading font-bold tabular-nums tracking-tight mt-2 truncate text-left ${
              totals.net > 0 ? 'text-[#167C35] dark:text-[#00B000]' : totals.net < 0 ? 'text-[#B94E48] dark:text-[#E06D67]' : 'text-[#171B18] dark:text-[#F0F0F0]'
            }`}
          >
            {totals.net < 0 ? '−' : ''}
            {formatMoney(Math.abs(totals.net), lang)}
          </div>
          <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-1 block text-left">
            {t('totalTransactions')}: {filtered.length}
          </span>
        </div>
      </div>

      {/* 2-Column Split: Spending by Category & Transaction Summary (12-col Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Category Breakdown */}
        <section className="lg:col-span-7 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] p-4 sm:p-5 md:p-6 shadow-xs">
          <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-tight leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left mb-1">
            {t('spendingByCategory')}
          </h2>
          <p className="text-[12px] sm:text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mb-4 text-left">{t('spendingSub')}</p>

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
                          style={{ backgroundColor: category?.color || '#167C35' }}
                        />
                        <span className="text-[14px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] text-left">
                          {lang === 'en' && category?.nameEn ? category.nameEn : category?.name}
                        </span>
                      </div>
                      <div className="tabular-nums font-heading font-bold text-[14px] text-[#171B18] dark:text-[#F0F0F0] text-right">
                        {formatMoney(amount, lang)}{' '}
                        <span className="text-[12px] font-sans font-normal text-[#5C665F] dark:text-[#B7C1B8]">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#EBF0E8] dark:bg-[#222A25] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (amount / maxExpenseCategory) * 100)}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          backgroundColor: category?.color || '#167C35',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8]">
                <p>{t('noSpending')}</p>
                <p className="mt-1">{t('noSpendingDesc')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Transaction Summary */}
        <section className="lg:col-span-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] p-4 sm:p-5 md:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-tight leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
                  {t('transactionSummary')}
                </h2>
                <p className="text-[12px] sm:text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 text-left">
                  {filtered.length} {t('records')}
                </p>
              </div>
              <button
                onClick={onNavigateTransactions}
                className="text-[14px] font-sans font-semibold text-[#167C35] dark:text-[#00B000] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>{t('viewAll')}</span>
                <AppIcon name="arrowRight" size={12} />
              </button>
            </div>

            <div className="divide-y divide-[#E2E6DF] dark:divide-[#28312B]">
              {filtered.slice(0, 6).map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="py-2.5 sm:py-3 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 pr-2 text-left">
                      <strong className="block text-[14px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] truncate text-left">
                        {tx.note || (lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name)}
                      </strong>
                      <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] block mt-0.5 text-left">
                        {formatDisplayDate(tx.date, lang, { day: 'numeric', month: 'short' })} ·{' '}
                        {lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name}
                      </span>
                    </div>
                    <span
                      className={`tabular-nums font-heading font-bold text-[14px] text-right shrink-0 ${
                        isIncome ? 'text-[#167C35] dark:text-[#00B000]' : 'text-[#B94E48] dark:text-[#E06D67]'
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

          <div className="pt-3 mt-4 border-t border-[#E2E6DF] dark:border-[#28312B] flex items-center justify-between text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8]">
            <span>{rangeLabel}</span>
            <button
              onClick={onNavigateTransactions}
              className="text-[13px] font-sans font-semibold text-[#167C35] dark:text-[#00B000] hover:underline flex items-center gap-1 cursor-pointer"
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
