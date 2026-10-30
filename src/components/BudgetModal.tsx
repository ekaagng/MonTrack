import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { Budget, Category, Language } from '../types/finance.ts';
import { currentMonth, monthLabel } from '../lib/calculations.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface BudgetModalProps {
  budget?: Budget | null;
  categories: Category[];
  existingBudgets: Budget[];
  defaultMonth?: string;
  lang: Language;
  onSave: (b: Omit<Budget, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  budget,
  categories,
  existingBudgets,
  defaultMonth,
  lang,
  onSave,
  onCancel,
}) => {
  const t = (k: string) => getTranslation(k, lang);

  const [month, setMonth] = useState<string>(budget?.month || defaultMonth || currentMonth());
  const [categoryId, setCategoryId] = useState<string>(budget?.categoryId || '');
  const [rawAmount, setRawAmount] = useState<string>(budget ? String(budget.amount) : '');
  const [error, setError] = useState<string>('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { value: m, label: monthLabel(m, lang) };
  });

  const selectedCategoryId = categoryId || expenseCategories[0]?.id || '';

  const displayAmount = rawAmount
    ? Number(rawAmount.replace(/\D/g, '')).toLocaleString('id-ID')
    : '';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setRawAmount(digitsOnly);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = Math.round(Number(rawAmount));
    if (!parsedAmount || parsedAmount <= 0) {
      setError(t('validationAmount'));
      return;
    }

    const duplicate = existingBudgets.some(
      (b) => b.categoryId === selectedCategoryId && b.month === month && b.id !== budget?.id
    );
    if (duplicate) {
      setError(t('budgetExists'));
      return;
    }

    onSave({
      id: budget?.id,
      categoryId: selectedCategoryId,
      amount: parsedAmount,
      month,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div className="p-3 rounded-[12px] bg-[#FDF1F0] dark:bg-[#2F1816] text-[#B94E48] dark:text-[#E06D67] text-[12px] font-sans font-medium text-left" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="budget-cat" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
          {t('chooseCategory')}
        </label>
        <select
          id="budget-cat"
          value={selectedCategoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
        >
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === 'en' && c.nameEn ? c.nameEn : c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="budget-amount" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
          {t('budgetAmount')} ({lang === 'en' ? 'IDR' : 'Rupiah'})
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-[#5C665F] dark:text-[#B7C1B8] font-heading font-bold text-base select-none pointer-events-none">
            {lang === 'en' ? 'IDR' : 'Rp'}
          </span>
          <input
            id="budget-amount"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={displayAmount}
            onChange={handleAmountChange}
            className="w-full h-12 pl-14 pr-4 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[20px] sm:text-[22px] font-heading font-bold tabular-nums text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="budget-month" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
          {t('budgetMonth')}
        </label>
        <select
          id="budget-month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
        >
          {monthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] leading-relaxed text-left">
        {t('budgetHint')}
      </p>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E6DF] dark:border-[#28312B]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onCancel}
          className="h-11 px-5 rounded-[12px] bg-[#EBF0E8] dark:bg-[#222A25] hover:bg-[#E2E6DF] dark:hover:bg-[#28312B] text-[14px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] transition-all cursor-pointer"
        >
          {t('cancel')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] text-[14px] font-sans font-semibold leading-none shadow-sm transition-all cursor-pointer"
        >
          <AppIcon name="check" size={16} />
          <span>{budget ? t('update') : t('save')}</span>
        </motion.button>
      </div>
    </form>
  );
};
