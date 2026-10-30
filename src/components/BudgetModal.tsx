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
        <div className="p-3.5 rounded-[12px] bg-[#fff0ed] text-[#b84b40] text-xs font-semibold" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="budget-cat" className="block text-[11px] font-semibold tracking-wider text-[#606c64] uppercase mb-1.5">
          {t('chooseCategory')}
        </label>
        <select
          id="budget-cat"
          value={selectedCategoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full h-[52px] px-3.5 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-sm font-semibold text-[#1a1c19] focus:border-[#27694c] focus:ring-[3px] focus:ring-[#e9f3ec] outline-none transition-all"
        >
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === 'en' && c.nameEn ? c.nameEn : c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="budget-amount" className="block text-[11px] font-semibold tracking-wider text-[#606c64] uppercase mb-1.5">
          {t('budgetAmount')} ({lang === 'en' ? 'IDR' : 'Rupiah'})
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-[#606c64] font-bold text-base select-none pointer-events-none">
            {lang === 'en' ? 'IDR' : 'Rp'}
          </span>
          <input
            id="budget-amount"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={displayAmount}
            onChange={handleAmountChange}
            className="w-full h-[52px] pl-14 pr-4 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-lg font-bold tabular-nums text-[#1a1c19] focus:border-[#27694c] focus:ring-[3px] focus:ring-[#e9f3ec] outline-none transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="budget-month" className="block text-[11px] font-semibold tracking-wider text-[#606c64] uppercase mb-1.5">
          {t('budgetMonth')}
        </label>
        <select
          id="budget-month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full h-[52px] px-3.5 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-sm font-semibold text-[#1a1c19] focus:border-[#27694c] focus:ring-[3px] focus:ring-[#e9f3ec] outline-none transition-all"
        >
          {monthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-[#606c64] leading-relaxed">
        {t('budgetHint')}
      </p>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#e7ebe4] dark:border-[#2a342c]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onCancel}
          className="h-12 px-5 rounded-[14px] bg-[#e9f3ec] dark:bg-[#183626] hover:bg-[#d8ebd9] dark:hover:bg-[#204430] text-xs font-bold text-[#27694c] dark:text-[#92d5b1] transition-all"
        >
          {t('cancel')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-[14px] bg-[#27694c] hover:bg-[#174d36] text-white text-xs font-bold shadow-[0_4px_16px_rgba(39,105,76,0.22)] transition-all"
        >
          <AppIcon name="check" size={16} />
          <span>{budget ? t('update') : t('save')}</span>
        </motion.button>
      </div>
    </form>
  );
};
