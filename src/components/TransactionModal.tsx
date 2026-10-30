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
      {/* Type Toggle: Segmented Control */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#EBF0E8] dark:bg-[#222A25] rounded-[12px] border border-[#E2E6DF] dark:border-[#28312B]" role="group" aria-label={t('type')}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            setType('expense');
            setErrors({});
          }}
          className={`flex items-center justify-center gap-2 py-2 rounded-[10px] text-[13px] font-sans font-semibold transition-all cursor-pointer ${
            type === 'expense'
              ? 'bg-white dark:bg-[#1B211D] text-[#B94E48] dark:text-[#E06D67] shadow-xs'
              : 'text-[#5C665F] dark:text-[#B7C1B8] hover:text-[#171B18] dark:hover:text-[#F0F0F0]'
          }`}
        >
          <AppIcon name="expense" size={15} />
          <span>{t('expenseType')}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => {
            setType('income');
            setErrors({});
          }}
          className={`flex items-center justify-center gap-2 py-2 rounded-[10px] text-[13px] font-sans font-semibold transition-all cursor-pointer ${
            type === 'income'
              ? 'bg-white dark:bg-[#1B211D] text-[#167C35] dark:text-[#00B000] shadow-xs'
              : 'text-[#5C665F] dark:text-[#B7C1B8] hover:text-[#171B18] dark:hover:text-[#F0F0F0]'
          }`}
        >
          <AppIcon name="income" size={15} />
          <span>{t('incomeType')}</span>
        </motion.button>
      </div>

      {/* Financial Input: Large display field with persistent Rp prefix */}
      <div>
        <label htmlFor="tx-amount" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
          {t('amount')} ({lang === 'en' ? 'IDR' : 'Rupiah'})
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-[#5C665F] dark:text-[#B7C1B8] font-heading font-bold text-base select-none pointer-events-none">
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
            className="w-full h-12 pl-14 pr-4 bg-white dark:bg-[#161B18] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[20px] sm:text-[22px] font-heading font-bold tabular-nums text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all placeholder:text-[#5C665F]/40"
            required
          />
        </div>
        {errors.amount && <p className="mt-1 text-[11px] font-sans font-medium text-[#B94E48] dark:text-[#E06D67] text-left">{errors.amount}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
        {/* Date */}
        <div>
          <label htmlFor="tx-date" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
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
            className="w-full h-11 px-3.5 bg-white dark:bg-[#161B18] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
            required
          />
          {errors.date && <p className="mt-1 text-[11px] font-sans font-medium text-[#B94E48] dark:text-[#E06D67] text-left">{errors.date}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="tx-category" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
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
            className="w-full h-11 px-3.5 bg-white dark:bg-[#161B18] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] outline-none transition-all cursor-pointer"
            required
          >
            {eligibleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === 'en' && c.nameEn ? c.nameEn : c.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-[11px] font-sans font-medium text-[#B94E48] dark:text-[#E06D67] text-left">{errors.category}</p>}
        </div>

        {/* Note */}
        <div className="sm:col-span-2">
          <label htmlFor="tx-note" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
            {t('noteOptional')}
          </label>
          <input
            id="tx-note"
            type="text"
            maxLength={120}
            placeholder={t('transactionNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-11 px-4 bg-white dark:bg-[#161B18] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all placeholder:text-[#5C665F]/40"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E6DF] dark:border-[#28312B]">
        {/* Soft Cancel Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onCancel}
          className="h-11 px-5 rounded-[12px] bg-[#EBF0E8] dark:bg-[#222A25] hover:bg-[#E2E6DF] dark:hover:bg-[#28312B] text-[14px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] transition-all cursor-pointer"
        >
          {t('cancel')}
        </motion.button>
        {/* Primary Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] text-[14px] font-sans font-semibold leading-none shadow-sm transition-all cursor-pointer"
        >
          <AppIcon name="check" size={16} />
          <span>{transaction ? t('update') : t('save')}</span>
        </motion.button>
      </div>
    </form>
  );
};
