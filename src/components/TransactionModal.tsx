import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import type { Transaction, Category, TransactionType, Language } from '../types/finance.ts';
import { todayISO } from '../lib/calculations.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface TransactionModalProps {
  transaction?: Transaction | null;
  categories: Category[];
  lang: Language;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  onCancel: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  categories,
  lang,
  onSave,
  onCancel,
}) => {
  const t = (k: string) => getTranslation(k, lang);

  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
  // Raw numeric string for amount
  const [rawAmount, setRawAmount] = useState<string>(
    transaction ? String(transaction.amount) : ''
  );
  const [date, setDate] = useState<string>(transaction?.date || todayISO());
  const [categoryId, setCategoryId] = useState<string>(transaction?.categoryId || '');
  const [note, setNote] = useState<string>(transaction?.note || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const eligibleCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!eligibleCategories.some((c) => c.id === categoryId)) {
      setCategoryId(eligibleCategories[0]?.id || '');
    }
  }, [type, eligibleCategories, categoryId]);

  // Format amount with Indonesian periods (e.g. 1.450.000)
  const displayAmount = rawAmount
    ? Number(rawAmount.replace(/\D/g, '')).toLocaleString('id-ID')
    : '';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setRawAmount(digitsOnly);
    setErrors((prev) => ({ ...prev, amount: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const parsedAmount = Math.round(Number(rawAmount));

    if (!parsedAmount || parsedAmount <= 0) {
      newErrors.amount = t('validationAmount');
    }
    if (!date) {
      newErrors.date = t('validationDate');
    }
    if (!categoryId) {
      newErrors.category = t('validationCategory');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: transaction?.id,
      type,
      amount: parsedAmount,
      categoryId,
      date,
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Type Toggle: Segmented Control with Smooth Motion */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#edeee9] dark:bg-[#232925] rounded-[14px]" role="group" aria-label={t('type')}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            setType('expense');
            setErrors({});
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-xs font-bold transition-all ${
            type === 'expense'
              ? 'bg-white dark:bg-[#181c19] text-[#db815e] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
              : 'text-[#606c64] dark:text-[#88938a] hover:text-[#1a1c19] dark:hover:text-[#eef1ec]'
          }`}
        >
          <AppIcon name="expense" size={15} />
          {t('expenseType')}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            setType('income');
            setErrors({});
          }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-xs font-bold transition-all ${
            type === 'income'
              ? 'bg-white dark:bg-[#181c19] text-[#287448] shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
              : 'text-[#606c64] dark:text-[#88938a] hover:text-[#1a1c19] dark:hover:text-[#eef1ec]'
          }`}
        >
          <AppIcon name="income" size={15} />
          {t('incomeType')}
        </motion.button>
      </div>

      {/* Financial Input Variant: Large display field with persistent Rp prefix */}
      <div>
        <label htmlFor="tx-amount" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#606c64] dark:text-[#a0aba2] uppercase mb-1.5 text-left">
          {t('amount')} ({lang === 'en' ? 'IDR' : 'Rupiah'})
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-[#606c64] dark:text-[#a0aba2] font-heading font-bold text-base select-none pointer-events-none">
            {lang === 'en' ? 'IDR' : 'Rp'}
          </span>
          <input
            id="tx-amount"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={displayAmount}
            onChange={handleAmountChange}
            aria-invalid={!!errors.amount}
            className="w-full h-12 sm:h-[50px] pl-14 pr-4 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-[20px] sm:text-[22px] font-heading font-bold tabular-nums text-[#1a1c19] focus:border-[#27694c] focus:ring-[3px] focus:ring-[#e9f3ec] outline-none transition-all placeholder:text-[#939f97]"
            required
          />
        </div>
        {errors.amount && <p className="mt-1 text-[11px] font-sans font-medium text-[#b84b40] text-left">{errors.amount}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
        {/* Date */}
        <div>
          <label htmlFor="tx-date" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#606c64] dark:text-[#a0aba2] uppercase mb-1.5 text-left">
            {t('date')}
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setErrors((prev) => ({ ...prev, date: '' }));
            }}
            aria-invalid={!!errors.date}
            className="w-full h-11 sm:h-12 px-3.5 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-[14px] font-sans font-medium text-[#1a1c19] focus:border-[#27694c] focus:ring-[3px] focus:ring-[#e9f3ec] outline-none transition-all"
            required
          />
          {errors.date && <p className="mt-1 text-[11px] font-sans font-medium text-[#b84b40] text-left">{errors.date}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="tx-category" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#606c64] dark:text-[#a0aba2] uppercase mb-1.5 text-left">
            {t('category')}
          </label>
          <select
            id="tx-category"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setErrors((prev) => ({ ...prev, category: '' }));
            }}
            aria-invalid={!!errors.category}
            className="w-full h-11 sm:h-12 px-3.5 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-[14px] font-sans font-medium text-[#1a1c19] focus:border-[#27694c] focus:ring-[3px] focus:ring-[#e9f3ec] outline-none transition-all"
            required
          >
            {eligibleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === 'en' && c.nameEn ? c.nameEn : c.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-[11px] font-sans font-medium text-[#b84b40] text-left">{errors.category}</p>}
        </div>

        {/* Note */}
        <div className="sm:col-span-2">
          <label htmlFor="tx-note" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#606c64] dark:text-[#a0aba2] uppercase mb-1.5 text-left">
            {t('noteOptional')}
          </label>
          <input
            id="tx-note"
            type="text"
            maxLength={120}
            placeholder={t('transactionNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-11 sm:h-12 px-4 bg-white border-[1.5px] border-[#e7ebe4] rounded-[12px] text-[14px] font-sans text-[#1a1c19] focus:border-[#27694c] focus:ring-[3px] focus:ring-[#e9f3ec] outline-none transition-all placeholder:text-[#939f97]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#e7ebe4] dark:border-[#2a342c]">
        {/* Secondary / Soft Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onCancel}
          className="h-11 px-5 rounded-[12px] bg-[#e9f3ec] dark:bg-[#183626] hover:bg-[#d8ebd9] dark:hover:bg-[#204430] text-[14px] font-sans font-semibold text-[#27694c] dark:text-[#92d5b1] transition-all"
        >
          {t('cancel')}
        </motion.button>
        {/* Primary Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-[#27694c] hover:bg-[#174d36] text-white text-[14px] font-sans font-semibold leading-none shadow-[0_4px_16px_rgba(39,105,76,0.25)] transition-all"
        >
          <AppIcon name="check" size={16} />
          <span>{transaction ? t('update') : t('save')}</span>
        </motion.button>
      </div>
    </form>
  );
};
