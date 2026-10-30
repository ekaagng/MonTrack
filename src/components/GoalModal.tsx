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
        <label htmlFor="goal-name" className="block text-xs font-bold text-[#455047] mb-1.5">
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
          className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm font-semibold text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
          required
        />
        {errors.name && <p className="mt-1 text-[11px] text-[#b84b40]">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="goal-target" className="block text-xs font-bold text-[#455047] mb-1.5">
            {t('targetAmount')} (IDR)
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
            className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm font-semibold text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
            required
          />
          {errors.target && <p className="mt-1 text-[11px] text-[#b84b40]">{errors.target}</p>}
        </div>

        <div>
          <label htmlFor="goal-initial" className="block text-xs font-bold text-[#455047] mb-1.5">
            {t('initialSaved')} (IDR)
          </label>
          <input
            id="goal-initial"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={initialSaved}
            onChange={(e) => setInitialSaved(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm font-semibold text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="goal-monthly" className="block text-xs font-bold text-[#455047] mb-1.5">
            {t('monthlyContribution')} (IDR)
          </label>
          <input
            id="goal-monthly"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm font-semibold text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="goal-date" className="block text-xs font-bold text-[#455047] mb-1.5">
            {t('targetDate')} ({t('optional')})
          </label>
          <input
            id="goal-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm font-semibold text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="goal-priority" className="block text-xs font-bold text-[#455047] mb-1.5">
            {t('priority')}
          </label>
          <select
            id="goal-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as GoalPriority)}
            className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm font-semibold text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
          >
            <option value="high">{t('priorityHigh')}</option>
            <option value="medium">{t('priorityMedium')}</option>
            <option value="low">{t('priorityLow')}</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="goal-note" className="block text-xs font-bold text-[#455047] mb-1.5">
            {t('goalNote')} ({t('optional')})
          </label>
          <textarea
            id="goal-note"
            rows={2}
            maxLength={180}
            placeholder={t('goalNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 bg-white border border-[#dfe5dc] rounded-xl text-sm text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all resize-none"
          />
        </div>
      </div>

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
          {goal ? t('update') : t('save')}
        </motion.button>
      </div>
    </form>
  );
};
