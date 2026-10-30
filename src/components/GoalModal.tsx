import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { Goal, GoalPriority, Language } from '../types/finance.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface GoalModalProps {
  goal?: Goal | null;
  lang: Language;
  onSave: (g: Omit<Goal, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ goal, lang, onSave, onCancel }) => {
  const t = (k: string) => getTranslation(k, lang);

  const [name, setName] = useState<string>(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState<string>(goal ? String(goal.targetAmount) : '');
  const [initialSaved, setInitialSaved] = useState<string>(goal ? String(goal.initialSaved) : '0');
  const [monthlyContribution, setMonthlyContribution] = useState<string>(
    goal ? String(goal.monthlyContribution) : '0'
  );
  const [targetDate, setTargetDate] = useState<string>(goal?.targetDate || '');
  const [priority, setPriority] = useState<GoalPriority>(goal?.priority || 'medium');
  const [note, setNote] = useState<string>(goal?.note || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('validationRequired');
    }
    const parsedTarget = Math.round(Number(targetAmount));
    if (!parsedTarget || parsedTarget <= 0) {
      newErrors.target = t('validationAmount');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: goal?.id,
      name: name.trim(),
      targetAmount: parsedTarget,
      initialSaved: Math.max(0, Math.round(Number(initialSaved) || 0)),
      monthlyContribution: Math.max(0, Math.round(Number(monthlyContribution) || 0)),
      targetDate: targetDate || undefined,
      priority,
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="goal-name" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
          {t('goalName')}
        </label>
        <input
          id="goal-name"
          type="text"
          maxLength={70}
          placeholder={t('goalNamePlaceholder')}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: '' }));
          }}
          className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all placeholder:text-[#5C665F]/50 dark:placeholder:text-[#B7C1B8]/40"
          required
        />
        {errors.name && <p className="mt-1 text-[11px] font-sans font-medium text-[#B94E48] dark:text-[#E06D67] text-left">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
        <div>
          <label htmlFor="goal-target" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
            {t('targetAmount')} ({lang === 'en' ? 'IDR' : 'Rp'})
          </label>
          <input
            id="goal-target"
            type="number"
            min="1"
            step="1"
            placeholder="0"
            value={targetAmount}
            onChange={(e) => {
              setTargetAmount(e.target.value);
              setErrors((prev) => ({ ...prev, target: '' }));
            }}
            className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium tabular-nums text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
            required
          />
          {errors.target && <p className="mt-1 text-[11px] font-sans font-medium text-[#B94E48] dark:text-[#E06D67] text-left">{errors.target}</p>}
        </div>

        <div>
          <label htmlFor="goal-initial" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
            {t('initialSaved')} ({lang === 'en' ? 'IDR' : 'Rp'})
          </label>
          <input
            id="goal-initial"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={initialSaved}
            onChange={(e) => setInitialSaved(e.target.value)}
            className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium tabular-nums text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="goal-monthly" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
            {t('monthlyContribution')} ({lang === 'en' ? 'IDR' : 'Rp'})
          </label>
          <input
            id="goal-monthly"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium tabular-nums text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="goal-date" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
            {t('targetDate')} ({t('optional')})
          </label>
          <input
            id="goal-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="goal-priority" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
            {t('priority')}
          </label>
          <select
            id="goal-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as GoalPriority)}
            className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
          >
            <option value="high">{t('priorityHigh')}</option>
            <option value="medium">{t('priorityMedium')}</option>
            <option value="low">{t('priorityLow')}</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="goal-note" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
            {t('goalNote')} ({t('optional')})
          </label>
          <textarea
            id="goal-note"
            rows={2}
            maxLength={180}
            placeholder={t('goalNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all resize-none placeholder:text-[#5C665F]/50 dark:placeholder:text-[#B7C1B8]/40"
          />
        </div>
      </div>

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
          <span>{goal ? t('update') : t('save')}</span>
        </motion.button>
      </div>
    </form>
  );
};
