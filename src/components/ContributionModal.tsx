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
        <div className="p-3 rounded-xl bg-[#fff0ed] text-[#b84b40] text-xs font-semibold" role="alert">
          {error}
        </div>
      )}

      <div className="p-3 bg-[#f8faf6] border border-[#e8ece5] rounded-xl text-xs text-[#455047]">
        <strong className="block text-sm font-bold text-[#202923] mb-0.5">{goal.name}</strong>
        <span>
          {t('savedSoFar')}: {formatMoney(currentSaved, lang)} · {t('goalRemaining')}:{' '}
          {formatMoney(remaining, lang)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="contrib-amount" className="block text-xs font-bold text-[#455047] mb-1.5">
            {t('goalContribution')} (IDR)
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
            className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm font-semibold text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contrib-date" className="block text-xs font-bold text-[#455047] mb-1.5">
            {t('date')}
          </label>
          <input
            id="contrib-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm font-semibold text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contrib-note" className="block text-xs font-bold text-[#455047] mb-1.5">
            {t('noteOptional')}
          </label>
          <input
            id="contrib-note"
            type="text"
            maxLength={120}
            placeholder={t('noteOptional')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
          />
        </div>
      </div>

      <p className="text-[11px] text-[#788079] leading-relaxed">
        {t('contributionHint')}
      </p>

      <div className="flex justify-end gap-2.5 pt-4 border-t border-[#edf0eb] dark:border-[#2a342c]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-[#dfe5dc] dark:border-[#2a342c] bg-white dark:bg-[#181c19] hover:bg-[#f8faf6] dark:hover:bg-[#232924] text-xs font-bold text-[#435047] dark:text-[#c4cec6] transition-all"
        >
          {t('cancel')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#27694c] hover:bg-[#174d36] text-white text-xs font-bold shadow-[0_5px_14px_rgba(39,105,76,0.22)] transition-all"
        >
          <AppIcon name="check" size={15} />
          {t('contribute')}
        </motion.button>
      </div>
    </form>
  );
};
