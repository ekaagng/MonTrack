import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { Goal, Language } from '../types/finance.ts';
import { todayISO, formatMoney } from '../lib/calculations.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface ContributionModalProps {
  goal: Goal;
  currentSaved: number;
  lang: Language;
  onSave: (amount: number, date: string, note?: string) => void;
  onCancel: () => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  goal,
  currentSaved,
  lang,
  onSave,
  onCancel,
}) => {
  const t = (k: string) => getTranslation(k, lang);
  const remaining = Math.max(0, goal.targetAmount - currentSaved);

  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(todayISO());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = Math.round(Number(amount));
    if (!parsedAmount || parsedAmount <= 0) {
      setError(t('validationAmount'));
      return;
    }
    if (parsedAmount > remaining && remaining > 0) {
      setError(`${t('validationAmount')} (Maks: ${formatMoney(remaining, lang)})`);
      return;
    }

    onSave(parsedAmount, date, note.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div className="p-3 rounded-[12px] bg-[#FDF1F0] dark:bg-[#2F1816] text-[#B94E48] dark:text-[#E06D67] text-[12px] font-sans font-medium text-left" role="alert">
          {error}
        </div>
      )}

      <div className="p-3.5 bg-[#EBF0E8] dark:bg-[#222A25] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-left">
        <strong className="block text-[15px] font-heading font-bold text-[#171B18] dark:text-[#F0F0F0] mb-1">
          {goal.name}
        </strong>
        <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] tabular-nums">
          {t('savedSoFar')}: {formatMoney(currentSaved, lang)} · {t('goalRemaining')}:{' '}
          {formatMoney(remaining, lang)}
        </span>
      </div>

      <div className="space-y-3.5">
        <div>
          <label htmlFor="contrib-amount" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
            {t('goalContribution')} ({lang === 'en' ? 'IDR' : 'Rp'})
          </label>
          <input
            id="contrib-amount"
            type="number"
            min="1"
            max={remaining > 0 ? remaining : undefined}
            step="1"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium tabular-nums text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all placeholder:text-[#5C665F]/50 dark:placeholder:text-[#B7C1B8]/40"
            required
          />
        </div>

        <div>
          <label htmlFor="contrib-date" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
            {t('date')}
          </label>
          <input
            id="contrib-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="contrib-note" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
            {t('noteOptional')}
          </label>
          <input
            id="contrib-note"
            type="text"
            maxLength={120}
            placeholder={t('noteOptional')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all placeholder:text-[#5C665F]/50 dark:placeholder:text-[#B7C1B8]/40"
          />
        </div>
      </div>

      <p className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] leading-relaxed text-left">
        {t('contributionHint')}
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
          <span>{t('contribute')}</span>
        </motion.button>
      </div>
    </form>
  );
};
