import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import type { Transaction, Category, Language } from '../types/finance.ts';
import { currentMonth, monthLabel, formatMoney, formatDisplayDate, todayISO } from '../lib/calculations.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  lang: Language;
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  lang,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const t = (k: string) => getTranslation(k, lang);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth());

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

  // Filtered transactions
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...transactions]
      .filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (monthFilter !== 'all' && (!tx.date || !tx.date.startsWith(monthFilter))) return false;
        if (q) {
          const cat = categoryMap.get(tx.categoryId);
          const matchNote = tx.note?.toLowerCase().includes(q);
          const matchCat = cat?.name.toLowerCase().includes(q) || cat?.nameEn?.toLowerCase().includes(q);
          if (!matchNote && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [transactions, query, typeFilter, monthFilter, categoryMap]);

  // Group by date for temporal dividers
  const groupedTransactions = useMemo(() => {
    const groups: Array<{ label: string; date: string; items: Transaction[] }> = [];
    const today = todayISO();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(
      yesterdayDate.getDate()
    ).padStart(2, '0')}`;

    for (const tx of filtered) {
      let group = groups.find((g) => g.date === tx.date);
      if (!group) {
        let label = formatDisplayDate(tx.date, lang, { day: 'numeric', month: 'long', year: 'numeric' });
        if (tx.date === today) {
          label = lang === 'en' ? 'Today' : 'Hari Ini';
        } else if (tx.date === yesterday) {
          label = lang === 'en' ? 'Yesterday' : 'Kemarin';
        }
        group = { label, date: tx.date, items: [] };
        groups.push(group);
      }
      group.items.push(tx);
    }
    return groups;
  }, [filtered, lang]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#27694c] dark:text-[#52ba88] mb-1.5 text-left">
            <span className="w-4 h-0.5 bg-[#27694c] dark:bg-[#52ba88] rounded-full" />
            <span>{t('navTransactions')}</span>
          </div>
          <h1 className="text-[22px] sm:text-[26px] font-heading font-black tracking-[-0.02em] leading-[1.25] text-[#1a1c19] dark:text-[#eef1ec] text-left">
            {t('navTransactions')}
          </h1>
          <p className="mt-1 text-[13px] sm:text-[14px] font-sans text-[#606c64] dark:text-[#a0aba2] leading-[1.45] text-left">
            {t('showing')} {filtered.length} {t('records')}
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

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707972] pointer-events-none">
              <AppIcon name="search" size={16} />
            </div>
            <input
              type="search"
              placeholder={t('searchTransactions')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-[13px] sm:text-[14px] font-sans text-[#1a1c19] placeholder-[#939f97] focus:border-[#27694c] focus:ring-[3px] focus:ring-[#e9f3ec] outline-none transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="h-11 px-3.5 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-[13px] font-sans font-medium text-[#404943] focus:border-[#27694c] outline-none"
          >
            <option value="all">{t('allTypes')}</option>
            <option value="income">{t('incomeType')}</option>
            <option value="expense">{t('expenseType')}</option>
          </select>

          {/* Month Filter */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="h-11 px-3.5 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-[13px] font-sans font-medium text-[#404943] focus:border-[#27694c] outline-none"
          >
            <option value="all">{t('allMonths')}</option>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[12px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2] self-end md:self-center">
          {filtered.length} {t('records')}
        </span>
      </div>

      {/* Feed with Temporal Dividers */}
      <div className="space-y-6">
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map((group) => (
            <section key={group.date} className="space-y-2">
              {/* Temporal Divider */}
              <div className="text-[12px] font-sans font-bold uppercase tracking-wider text-[#606c64] dark:text-[#a0aba2] px-1 text-left">
                {group.label}
              </div>

              {/* Transactions in Group */}
              <div className="bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] divide-y divide-[#e7ebe4] dark:divide-[#2a342c] overflow-hidden">
                {group.items.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const isIncome = tx.type === 'income';
                  return (
                    <article
                      key={tx.id}
                      className="p-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-[#fafbf8] dark:hover:bg-[#1f2621] transition-colors"
                    >
                      {/* Left: Category icon & Details */}
                      <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                            style={{
                              backgroundColor: `${cat?.color || '#9aa89a'}18`,
                              color: cat?.color || '#27694c',
                            }}
                          >
                            <AppIcon name={cat?.icon || 'tag'} size={18} />
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <strong className="block text-[14px] sm:text-[15px] font-sans font-semibold text-[#1a1c19] dark:text-[#eef1ec] truncate">
                              {tx.note || (lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name) || t('transactions')}
                            </strong>
                            <span className="block text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] truncate mt-0.5">
                              {lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name}
                            </span>
                          </div>
                        </div>

                        {/* Mobile-only Top Right Amount */}
                        <div
                          className={`sm:hidden tabular-nums font-heading font-bold text-[15px] text-right shrink-0 ${
                            isIncome ? 'text-[#287448] dark:text-[#4ec985]' : 'text-[#1a1c19] dark:text-[#eef1ec]'
                          }`}
                        >
                          {isIncome ? '+' : '−'}
                          {formatMoney(tx.amount, lang)}
                        </div>
                      </div>

                      {/* Right on Desktop / Bottom row on Mobile: Badge, Amount, and Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 shrink-0 pt-1.5 sm:pt-0 border-t border-[#f0f2ed] dark:border-[#242b26] sm:border-0">
                        {/* Pill Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium tracking-normal ${
                            isIncome
                              ? 'bg-[#e9f4eb] dark:bg-[#142a1d] text-[#287448] dark:text-[#4ec985]'
                              : 'bg-[#fcf2ee] dark:bg-[#321c15] text-[#db815e] dark:text-[#e89574]'
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: isIncome ? '#287448' : '#db815e' }}
                          />
                          {isIncome ? t('incomeType') : t('expenseType')}
                        </span>

                        {/* Desktop Amount */}
                        <div
                          className={`hidden sm:block tabular-nums font-heading font-bold text-[15px] sm:text-[16px] text-right ${
                            isIncome ? 'text-[#287448] dark:text-[#4ec985]' : 'text-[#1a1c19] dark:text-[#eef1ec]'
                          }`}
                        >
                          {isIncome ? '+' : '−'}
                          {formatMoney(tx.amount, lang)}
                        </div>

                        {/* Action buttons with Tactile Spring */}
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onEditTransaction(tx)}
                            aria-label={`${t('edit')}: ${tx.note || cat?.name}`}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#707972] dark:text-[#a0aba2] hover:bg-[#e9f3ec] dark:hover:bg-[#1a3424] hover:text-[#27694c] dark:hover:text-[#52ba88] transition-colors"
                          >
                            <AppIcon name="edit" size={15} />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDeleteTransaction(tx)}
                            aria-label={`${t('delete')}: ${tx.note || cat?.name}`}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#707972] dark:text-[#a0aba2] hover:bg-[#fff0ed] dark:hover:bg-[#381a17] hover:text-[#b84b40] dark:hover:text-[#e87063] transition-colors"
                          >
                            <AppIcon name="trash" size={15} />
                          </motion.button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="p-8 sm:p-12 text-center bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] text-[13px] font-sans text-[#606c64] dark:text-[#a0aba2]">
            <p className="font-heading font-bold text-[#1a1c19] dark:text-[#eef1ec] text-[15px] sm:text-[16px] mb-1">{t('noMatchingTransactions')}</p>
            <p className="max-w-xs mx-auto mb-4">{t('noMatchingDesc')}</p>
            <button
              onClick={onAddTransaction}
              className="inline-flex items-center gap-1.5 h-11 px-5 rounded-[12px] bg-[#27694c] hover:bg-[#174d36] text-white text-[14px] font-sans font-semibold"
            >
              <AppIcon name="plus" size={14} />
              <span>{t('addTransaction')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
