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
        <div className="p-3 rounded-[12px] bg-[#FDF1F0] dark:bg-[#2F1816] text-[#B94E48] dark:text-[#E06D67] text-[12px] font-sans font-medium text-left" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="cat-name" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
          {t('categoryName')}
        </label>
        <input
          id="cat-name"
          type="text"
          maxLength={35}
          placeholder={t('categoryNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all placeholder:text-[#5C665F]/50 dark:placeholder:text-[#B7C1B8]/40"
          required
        />
        <p className="mt-1 text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] text-left">{t('categoryNameHelp')}</p>
      </div>

      <div>
        <label htmlFor="cat-type" className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-1.5 text-left">
          {t('categoryType')}
        </label>
        <select
          id="cat-type"
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="w-full h-11 px-3.5 bg-white dark:bg-[#131313] border border-[#E2E6DF] dark:border-[#28312B] rounded-[12px] text-[14px] font-sans font-medium text-[#171B18] dark:text-[#F0F0F0] focus:border-[#167C35] dark:focus:border-[#00B000] focus:ring-[3px] focus:ring-[#EBF6EE] dark:focus:ring-[#14291B] outline-none transition-all"
        >
          <option value="expense">{t('expenseType')}</option>
          <option value="income">{t('incomeType')}</option>
        </select>
      </div>

      <div>
        <label className="block text-[12px] sm:text-[13px] font-sans font-medium tracking-wider text-[#5C665F] dark:text-[#B7C1B8] uppercase mb-2 text-left">
          {t('categoryColor')}
        </label>
        <div className="flex gap-2.5 flex-wrap">
          {palette.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              className="w-8 h-8 rounded-full transition-transform active:scale-95 cursor-pointer"
              style={{
                backgroundColor: c,
                border: color === c ? '3px solid #167C35' : '3px solid white',
                boxShadow: '0 0 0 1px #E2E6DF',
              }}
            />
          ))}
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
          <span>{category ? t('update') : t('save')}</span>
        </motion.button>
      </div>
    </form>
  );
};
