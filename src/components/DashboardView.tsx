import React from 'react';
import { motion } from 'motion/react';
import type { AppState, PageId, Language } from '../types/finance.ts';
import {
  currentMonth,
  monthLabel,
  calculateTotals,
  calculateBudgetUsage,
  calculateGoalProgress,
  formatMoney,
  formatDisplayDate,
  chartWeeklyData,
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

  const monthTx = state.transactions.filter((tx) => tx.date && tx.date.startsWith(m));
  const totals = calculateTotals(monthTx);

  const categoryMap = new Map(state.categories.map((c) => [c.id, c]));

  // Budgets for current month
  const activeBudgets = state.budgets
    .filter((b) => b.month === m)
    .map((b) => ({
      ...b,
      category: categoryMap.get(b.categoryId),
      usage: calculateBudgetUsage(b, state.transactions),
    }))
    .slice(0, 4);

  // Recent transactions
  const recentTx = [...monthTx]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, 5);

  // Top active goal
  const topGoal = state.goals[0];
  const goalProgress = topGoal ? calculateGoalProgress(topGoal, state.goalContributions) : null;

  // Chart data
  const weeklyData = chartWeeklyData(state.transactions, m);
  const maxWeeklyAmount = Math.max(1, ...weeklyData.flatMap((w) => [w.income, w.expenses]));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#27694c] dark:text-[#52ba88] mb-1.5 text-left">
            <span className="w-4 h-0.5 bg-[#27694c] dark:bg-[#52ba88] rounded-full" />
            <span>{t('welcome')}</span>
          </div>
          <h1 className="text-[22px] sm:text-[26px] font-heading font-black tracking-[-0.02em] leading-[1.25] text-[#1a1c19] dark:text-[#eef1ec] text-left">
            {t('navDashboard')}
          </h1>
          <p className="mt-1 text-[13px] sm:text-[14px] font-sans text-[#606c64] dark:text-[#a0aba2] leading-[1.45] text-left">
            {t('dashboardIntro')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddTransaction}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-[12px] bg-[#27694c] hover:bg-[#174d36] text-white text-[14px] font-sans font-semibold leading-none shadow-[0_4px_16px_rgba(39,105,76,0.22)] transition-all shrink-0"
        >
          <AppIcon name="plus" size={16} />
          <span>{t('addTransaction')}</span>
        </motion.button>
      </div>

      {/* Quick Access Cards: 12-col Desktop / 4-col Mobile Grid */}
      <div className="grid grid-cols-4 md:grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
        {/* Goal Quick Access */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('goals')}
          className="col-span-4 md:col-span-6 flex items-center gap-3.5 p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] text-left hover:border-[#bfc9c1] hover:shadow-[0_8px_20px_rgba(39,105,76,0.08)] transition-all group tactile-card"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-[14px] bg-[#edf5ed] dark:bg-[#1a3424] text-[#27694c] dark:text-[#52ba88] shrink-0">
            <AppIcon name="target" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-sans font-semibold text-[#606c64] dark:text-[#a0aba2] uppercase tracking-wider text-left">
              {t('navGoals')}
            </span>
            <strong className="block text-[15px] sm:text-[16px] font-heading font-bold text-[#1a1c19] dark:text-[#eef1ec] truncate text-left mt-0.5">
              {topGoal ? topGoal.name : t('manageGoals')}
            </strong>
            <span className="block text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] truncate mt-1 text-left">
              {topGoal && goalProgress
                ? `${goalProgress.percentage}% ${t('goalProgress').toLowerCase()} · ${formatMoney(
                    goalProgress.currentSaved,
                    lang
                  )}`
                : t('quickGoalsEmpty')}
            </span>
            {topGoal && goalProgress && (
              <div className="w-full h-1.5 bg-[#f3f4ef] dark:bg-[#252c27] rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-[#27694c] dark:bg-[#52ba88] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgress.percentage}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            )}
          </div>
          <div className="text-[#707972] group-hover:translate-x-1 transition-transform shrink-0">
            <AppIcon name="arrowRight" size={16} />
          </div>
        </motion.button>

        {/* Monthly Report Quick Access */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('reports')}
          className="col-span-4 md:col-span-6 flex items-center gap-3.5 p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] text-left hover:border-[#bfc9c1] hover:shadow-[0_8px_20px_rgba(39,105,76,0.08)] transition-all group tactile-card"
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-[14px] bg-[#edf5ed] dark:bg-[#1a3424] text-[#27694c] dark:text-[#52ba88] shrink-0">
            <AppIcon name="chart" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-sans font-semibold text-[#606c64] dark:text-[#a0aba2] uppercase tracking-wider text-left">
              {t('quickAnalysisTitle')}
            </span>
            <strong
              className={`block text-[15px] sm:text-[16px] font-heading font-extrabold tabular-nums tracking-tight mt-0.5 text-left ${
                totals.net > 0
                  ? 'text-[#287448] dark:text-[#4ec985]'
                  : totals.net < 0
                  ? 'text-[#ba1a1a] dark:text-[#e87063]'
                  : 'text-[#1a1c19] dark:text-[#eef1ec]'
              }`}
            >
              {totals.net < 0 ? '−' : ''}
              {formatMoney(Math.abs(totals.net), lang)}
            </strong>
            <span className="block text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] truncate mt-1 text-left">
              {monthTx.length} {t('quickTransactions')} · {monthLabel(m, lang)}
            </span>
          </div>
          <div className="text-[#707972] group-hover:translate-x-1 transition-transform shrink-0">
            <AppIcon name="arrowRight" size={16} />
          </div>
        </motion.button>
      </div>

      {/* 3 KPI Metric Cards: Hero Net Flow + Income + Expenses (12-col Desktop / 4-col Mobile Grid) */}
      <div className="grid grid-cols-4 md:grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
        {/* Net Flow / Hero Main Balance (Mobile 28px, Desktop 34px) */}
        <div className="col-span-4 md:col-span-6 p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] tactile-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-left">
            <div>
              <span className="block text-[12px] sm:text-[13px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2]">
                {t('netCashflow')}
              </span>
              <span className="block text-[11px] font-sans text-[#707972] dark:text-[#88938a] mt-0.5">
                {monthLabel(m, lang)}
              </span>
            </div>
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#edf0fb] dark:bg-[#1f2738] text-[#586ab0] dark:text-[#8ea0e8] shrink-0">
              <AppIcon name="chart" size={17} />
            </div>
          </div>
          <div
            className={`text-[28px] sm:text-[34px] font-heading font-black tabular-nums tracking-[-0.03em] leading-[1.15] mt-3 truncate text-left ${
              totals.net > 0
                ? 'text-[#287448] dark:text-[#4ec985]'
                : totals.net < 0
                ? 'text-[#ba1a1a] dark:text-[#e87063]'
                : 'text-[#1a1c19] dark:text-[#eef1ec]'
            }`}
          >
            {totals.net < 0 ? '−' : ''}
            {formatMoney(Math.abs(totals.net), lang)}
          </div>
          <div className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-2 flex items-center gap-1.5 text-left">
            {totals.net > 0 ? (
              <span className="text-[#287448] dark:text-[#4ec985] font-semibold flex items-center gap-1">
                <AppIcon name="arrowRight" size={12} /> {t('positiveFlow')}
              </span>
            ) : totals.net < 0 ? (
              <span className="text-[#ba1a1a] dark:text-[#e87063] font-semibold flex items-center gap-1">
                <AppIcon name="arrowRight" size={12} /> {t('negativeFlow')}
              </span>
            ) : (
              <span>{t('noFlow')}</span>
            )}
          </div>
        </div>

        {/* Income Card */}
        <div className="col-span-2 md:col-span-3 p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] tactile-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-left">
            <span className="text-[12px] sm:text-[13px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2] truncate">
              {t('income')}
            </span>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e9f4eb] dark:bg-[#142a1d] text-[#287448] dark:text-[#4ec985] shrink-0">
              <AppIcon name="income" size={16} />
            </div>
          </div>
          <div className="text-[18px] sm:text-[22px] font-heading font-extrabold tabular-nums tracking-[-0.02em] leading-tight text-[#1a1c19] dark:text-[#eef1ec] mt-3 truncate text-left">
            {formatMoney(totals.income, lang)}
          </div>
          <div className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-2 flex items-center gap-1 text-left truncate">
            <span>{t('fromRecords')}</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="col-span-2 md:col-span-3 p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] tactile-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-left">
            <span className="text-[12px] sm:text-[13px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2] truncate">
              {t('expenses')}
            </span>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#fcf2ee] dark:bg-[#321c15] text-[#db815e] dark:text-[#e89574] shrink-0">
              <AppIcon name="expense" size={16} />
            </div>
          </div>
          <div className="text-[18px] sm:text-[22px] font-heading font-extrabold tabular-nums tracking-[-0.02em] leading-tight text-[#1a1c19] dark:text-[#eef1ec] mt-3 truncate text-left">
            {formatMoney(totals.expenses, lang)}
          </div>
          <div className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-2 flex items-center gap-1 text-left truncate">
            <span>{t('fromRecords')}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Cash Flow Trend & Category Budgets (12-col Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Trend Bar Chart */}
        <section className="lg:col-span-7 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 md:p-6 shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">
                {t('cashflowTrend')}
              </h2>
              <p className="text-[12px] sm:text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-0.5 text-left">{t('cashflowSub')}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#f3f4ef] dark:bg-[#252c27] text-[#404943] dark:text-[#c4cec6] text-[11px] font-sans font-semibold">
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
                  <div className="w-full max-w-[36px] flex items-end justify-center gap-1.5 h-[calc(100%-20px)] border-b border-[#e7ebe4] dark:border-[#2a342c]">
                    <div
                      className="w-2.5 rounded-t bg-[#287448] dark:bg-[#4ec985] transition-all duration-300"
                      style={{ height: `${incHeight}%` }}
                      title={`${t('incomeLegend')}: ${formatMoney(week.income, lang)}`}
                    />
                    <div
                      className="w-2.5 rounded-t bg-[#db815e] dark:bg-[#e89574] transition-all duration-300"
                      style={{ height: `${expHeight}%` }}
                      title={`${t('expenseLegend')}: ${formatMoney(week.expenses, lang)}`}
                    />
                  </div>
                  <span className="text-[11px] font-sans font-medium text-[#707972] dark:text-[#88938a]">{week.label}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#e7ebe4] dark:border-[#2a342c] text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#287448] dark:bg-[#4ec985]" />
              {t('incomeLegend')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#db815e] dark:bg-[#e89574]" />
              {t('expenseLegend')}
            </span>
          </div>
        </section>

        {/* Budget Overview Mini List */}
        <section className="lg:col-span-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 md:p-6 shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">
                {t('budgetOverview')}
              </h2>
              <p className="text-[12px] sm:text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-0.5 text-left">{t('budgetSub')}</p>
            </div>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-[13px] font-sans font-semibold text-[#27694c] dark:text-[#52ba88] hover:underline flex items-center gap-1 shrink-0"
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
                    ? 'bg-[#ba1a1a] dark:bg-[#e87063]'
                    : b.usage.status === 'near_limit'
                    ? 'bg-[#db815e] dark:bg-[#e89574]'
                    : 'bg-[#27694c] dark:bg-[#52ba88]';
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: `${b.category?.color || '#27694c'}18`,
                            color: b.category?.color || '#27694c',
                          }}
                        >
                          <AppIcon name={b.category?.icon || 'tag'} size={14} />
                        </span>
                        <strong className="text-[14px] font-sans font-semibold text-[#1a1c19] dark:text-[#eef1ec] truncate text-left">
                          {lang === 'en' && b.category?.nameEn ? b.category.nameEn : b.category?.name}
                        </strong>
                      </div>
                      <span className="tabular-nums font-heading font-bold text-[12px] text-[#1a1c19] dark:text-[#eef1ec] shrink-0 text-right">
                        {b.usage.percentage}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#f3f4ef] dark:bg-[#252c27] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${fillClass}`}
                        style={{ width: `${Math.min(100, b.usage.percentage)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2]">
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
              <div className="py-6 text-center text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2]">
                <p>{t('noBudgets')}</p>
                <button
                  onClick={onAddBudget}
                  className="mt-2 text-[13px] font-sans font-semibold text-[#27694c] dark:text-[#52ba88] hover:underline"
                >
                  {t('addBudgetFirst')}
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 mt-4 border-t border-[#e7ebe4] dark:border-[#2a342c] flex items-center justify-between text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2]">
            <span>{activeBudgets.length} {t('budgets').toLowerCase()}</span>
            <button
              onClick={onAddBudget}
              className="text-[13px] font-sans font-semibold text-[#27694c] dark:text-[#52ba88] hover:underline flex items-center gap-1"
            >
              <span>{t('addBudget')}</span>
              <AppIcon name="plus" size={12} />
            </button>
          </div>
        </section>
      </div>

      {/* Recent Transactions Feed */}
      <section className="bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 md:p-6 shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">
              {t('recentTransactions')}
            </h2>
            <p className="text-[12px] sm:text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-0.5 text-left">{t('recentSub')}</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-[13px] font-sans font-semibold text-[#27694c] dark:text-[#52ba88] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{t('viewTransactions')}</span>
            <AppIcon name="arrowRight" size={12} />
          </button>
        </div>

        <div className="divide-y divide-[#e7ebe4] dark:divide-[#2a342c]">
          {recentTx.length > 0 ? (
            recentTx.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              const isIncome = tx.type === 'income';
              return (
                <div key={tx.id} className="py-3 sm:py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                      style={{
                        backgroundColor: `${cat?.color || '#9aa89a'}18`,
                        color: cat?.color || '#27694c',
                      }}
                    >
                      <AppIcon name={cat?.icon || 'tag'} size={18} />
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-[14px] sm:text-[15px] font-sans font-semibold text-[#1a1c19] dark:text-[#eef1ec] truncate text-left">
                        {tx.note || (lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name) || t('transactions')}
                      </strong>
                      <span className="block text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] truncate mt-0.5 text-left">
                        {lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name} · {formatDisplayDate(tx.date, lang, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`tabular-nums font-heading font-bold text-[14px] sm:text-[15px] text-right shrink-0 ${
                      isIncome ? 'text-[#287448] dark:text-[#4ec985]' : 'text-[#1a1c19] dark:text-[#eef1ec]'
                    }`}
                  >
                    {isIncome ? '+' : '−'}
                    {formatMoney(tx.amount, lang)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2]">
              <p>{t('emptyTransactions')}</p>
              <button
                onClick={onAddTransaction}
                className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-sans font-semibold text-[#27694c] dark:text-[#52ba88] hover:underline"
              >
                <AppIcon name="plus" size={13} />
                <span>{t('addFirstTransaction')}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Active Goals Section */}
      <section className="bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 md:p-6 shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">
              {t('goalOverview')}
            </h2>
            <p className="text-[12px] sm:text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2] mt-0.5 text-left">{t('goalSub')}</p>
          </div>
          <button
            onClick={() => onNavigate('goals')}
            className="text-[13px] font-sans font-semibold text-[#27694c] dark:text-[#52ba88] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{t('viewGoals')}</span>
            <AppIcon name="arrowRight" size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {state.goals.length > 0 ? (
            state.goals.slice(0, 2).map((g) => {
              const prog = calculateGoalProgress(g, state.goalContributions);
              return (
                <div
                  key={g.id}
                  className="p-4 bg-[#f9faf5] dark:bg-[#1a1e1b] border border-[#e7ebe4] dark:border-[#2a342c] rounded-[14px] sm:rounded-[16px] flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="block text-[14px] sm:text-[15px] font-heading font-bold text-[#1a1c19] dark:text-[#eef1ec] text-left">{g.name}</strong>
                      <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] text-left block mt-0.5">{g.note || t('goalTarget')}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-[#edeee9] dark:bg-[#252c27] text-[#404943] dark:text-[#c4cec6] shrink-0">
                      {g.priority === 'high'
                        ? t('highPriority')
                        : g.priority === 'low'
                        ? t('lowPriority')
                        : t('mediumPriority')}
                    </span>
                  </div>

                  <div>
                    <div className="text-[20px] sm:text-[22px] font-heading font-extrabold tabular-nums text-[#1a1c19] dark:text-[#eef1ec] text-left">
                      {formatMoney(prog.currentSaved, lang)}
                    </div>
                    <div className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] text-left mt-0.5">
                      {t('goalTarget').toLowerCase()} {formatMoney(g.targetAmount, lang)}
                    </div>
                    <div className="w-full h-1.5 bg-[#e7ebe4] dark:bg-[#2a342c] rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-[#27694c] dark:bg-[#52ba88] rounded-full transition-all duration-300"
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="sm:col-span-2 py-6 text-center text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2]">
              <p>{t('noGoals')}</p>
              <button
                onClick={onAddGoal}
                className="mt-2 text-[13px] font-sans font-semibold text-[#27694c] dark:text-[#52ba88] hover:underline"
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
