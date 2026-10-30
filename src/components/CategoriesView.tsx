import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { Category, Transaction, Language } from '../types/finance.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface CategoriesViewProps {
  categories: Category[];
  transactions: Transaction[];
  lang: Language;
  onAddCategory: () => void;
  onEditCategory: (c: Category) => void;
  onDeleteCategory: (c: Category) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  transactions,
  lang,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const t = (k: string) => getTranslation(k, lang);

  const usedCategoryIds = useMemo(
    () => new Set(transactions.map((t) => t.categoryId)),
    [transactions]
  );

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'income'),
    [categories]
  );

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );

  const renderCategoryCard = (c: Category) => {
    const inUse = usedCategoryIds.has(c.id);

    return (
      <article
        key={c.id}
        className="p-3.5 sm:p-4 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex items-center justify-between gap-3 shadow-xs"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold shrink-0"
            style={{
              backgroundColor: `${c.color}18`,
              color: c.color,
            }}
          >
            <AppIcon name={c.icon || 'tag'} size={18} />
          </span>
          <div className="min-w-0 text-left">
            <strong className="block text-[14px] sm:text-[15px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] truncate text-left">
              {lang === 'en' && c.nameEn ? c.nameEn : c.name}
            </strong>
            <span className="text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] block mt-0.5 text-left">
              {c.type === 'income' ? t('incomeType') : t('expenseType')} ·{' '}
              {c.isDefault ? t('defaultCategory') : t('customCategory')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onEditCategory(c)}
            aria-label={`${t('edit')}: ${c.name}`}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#EBF6EE] dark:hover:bg-[#14291B] hover:text-[#167C35] dark:hover:text-[#00B000] transition-colors cursor-pointer"
          >
            <AppIcon name="edit" size={15} />
          </motion.button>
          {!c.isDefault && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onDeleteCategory(c)}
              disabled={inUse}
              title={inUse ? t('categoryInUse') : undefined}
              aria-label={`${t('delete')}: ${c.name}`}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[#5C665F] dark:text-[#B7C1B8] hover:bg-[#FDF1F0] dark:hover:bg-[#2F1816] hover:text-[#B94E48] dark:hover:text-[#E06D67] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <AppIcon name="trash" size={15} />
            </motion.button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-[22px] sm:text-[26px] font-heading font-bold tracking-tight leading-[1.25] text-[#171B18] dark:text-[#F0F0F0] text-left">
          {t('navCategories')}
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddCategory}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-[#167C35] hover:bg-[#11632a] dark:bg-[#00B000] dark:hover:bg-[#009900] text-white dark:text-[#131313] text-[14px] font-sans font-semibold leading-none shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <AppIcon name="plus" size={16} />
          <span>{t('addCategory')}</span>
        </motion.button>
      </div>

      {/* Income Categories */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-tight leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
            {t('incomeCategories')}
          </h2>
          <span className="text-[12px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8]">
            {incomeCategories.length} {t('categories').toLowerCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {incomeCategories.map(renderCategoryCard)}
        </div>
      </section>

      {/* Expense Categories */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-tight leading-[1.3] text-[#171B18] dark:text-[#F0F0F0] text-left">
            {t('expenseCategories')}
          </h2>
          <span className="text-[12px] font-sans font-medium text-[#5C665F] dark:text-[#B7C1B8]">
            {expenseCategories.length} {t('categories').toLowerCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {expenseCategories.map(renderCategoryCard)}
        </div>
      </section>

      {/* Hint */}
      <section className="p-4 sm:p-5 bg-white dark:bg-[#1B211D] border border-[#E2E6DF] dark:border-[#28312B] rounded-[16px] flex items-center gap-3 text-[12px] font-sans text-[#5C665F] dark:text-[#B7C1B8] shadow-xs">
        <div className="text-[#167C35] dark:text-[#00B000] shrink-0">
          <AppIcon name="info" size={17} />
        </div>
        <div className="text-left">
          <strong className="block text-[13px] font-sans font-semibold text-[#171B18] dark:text-[#F0F0F0] mb-0.5">{t('addCategory')}</strong>
          <span>{t('addCategoryHint')}</span>
        </div>
      </section>
    </div>
  );
};
