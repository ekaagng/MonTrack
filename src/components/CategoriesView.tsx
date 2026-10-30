import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { Category, Transaction, Budget, Language } from '../types/finance.ts';
import { AppIcon } from './icons.tsx';
import { getTranslation } from '../i18n/translations.ts';

interface CategoriesViewProps {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  lang: Language;
  onAddCategory: () => void;
  onEditCategory: (c: Category) => void;
  onDeleteCategory: (c: Category) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  transactions,
  budgets,
  lang,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const t = (k: string) => getTranslation(k, lang);

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'income'),
    [categories]
  );
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );

  const isCategoryInUse = (catId: string) => {
    return (
      transactions.some((tx) => tx.categoryId === catId) ||
      budgets.some((b) => b.categoryId === catId)
    );
  };

  const renderCategoryCard = (c: Category) => {
    const inUse = isCategoryInUse(c.id);
    return (
      <article
        key={c.id}
        className="p-4 bg-white border border-[#e7ebe4] rounded-[16px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] flex items-center justify-between gap-3"
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
            <strong className="block text-[14px] sm:text-[15px] font-sans font-semibold text-[#1a1c19] dark:text-[#eef1ec] truncate">
              {lang === 'en' && c.nameEn ? c.nameEn : c.name}
            </strong>
            <span className="text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2] block mt-0.5">
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
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#707972] dark:text-[#a0aba2] hover:bg-[#e9f3ec] dark:hover:bg-[#1a3424] hover:text-[#27694c] dark:hover:text-[#52ba88] transition-colors"
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
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[#707972] dark:text-[#a0aba2] hover:bg-[#fff0ed] dark:hover:bg-[#381a17] hover:text-[#b84b40] dark:hover:text-[#e87063] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#27694c] dark:text-[#52ba88] mb-1.5 text-left">
            <span className="w-4 h-0.5 bg-[#27694c] dark:bg-[#52ba88] rounded-full" />
            <span>{t('navCategories')}</span>
          </div>
          <h1 className="text-[22px] sm:text-[26px] font-heading font-black tracking-[-0.02em] leading-[1.25] text-[#1a1c19] dark:text-[#eef1ec] text-left">
            {t('navCategories')}
          </h1>
          <p className="mt-1 text-[13px] sm:text-[14px] font-sans text-[#606c64] dark:text-[#a0aba2] leading-[1.45] text-left">
            {t('categoryPageIntro')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddCategory}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-[12px] bg-[#27694c] hover:bg-[#174d36] text-white text-[14px] font-sans font-semibold leading-none shadow-[0_4px_16px_rgba(39,105,76,0.22)] transition-all shrink-0"
        >
          <AppIcon name="plus" size={16} />
          <span>{t('addCategory')}</span>
        </motion.button>
      </div>

      {/* Income Categories */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">
            {t('incomeCategories')}
          </h2>
          <span className="text-[12px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2]">
            {incomeCategories.length} {t('categories').toLowerCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {incomeCategories.map(renderCategoryCard)}
        </div>
      </section>

      {/* Expense Categories */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[16px] sm:text-[18px] font-heading font-bold tracking-[-0.01em] leading-[1.3] text-[#1a1c19] dark:text-[#eef1ec] text-left">
            {t('expenseCategories')}
          </h2>
          <span className="text-[12px] font-sans font-medium text-[#606c64] dark:text-[#a0aba2]">
            {expenseCategories.length} {t('categories').toLowerCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {expenseCategories.map(renderCategoryCard)}
        </div>
      </section>

      {/* Hint */}
      <section className="p-4 sm:p-5 bg-white border border-[#e7ebe4] rounded-[16px] sm:rounded-[20px] shadow-[0_2px_6px_-1px_rgba(39,105,76,0.04)] flex items-center gap-3 text-[12px] font-sans text-[#606c64] dark:text-[#a0aba2]">
        <div className="text-[#27694c] dark:text-[#52ba88] shrink-0">
          <AppIcon name="info" size={17} />
        </div>
        <div className="text-left">
          <strong className="block text-[13px] font-heading font-bold text-[#1a1c19] dark:text-[#eef1ec] mb-0.5">{t('addCategory')}</strong>
          <span>{t('addCategoryHint')}</span>
        </div>
      </section>
    </div>
  );
};
