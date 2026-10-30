import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { AppState, Language, PageId } from '../types/finance.ts';
import {
  currentMonth,
  monthLabel,
  calculateTotals,
  calculateBudgetUsage,
  calculateGoalProgress,
  chartWeeklyData,
  formatMoney,
  formatDisplayDate,
} from '../lib/calculations.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface DashboardViewProps {
  state: AppState;
  lang: Language;
  onNavigate: (page: PageId) => void;
  onAddTransaction: () => void;
  onAddBudget: () => void;
  onAddGoal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  lang,
  onNavigate,
  onAddTransaction,
  onAddBudget,
  onAddGoal,
}) => {
  const t = (k: string) => getTranslation(k, lang);
  const m = currentMonth();

  // Transactions this month
  const monthTx = useMemo(
    () => state.transactions.filter((tx) => tx.date && tx.date.startsWith(m)),
    [state.transactions, m]
  );

  const totals = useMemo(() => calculateTotals(monthTx), [monthTx]);

  // Categories map
  const categoryMap = useMemo(
    () => new Map(state.categories.map((c) => [c.id, c])),
    [state.categories]
  );

  // Active budgets
  const activeBudgets = useMemo(() => {
    return state.budgets
      .filter((b) => b.month === m)
      .map((b) => ({
        ...b,
        category: categoryMap.get(b.categoryId),
        usage: calculateBudgetUsage(b, state.transactions),
      }))
      .slice(0, 3);
  }, [state.budgets, state.transactions, m, categoryMap]);

  // Goals
  const topGoal = state.goals[0];
  const goalProgress = topGoal
    ? calculateGoalProgress(topGoal, state.goalContributions)
    : null;

  // Recent transactions (last 5)
  const recentTx = useMemo(() => {
    return [...state.transactions]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [state.transactions]);

  // Chart data
  const weeklyData = chartWeeklyData(state.transactions, m);
  const maxWeeklyAmount = Math.max(1, ...weeklyData.flatMap((w) => [w.income, w.expenses]));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-[22px] sm:text-[26px] font-heading font-bold tracking-tight leading-[1.25] text-[#171B18] dark:text-[#F0F0F0] text-left">
          {t('navDashboard')}
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddTransaction}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] text-[14px] font-sans font-semibold leading-none shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <AppIcon name="plus" size={16} />
          <span>{t('addTransaction')}</span>
        </motion.button>
      </div>

      {/* Quick Access Cards: 12-col Desktop / 4-col Mobile Grid */}
      <div className="grid grid-cols-4 md:grid-cols-12 gap-4 lg:gap-5">
        {/* Goal Quick Access */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('goals')}
          className="col-span-4 md:col-span-6 flex items-center gap-3.5 p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] text-left hover:border-[#167C35]/40 dark:hover:border-[#00B000]/40 transition-all group cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-[12px] bg-[#EBF6EE] dark:bg-[#14291B] text-[#167C35] dark:text-[#A4D65A] shrink-0 border border-[#C8E7D1]/50 dark:border-[#00B000]/20">
            <AppIcon name="target" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-sans font-bold text-[#5C665F] dark:text-[#B7C1B8] uppercase tracking-wider text-left">
              {t('navGoals')}
            </span>
            <strong className="block text-[15px] sm:text-[16px] font-heading font-semibold text-[#171B18] dark:text-[#F0F0F0] truncate text-left mt-0.5 leading-[1.3]">
              {topGoal ? topGoal.name : t('manageGoals')}
            </strong>
            <span className="block text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] truncate mt-1 text-left leading-[1.35]">
              {topGoal && goalProgress
                ? `${goalProgress.percentage}% ${t('goalProgress').toLowerCase()} · ${formatMoney(
                    goalProgress.currentSaved,
                    lang
                  )}`
                : t('quickGoalsEmpty')}
            </span>
            {topGoal && goalProgress && (
              <div className="w-full h-1.5 bg-[#EBF0E8] dark:bg-[#222A25] rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#167C35] to-[#A4D65A] dark:from-[#00B000] dark:to-[#A4D65A] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgress.percentage}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            )}
          </div>
          <div className="text-[#5C665F] dark:text-[#B7C1B8] group-hover:translate-x-1 transition-transform shrink-0">
            <AppIcon name="arrowRight" size={16} />
          </div>
        </motion.button>

        {/* Monthly Report Quick Access */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('reports')}
          className="col-span-4 md:col-span-6 flex items-center gap-3.5 p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] text-left hover:border-[#167C35]/40 dark:hover:border-[#00B000]/40 transition-all group cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-[12px] bg-[#EBF6EE] dark:bg-[#14291B] text-[#167C35] dark:text-[#A4D65A] shrink-0 border border-[#C8E7D1]/50 dark:border-[#00B000]/20">
            <AppIcon name="chart" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-sans font-bold text-[#5C665F] dark:text-[#B7C1B8] uppercase tracking-wider text-left">
              {t('quickAnalysisTitle')}
            </span>
            <strong
              className={`block text-[15px] sm:text-[16px] font-heading font-semibold tabular-nums tracking-tight mt-0.5 text-left leading-[1.3] ${
                totals.net > 0
                  ? 'text-[#167C35] dark:text-[#00B000]'
                  : totals.net < 0
                  ? 'text-[#B94E48] dark:text-[#E06D67]'
                  : 'text-[#171B18] dark:text-[#F0F0F0]'
              }`}
            >
              {totals.net < 0 ? '−' : ''}
              {formatMoney(Math.abs(totals.net), lang)}
            </strong>
            <span className="block text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] truncate mt-1 text-left leading-[1.35]">
              {monthTx.length} {t('quickTransactions')} · {monthLabel(m, lang)}
            </span>
          </div>
          <div className="text-[#5C665F] dark:text-[#B7C1B8] group-hover:translate-x-1 transition-transform shrink-0">
            <AppIcon name="arrowRight" size={16} />
          </div>
        </motion.button>
      </div>

      {/* 3 KPI Metric Cards: Hero Net Flow + Income + Expenses */}
      <div className="grid grid-cols-4 md:grid-cols-12 gap-4 lg:gap-5">
        {/* Net Flow / Hero Main Balance */}
        <div className="col-span-4 md:col-span-6 p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-left">
            <div>
              <span className="block text-[12px] sm:text-[13px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8]">
                {t('netCashflow')}
              </span>
              <span className="block text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5">
                {monthLabel(m, lang)}
              </span>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#EBF6EE] dark:bg-[#14291B] text-[#167C35] dark:text-[#A4D65A] shrink-0 border border-[#C8E7D1]/50 dark:border-[#00B000]/20">
              <AppIcon name="chart" size={18} />
            </div>
          </div>
          <div
            className={`text-[28px] sm:text-[34px] font-heading font-bold tabular-nums tracking-tight leading-[1.2] mt-3 truncate text-left ${
              totals.net > 0
                ? 'text-[#167C35] dark:text-[#00B000]'
                : totals.net < 0
                ? 'text-[#B94E48] dark:text-[#E06D67]'
                : 'text-[#171B18] dark:text-[#F0F0F0]'
            }`}
          >
            {totals.net < 0 ? '−' : ''}
            {formatMoney(Math.abs(totals.net), lang)}
          </div>
          <div className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-2 flex items-center gap-1.5 text-left">
            {totals.net > 0 ? (
              <span className="text-[#167C35] dark:text-[#00B000] font-semibold flex items-center gap-1">
                <AppIcon name="arrowRight" size={12} /> {t('positiveFlow')}
              </span>
            ) : totals.net < 0 ? (
              <span className="text-[#B94E48] dark:text-[#E06D67] font-semibold flex items-center gap-1">
                <AppIcon name="arrowRight" size={12} /> {t('negativeFlow')}
              </span>
            ) : (
              <span>{t('noFlow')}</span>
            )}
          </div>
        </div>

        {/* Income Card */}
        <div className="col-span-2 md:col-span-3 p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-left">
            <span className="text-[12px] sm:text-[13px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8] truncate">
              {t('income')}
            </span>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#EBF6EE] dark:bg-[#14291B] text-[#167C35] dark:text-[#00B000] shrink-0 border border-[#C8E7D1]/50 dark:border-[#00B000]/20">
              <AppIcon name="income" size={16} />
            </div>
          </div>
          <div className="text-[20px] sm:text-[22px] font-heading font-bold tabular-nums tracking-tight leading-tight text-[#167C35] dark:text-[#00B000] mt-3 truncate text-left">
            {formatMoney(totals.income, lang)}
          </div>
          <div className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-2 flex items-center gap-1 text-left truncate">
            <span>{t('fromRecords')}</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="col-span-2 md:col-span-3 p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-left">
            <span className="text-[12px] sm:text-[13px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8] truncate">
              {t('expenses')}
            </span>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FDF1F0] dark:bg-[#2F1816] text-[#B94E48] dark:text-[#E06D67] shrink-0 border border-[#F7CFCD]/60 dark:border-[#5c2420]/40">
              <AppIcon name="expense" size={16} />
            </div>
          </div>
          <div className="text-[20px] sm:text-[22px] font-heading font-bold tabular-nums tracking-tight leading-tight text-[#B94E48] dark:text-[#E06D67] mt-3 truncate text-left">
            {formatMoney(totals.expenses, lang)}
          </div>
          <div className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-2 flex items-center gap-1 text-left truncate">
            <span>{t('fromRecords')}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Cash Flow Trend & Category Budgets (12-col Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Trend Bar Chart */}
        <section className="lg:col-span-7 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] p-4 sm:p-5 md:p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-tight leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
                {t('cashflowTrend')}
              </h2>
              <p className="text-[12px] sm:text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 text-left">{t('cashflowSub')}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#EBF0E8] dark:bg-[#222A25] text-[#171B18] dark:text-[#F0F0F0] text-[11px] font-sans font-semibold border border-[#E2E6DF] dark:border-[#28312B]">
              {monthLabel(m, lang)}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1" role="img" aria-label={t('cashflowSub')}>
            {weeklyData.map((week, idx) => {
              const incHeight = maxWeeklyAmount > 0 ? Math.max(week.income ? 4 : 0, (week.income / maxWeeklyAmount) * 100) : 0;
              const expHeight = maxWeeklyAmount > 0 ? Math.max(week.expenses ? 4 : 0, (week.expenses / maxWeeklyAmount) * 100) : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                  <div className="w-full max-w-[36px] flex items-end justify-center gap-1.5 h-[calc(100%-20px)] border-b border-[#E2E6DF] dark:border-[#28312B]">
                    <div
                      className="w-2.5 rounded-t bg-[#167C35] dark:bg-[#00B000] transition-all duration-300"
                      style={{ height: `${incHeight}%` }}
                      title={`${t('incomeLegend')}: ${formatMoney(week.income, lang)}`}
                    />
                    <div
                      className="w-2.5 rounded-t bg-[#B94E48] dark:bg-[#E06D67] transition-all duration-300"
                      style={{ height: `${expHeight}%` }}
                      title={`${t('expenseLegend')}: ${formatMoney(week.expenses, lang)}`}
                    />
                  </div>
                  <span className="text-[11px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8]">{week.label}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E2E6DF] dark:border-[#28312B] text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#167C35] dark:bg-[#00B000]" />
              <span className="font-medium text-[#171B18] dark:text-[#F0F0F0]">{t('incomeLegend')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B94E48] dark:bg-[#E06D67]" />
              <span className="font-medium text-[#171B18] dark:text-[#F0F0F0]">{t('expenseLegend')}</span>
            </span>
          </div>
        </section>

        {/* Budget Overview Mini List */}
        <section className="lg:col-span-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] p-4 sm:p-5 md:p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-tight leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
                {t('budgetOverview')}
              </h2>
              <p className="text-[12px] sm:text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 text-left">{t('budgetSub')}</p>
            </div>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-[14px] font-sans font-semibold text-[#167C35] dark:text-[#00B000] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>{t('viewAll')}</span>
              <AppIcon name="arrowRight" size={12} />
            </button>
          </div>

          <div className="space-y-4">
            {activeBudgets.length > 0 ? (
              activeBudgets.map((b) => {
                const fillClass =
                  b.usage.status === 'over_budget'
                    ? 'bg-[#B94E48] dark:bg-[#E06D67]'
                    : b.usage.status === 'near_limit'
                    ? 'bg-[#A4D65A] dark:bg-[#A4D65A]'
                    : 'bg-[#167C35] dark:bg-[#00B000]';
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: `${b.category?.color || '#167C35'}18`,
                            color: b.category?.color || '#167C35',
                          }}
                        >
                          <AppIcon name={b.category?.icon || 'tag'} size={14} />
                        </span>
                        <strong className="text-[14px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] truncate text-left">
                          {lang === 'en' && b.category?.nameEn ? b.category.nameEn : b.category?.name}
                        </strong>
                      </div>
                      <span className="tabular-nums font-heading font-bold text-[13px] text-[#171B18] dark:text-[#F0F0F0] shrink-0 text-right">
                        {b.usage.percentage}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#EBF0E8] dark:bg-[#222A25] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${fillClass}`}
                        style={{ width: `${Math.min(100, b.usage.percentage)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8]">
                      <span className="text-left">{formatMoney(b.usage.spent, lang)}</span>
                      <span className="text-right tabular-nums">
                        {b.usage.remaining < 0
                          ? t('budgetExceeded')
                          : `${formatMoney(b.usage.remaining, lang)} ${t('budgetRemaining')}`}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8]">
                <p>{t('noBudgets')}</p>
                <button
                  onClick={onAddBudget}
                  className="mt-2 text-[14px] font-sans font-semibold text-[#167C35] dark:text-[#00B000] hover:underline cursor-pointer"
                >
                  {t('addBudgetFirst')}
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 mt-4 border-t border-[#E2E6DF] dark:border-[#28312B] flex items-center justify-between text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8]">
            <span>{activeBudgets.length} {t('budgets').toLowerCase()}</span>
            <button
              onClick={onAddBudget}
              className="text-[13px] font-sans font-semibold text-[#167C35] dark:text-[#00B000] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('addBudget')}</span>
              <AppIcon name="plus" size={12} />
            </button>
          </div>
        </section>
      </div>

      {/* Recent Transactions Feed */}
      <section className="bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] p-4 sm:p-5 md:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-tight leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
              {t('recentTransactions')}
            </h2>
            <p className="text-[12px] sm:text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 text-left">{t('recentSub')}</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-[14px] font-sans font-semibold text-[#167C35] dark:text-[#00B000] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>{t('viewTransactions')}</span>
            <AppIcon name="arrowRight" size={12} />
          </button>
        </div>

        <div className="divide-y divide-[#E2E6DF] dark:divide-[#28312B]">
          {recentTx.length > 0 ? (
            recentTx.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              const isIncome = tx.type === 'income';
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                      style={{
                        backgroundColor: `${cat?.color || '#167C35'}18`,
                        color: cat?.color || '#167C35',
                      }}
                    >
                      <AppIcon name={cat?.icon || 'tag'} size={18} />
                    </div>
                    <div className="min-w-0 text-left">
                      <strong className="block text-[14px] sm:text-[15px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] truncate text-left">
                        {tx.note || (lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name) || t('transactions')}
                      </strong>
                      <span className="block text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] truncate mt-0.5 text-left">
                        {lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name} · {formatDisplayDate(tx.date, lang, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`tabular-nums font-heading font-bold text-[14px] sm:text-[15px] text-right shrink-0 ${
                      isIncome ? 'text-[#167C35] dark:text-[#00B000]' : 'text-[#B94E48] dark:text-[#E06D67]'
                    }`}
                  >
                    {isIncome ? '+' : '−'}
                    {formatMoney(tx.amount, lang)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8]">
              <p>{t('emptyTransactions')}</p>
              <button
                onClick={onAddTransaction}
                className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-sans font-semibold text-[#167C35] dark:text-[#00B000] hover:underline cursor-pointer"
              >
                <AppIcon name="plus" size={13} />
                <span>{t('addFirstTransaction')}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Active Goals Section */}
      <section className="bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] p-4 sm:p-5 md:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-tight leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
              {t('goalOverview')}
            </h2>
            <p className="text-[12px] sm:text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8] mt-0.5 text-left">{t('goalSub')}</p>
          </div>
          <button
            onClick={() => onNavigate('goals')}
            className="text-[14px] font-sans font-semibold text-[#167C35] dark:text-[#00B000] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>{t('viewGoals')}</span>
            <AppIcon name="arrowRight" size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.goals.length > 0 ? (
            state.goals.slice(0, 2).map((g) => {
              const prog = calculateGoalProgress(g, state.goalContributions);
              return (
                <div
                  key={g.id}
                  className="p-4 bg-[#F4F6F2] dark:bg-[#222A25] border border-[#E2E6DF] dark:border-[#28312B] rounded-[14px] flex flex-col justify-between gap-3 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-left">
                      <strong className="block text-[15px] sm:text-[16px] font-heading font-semibold text-[#171B18] dark:text-[#F0F0F0] text-left leading-[1.3]">{g.name}</strong>
                      <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] text-left block mt-0.5">{g.note || t('goalTarget')}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[#EBF0E8] dark:bg-[#1B211D] text-[#5C665F] dark:text-[#B7C1B8] border border-[#E2E6DF] dark:border-[#28312B] shrink-0">
                      {g.priority === 'high'
                        ? t('highPriority')
                        : g.priority === 'low'
                        ? t('lowPriority')
                        : t('mediumPriority')}
                    </span>
                  </div>

                  <div>
                    <div className="text-[20px] sm:text-[22px] font-heading font-bold tabular-nums text-[#171B18] dark:text-[#F0F0F0] text-left">
                      {formatMoney(prog.currentSaved, lang)}
                    </div>
                    <div className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] text-left mt-0.5">
                      {t('goalTarget').toLowerCase()} {formatMoney(g.targetAmount, lang)}
                    </div>
                    <div className="w-full h-1.5 bg-[#E2E6DF] dark:bg-[#1B211D] rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-[#167C35] to-[#A4D65A] dark:from-[#00B000] dark:to-[#A4D65A] rounded-full transition-all duration-300"
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="sm:col-span-2 py-6 text-center text-[13px] font-sans text-[#5C665F] dark:text-[#B7C1B8]">
              <p>{t('noGoals')}</p>
              <button
                onClick={onAddGoal}
                className="mt-2 text-[14px] font-sans font-semibold text-[#167C35] dark:text-[#00B000] hover:underline cursor-pointer"
              >
                {t('addGoal')}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
