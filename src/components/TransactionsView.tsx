import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import type { Transaction, Category, Language } from '../types/finance.ts';
import {
  monthLabel,
  formatMoney,
  formatDisplayDate,
  todayISO,
} from '../lib/calculations.ts';
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
  const [monthFilter, setMonthFilter] = useState<string>('all');

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
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-[22px] sm:text-[26px] font-heading font-bold tracking-tight leading-[1.25] text-[#171B18] dark:text-[#F0F0F0] text-left">
          {t('navTransactions')}
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

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C665F] dark:text-[#B7C1B8] pointer-events-none">
              <AppIcon name="search" size={16} />
            </div>
            <input
              type="search"
              placeholder={t('searchTransactions')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans text-[#171B18] dark:text-[#F0F0F0] placeholder-[#5C665F]/60 focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="h-11 px-3.5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[13px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] outline-none cursor-pointer"
          >
            <option value="all">{t('allTypes')}</option>
            <option value="income">{t('incomeType')}</option>
            <option value="expense">{t('expenseType')}</option>
          </select>

          {/* Month Filter */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="h-11 px-3.5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[13px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] outline-none cursor-pointer"
          >
            <option value="all">{t('allMonths')}</option>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[12px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8] self-end md:self-center">
          {filtered.length} {t('records')}
        </span>
      </div>

      {/* Feed with Temporal Dividers */}
      <div className="space-y-6">
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map((group) => (
            <section key={group.date} className="space-y-2">
              {/* Temporal Divider */}
              <div className="text-[12px] font-sans font-bold uppercase tracking-wider text-[#5C665F] dark:text-[#B7C1B8] px-1 text-left">
                {group.label}
              </div>

              {/* Transactions in Group — Single-Line Row for Mobile & Desktop */}
              <div className="bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] divide-y divide-[#E2E6DF] dark:divide-[#28312B] overflow-hidden shadow-xs">
                {group.items.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const isIncome = tx.type === 'income';
                  return (
                    <article
                      key={tx.id}
                      className="px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-[#EBF0E8] dark:hover:bg-[#222A25] transition-colors"
                    >
                      {/* Left: Category icon & Details */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                          style={{
                            backgroundColor: `${cat?.color || '#167C35'}18`,
                            color: cat?.color || '#167C35',
                          }}
                        >
                          <AppIcon name={cat?.icon || 'tag'} size={18} />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <strong className="block text-[14px] sm:text-[15px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] truncate text-left">
                            {tx.note || (lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name) || t('transactions')}
                          </strong>
                          <span className="block text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] truncate mt-0.5 text-left">
                            {lang === 'en' && cat?.nameEn ? cat.nameEn : cat?.name} · {formatDisplayDate(tx.date, lang, { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>

                      {/* Right: Amount & Actions in Single Line */}
                      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                        <div
                          className={`tabular-nums font-heading font-bold text-[14px] sm:text-[15px] text-right shrink-0 ${
                            isIncome ? 'text-[#167C35] dark:text-[#00B000]' : 'text-[#B94E48] dark:text-[#E06D67]'
                          }`}
                        >
                          {isIncome ? '+' : '−'}
                          {formatMoney(tx.amount, lang)}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onEditTransaction(tx)}
                            aria-label={`${t('edit')}: ${tx.note || cat?.name}`}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#EBF6EE] dark:hover:bg-[#14291B] hover:text-[#167C35] dark:hover:text-[#00B000] transition-colors cursor-pointer"
                          >
                            <AppIcon name="edit" size={15} />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDeleteTransaction(tx)}
                            aria-label={`${t('delete')}: ${tx.note || cat?.name}`}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#FDF1F0] dark:hover:bg-[#2F1816] hover:text-[#B94E48] dark:hover:text-[#E06D67] transition-colors cursor-pointer"
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
          <div className="p-12 text-center bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] text-[#5C665F] dark:text-[#B7C1B8]">
            <p className="text-[14px] font-sans">{t('emptyTransactions')}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onAddTransaction}
              className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] text-[14px] font-sans font-semibold cursor-pointer shadow-sm"
            >
              <AppIcon name="plus" size={16} />
              <span>{t('addFirstTransaction')}</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};
