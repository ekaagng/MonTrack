import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { Category, TransactionType, Language } from '../types/finance.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

const palette = [
  '#7cae8a',
  '#d99873',
  '#8e9bc8',
  '#c0a36b',
  '#81a7b7',
  '#b58bb2',
  '#87aaa0',
  '#d27d75',
  '#a7b77a',
];

interface CategoryModalProps {
  category?: Category | null;
  existingCategories: Category[];
  lang: Language;
  onSave: (cat: Omit<Category, 'id' | 'isDefault'> & { id?: string }) => void;
  onCancel: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  existingCategories,
  lang,
  onSave,
  onCancel,
}) => {
  const t = (k: string) => getTranslation(k, lang);

  const [name, setName] = useState<string>(category?.name || '');
  const [type, setType] = useState<TransactionType>(category?.type || 'expense');
  const [color, setColor] = useState<string>(category?.color || palette[0]);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('validationRequired'));
      return;
    }

    const duplicate = existingCategories.some(
      (c) =>
        c.id !== category?.id &&
        c.type === type &&
        c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setError(t('categoryDuplicate'));
      return;
    }

    onSave({
      id: category?.id,
      name: trimmed,
      type,
      color,
      icon: category?.icon || 'tag',
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-[#fff0ed] text-[#b84b40] text-xs font-semibold" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="cat-name" className="block text-xs font-bold text-[#455047] mb-1.5">
          {t('categoryName')}
        </label>
        <input
          id="cat-name"
          type="text"
          maxLength={35}
          placeholder={t('categoryNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm font-semibold text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
          required
        />
        <p className="mt-1 text-[11px] text-[#788079]">{t('categoryNameHelp')}</p>
      </div>

      <div>
        <label htmlFor="cat-type" className="block text-xs font-bold text-[#455047] mb-1.5">
          {t('categoryType')}
        </label>
        <select
          id="cat-type"
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="w-full h-11 px-3.5 bg-white border border-[#dfe5dc] rounded-xl text-sm font-semibold text-[#202923] focus:border-[#27694c] focus:ring-2 focus:ring-[#27694c]/10 outline-none transition-all"
        >
          <option value="expense">{t('expenseType')}</option>
          <option value="income">{t('incomeType')}</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#455047] mb-2">
          {t('categoryColor')}
        </label>
        <div className="flex gap-2.5 flex-wrap">
          {palette.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              className="w-8 h-8 rounded-full transition-transform active:scale-95"
              style={{
                backgroundColor: c,
                border: color === c ? '3px solid #202923' : '3px solid white',
                boxShadow: '0 0 0 1px #dfe5dc',
              }}
            />
          ))}
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
          {category ? t('update') : t('save')}
        </motion.button>
      </div>
    </form>
  );
};
