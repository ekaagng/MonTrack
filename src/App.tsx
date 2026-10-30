/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type {
  AppState,
  PageId,
  Transaction,
  Budget,
  Goal,
  Category,
  Language,
  Theme,
} from './types/finance.ts';
import { getSeedData } from './data/seedData.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { Topbar } from './components/Topbar.tsx';
import { ToastRegion, type ToastMessage } from './components/Toast.tsx';
import { ModalDialog } from './components/ModalDialog.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { BudgetModal } from './components/BudgetModal.tsx';
import { GoalModal } from './components/GoalModal.tsx';
import { ContributionModal } from './components/ContributionModal.tsx';
import { CategoryModal } from './components/CategoryModal.tsx';
import { ConfirmModal } from './components/ConfirmModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { BudgetsView } from './components/BudgetsView.tsx';
import { GoalsView } from './components/GoalsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { CategoriesView } from './components/CategoriesView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { getTranslation } from './i18n/translations.ts';

const STORAGE_KEY = 'money-tracker-v1';

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          Array.isArray(parsed.transactions) &&
          Array.isArray(parsed.categories) &&
          Array.isArray(parsed.budgets) &&
          Array.isArray(parsed.goals)
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load saved state from localStorage:', e);
    }
    return getSeedData();
  });

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.settings?.theme === 'dark' || parsed?.settings?.theme === 'light') {
          return parsed.settings.theme;
        }
      }
      const direct = localStorage.getItem('money-tracker-theme');
      if (direct === 'dark' || direct === 'light') {
        return direct;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      // fallback
    }
    return 'light';
  });

  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal states
  type ModalType =
    | null
    | 'transaction'
    | 'budget'
    | 'goal'
    | 'contribution'
    | 'category'
    | 'confirmDeleteTx'
    | 'confirmDeleteBudget'
    | 'confirmDeleteGoal'
    | 'confirmDeleteCategory'
    | 'confirmReset';

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [activeContributionGoal, setActiveContributionGoal] = useState<Goal | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; label: string } | null>(null);

  const lang = state.settings.language || 'id';
  const t = (k: string) => getTranslation(k, lang);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  }, [state]);

  // Sync theme to DOM and localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem('money-tracker-theme', theme);
    } catch (e) {
      // Ignore
    }
  }, [theme]);

  // Update HTML title & lang
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `Money Tracker — ${t('navDashboard')}`;
  }, [lang]);

  const showToast = (title: string, detail?: string, kind: 'success' | 'error' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      detail,
      kind,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLanguageChange = (newLang: Language) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, language: newLang },
    }));
    showToast(t('languageUpdated'));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      setState((s) => ({
        ...s,
        settings: {
          ...s.settings,
          theme: next,
        },
      }));
      return next;
    });
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        theme: newTheme,
      },
    }));
  };

  const handleProfileUpdate = (name: string) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, name },
    }));
  };

  // Transaction mutations
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (txData.id) {
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.map((tx) =>
          tx.id === txData.id ? { ...tx, ...txData } : tx
        ),
      }));
      showToast(t('transactionUpdated'));
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        transactions: [newTx, ...prev.transactions],
      }));
      showToast(t('transactionAdded'));
    }
    setActiveModal(null);
    setEditingTransaction(null);
  };

  const handleConfirmDeleteTx = () => {
    if (!itemToDelete) return;
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== itemToDelete.id),
    }));
    showToast(t('transactionDeleted'));
    setActiveModal(null);
    setItemToDelete(null);
  };

  // Budget mutations
  const handleSaveBudget = (budgetData: Omit<Budget, 'id'> & { id?: string }) => {
    if (budgetData.id) {
      setState((prev) => ({
        ...prev,
        budgets: prev.budgets.map((b) =>
          b.id === budgetData.id ? { ...b, ...budgetData } : b
        ),
      }));
    } else {
      const newBudget: Budget = {
        ...budgetData,
        id: `bdg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
      setState((prev) => ({
        ...prev,
        budgets: [...prev.budgets, newBudget],
      }));
    }
    showToast(t('budgetSaved'));
    setActiveModal(null);
    setEditingBudget(null);
  };

  const handleConfirmDeleteBudget = () => {
    if (!itemToDelete) return;
    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.id !== itemToDelete.id),
    }));
    showToast(t('budgetDelete'));
    setActiveModal(null);
    setItemToDelete(null);
  };

  // Goal mutations
  const handleSaveGoal = (goalData: Omit<Goal, 'id'> & { id?: string }) => {
    if (goalData.id) {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => (g.id === goalData.id ? { ...g, ...goalData } : g)),
      }));
      showToast(t('goalUpdated'));
    } else {
      const newGoal: Goal = {
        ...goalData,
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
      setState((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal],
      }));
      showToast(t('goalAdded'));
    }
    setActiveModal(null);
    setEditingGoal(null);
  };

  const handleConfirmDeleteGoal = () => {
    if (!itemToDelete) return;
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== itemToDelete.id),
      goalContributions: prev.goalContributions.filter((c) => c.goalId !== itemToDelete.id),
    }));
    showToast(t('goalDeleted'));
    setActiveModal(null);
    setItemToDelete(null);
  };

  const handleSaveContribution = (amount: number, date: string, note?: string) => {
    if (!activeContributionGoal) return;
    const newContrib = {
      id: `contrib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      goalId: activeContributionGoal.id,
      amount,
      date,
      note,
    };
    setState((prev) => ({
      ...prev,
      goalContributions: [...prev.goalContributions, newContrib],
    }));
    showToast(t('contributionSaved'));
    setActiveModal(null);
    setActiveContributionGoal(null);
  };

  // Category mutations
  const handleSaveCategory = (
    catData: Omit<Category, 'id' | 'isDefault'> & { id?: string }
  ) => {
    if (catData.id) {
      setState((prev) => ({
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === catData.id ? { ...c, ...catData } : c
        ),
      }));
      showToast(t('categoryUpdated'));
    } else {
      const newCat: Category = {
        ...catData,
        id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        isDefault: false,
      };
      setState((prev) => ({
        ...prev,
        categories: [...prev.categories, newCat],
      }));
      showToast(t('categoryAdded'));
    }
    setActiveModal(null);
    setEditingCategory(null);
  };

  const handleConfirmDeleteCategory = () => {
    if (!itemToDelete) return;
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== itemToDelete.id),
    }));
    showToast(t('categoryDeleted'));
    setActiveModal(null);
    setItemToDelete(null);
  };

  // Reset Demo
  const handleConfirmReset = () => {
    const fresh = getSeedData();
    setState(fresh);
    localStorage.removeItem(STORAGE_KEY);
    showToast(t('dataReset'));
    setActiveModal(null);
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F2] dark:bg-[#131313] text-[#171B18] dark:text-[#F0F0F0] flex flex-col md:flex-row pb-20 md:pb-0 transition-colors duration-150">
      {/* Toast Notification Region */}
      <ToastRegion
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        currentPage={currentPage}
        profile={state.profile}
        lang={lang}
        isOpenMobile={isMobileMenuOpen}
        onNavigate={handleNavigate}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Viewport: 1200px max width, 32px desktop padding, 16px mobile padding */}
      <main className="flex-1 min-w-0 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 max-w-[1200px] mx-auto w-full overflow-x-hidden">
        {/* Top Header */}
        <Topbar
          currentPage={currentPage}
          lang={lang}
          theme={theme}
          onLanguageChange={handleLanguageChange}
          onToggleTheme={handleToggleTheme}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onQuickAdd={() => {
            setEditingTransaction(null);
            setActiveModal('transaction');
          }}
        />

        {/* View Router with Fluid Blur Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentPage === 'dashboard' && (
              <DashboardView
                state={state}
                lang={lang}
                onNavigate={handleNavigate}
                onAddTransaction={() => {
                  setEditingTransaction(null);
                  setActiveModal('transaction');
                }}
                onAddBudget={() => {
                  setEditingBudget(null);
                  setActiveModal('budget');
                }}
                onAddGoal={() => {
                  setEditingGoal(null);
                  setActiveModal('goal');
                }}
              />
            )}

            {currentPage === 'transactions' && (
              <TransactionsView
                transactions={state.transactions}
                categories={state.categories}
                lang={lang}
                onAddTransaction={() => {
                  setEditingTransaction(null);
                  setActiveModal('transaction');
                }}
                onEditTransaction={(tx) => {
                  setEditingTransaction(tx);
                  setActiveModal('transaction');
                }}
                onDeleteTransaction={(tx) => {
                  const cat = state.categories.find((c) => c.id === tx.categoryId);
                  setItemToDelete({
                    id: tx.id,
                    label: `${tx.note || cat?.name || t('transactions')} (${tx.date})`,
                  });
                  setActiveModal('confirmDeleteTx');
                }}
              />
            )}

            {currentPage === 'budgets' && (
              <BudgetsView
                budgets={state.budgets}
                categories={state.categories}
                transactions={state.transactions}
                lang={lang}
                onAddBudget={() => {
                  setEditingBudget(null);
                  setActiveModal('budget');
                }}
                onEditBudget={(b) => {
                  setEditingBudget(b);
                  setActiveModal('budget');
                }}
                onDeleteBudget={(b) => {
                  const cat = state.categories.find((c) => c.id === b.categoryId);
                  setItemToDelete({
                    id: b.id,
                    label: `${cat?.name || t('budgets')} (${b.month})`,
                  });
                  setActiveModal('confirmDeleteBudget');
                }}
              />
            )}

            {currentPage === 'goals' && (
              <GoalsView
                goals={state.goals}
                contributions={state.goalContributions}
                lang={lang}
                onAddGoal={() => {
                  setEditingGoal(null);
                  setActiveModal('goal');
                }}
                onEditGoal={(g) => {
                  setEditingGoal(g);
                  setActiveModal('goal');
                }}
                onDeleteGoal={(g) => {
                  setItemToDelete({ id: g.id, label: g.name });
                  setActiveModal('confirmDeleteGoal');
                }}
                onContributeGoal={(g) => {
                  setActiveContributionGoal(g);
                  setActiveModal('contribution');
                }}
              />
            )}

            {currentPage === 'reports' && (
              <ReportsView
                transactions={state.transactions}
                categories={state.categories}
                lang={lang}
                onNavigateTransactions={() => handleNavigate('transactions')}
                onShowToast={showToast}
              />
            )}

            {currentPage === 'categories' && (
              <CategoriesView
                categories={state.categories}
                transactions={state.transactions}
                lang={lang}
                onAddCategory={() => {
                  setEditingCategory(null);
                  setActiveModal('category');
                }}
                onEditCategory={(c) => {
                  setEditingCategory(c);
                  setActiveModal('category');
                }}
                onDeleteCategory={(c) => {
                  setItemToDelete({ id: c.id, label: c.name });
                  setActiveModal('confirmDeleteCategory');
                }}
              />
            )}

            {currentPage === 'settings' && (
              <SettingsView
                profile={state.profile}
                lang={lang}
                theme={theme}
                onUpdateProfile={handleProfileUpdate}
                onUpdateLanguage={handleLanguageChange}
                onUpdateTheme={handleSetTheme}
                onRequestReset={() => setActiveModal('confirmReset')}
                onShowToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <footer className="mt-12 text-center text-[10px] text-[#9aa298]">
          {t('footerNote')}
        </footer>
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav
        currentPage={currentPage}
        lang={lang}
        onNavigate={handleNavigate}
        onAddTransaction={() => {
          setEditingTransaction(null);
          setActiveModal('transaction');
        }}
      />

      {/* Modal Dialogs */}
      {/* 1. Transaction Modal */}
      <ModalDialog
        isOpen={activeModal === 'transaction'}
        onClose={() => {
          setActiveModal(null);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? t('modalTxEdit') : t('modalTxAdd')}
        subtitle={t('modalTxSub')}
      >
        <TransactionModal
          transaction={editingTransaction}
          categories={state.categories}
          lang={lang}
          onSave={handleSaveTransaction}
          onCancel={() => {
            setActiveModal(null);
            setEditingTransaction(null);
          }}
        />
      </ModalDialog>

      {/* 2. Budget Modal */}
      <ModalDialog
        isOpen={activeModal === 'budget'}
        onClose={() => {
          setActiveModal(null);
          setEditingBudget(null);
        }}
        title={editingBudget ? t('editBudget') : t('addBudgetPage')}
        subtitle={t('budgetPageIntro')}
      >
        <BudgetModal
          budget={editingBudget}
          categories={state.categories}
          existingBudgets={state.budgets}
          lang={lang}
          onSave={handleSaveBudget}
          onCancel={() => {
            setActiveModal(null);
            setEditingBudget(null);
          }}
        />
      </ModalDialog>

      {/* 3. Goal Modal */}
      <ModalDialog
        isOpen={activeModal === 'goal'}
        onClose={() => {
          setActiveModal(null);
          setEditingGoal(null);
        }}
        title={editingGoal ? t('modalGoalEdit') : t('modalGoalAdd')}
        subtitle={t('goalPageIntro')}
      >
        <GoalModal
          goal={editingGoal}
          lang={lang}
          onSave={handleSaveGoal}
          onCancel={() => {
            setActiveModal(null);
            setEditingGoal(null);
          }}
        />
      </ModalDialog>

      {/* 4. Contribution Modal */}
      {activeContributionGoal && (
        <ModalDialog
          isOpen={activeModal === 'contribution'}
          onClose={() => {
            setActiveModal(null);
            setActiveContributionGoal(null);
          }}
          title={t('addContribution')}
          subtitle={activeContributionGoal.name}
        >
          <ContributionModal
            goal={activeContributionGoal}
            currentSaved={
              activeContributionGoal.initialSaved +
              state.goalContributions
                .filter((c) => c.goalId === activeContributionGoal.id)
                .reduce((s, c) => s + c.amount, 0)
            }
            lang={lang}
            onSave={handleSaveContribution}
            onCancel={() => {
              setActiveModal(null);
              setActiveContributionGoal(null);
            }}
          />
        </ModalDialog>
      )}

      {/* 5. Category Modal */}
      <ModalDialog
        isOpen={activeModal === 'category'}
        onClose={() => {
          setActiveModal(null);
          setEditingCategory(null);
        }}
        title={editingCategory ? t('modalCategoryEdit') : t('modalCategoryAdd')}
        subtitle={t('addCategoryHint')}
      >
        <CategoryModal
          category={editingCategory}
          existingCategories={state.categories}
          lang={lang}
          onSave={handleSaveCategory}
          onCancel={() => {
            setActiveModal(null);
            setEditingCategory(null);
          }}
        />
      </ModalDialog>

      {/* 6. Confirm Delete Modals */}
      <ModalDialog
        isOpen={
          activeModal === 'confirmDeleteTx' ||
          activeModal === 'confirmDeleteBudget' ||
          activeModal === 'confirmDeleteGoal' ||
          activeModal === 'confirmDeleteCategory'
        }
        onClose={() => {
          setActiveModal(null);
          setItemToDelete(null);
        }}
        title={t('confirmDelete')}
      >
        <ConfirmModal
          title={t('confirmDelete')}
          description={
            activeModal === 'confirmDeleteTx'
              ? t('confirmDeleteTx')
              : 'Tindakan ini tidak dapat dibatalkan.'
          }
          itemLabel={itemToDelete?.label}
          confirmLabel={t('delete')}
          isDestructive={true}
          onConfirm={() => {
            if (activeModal === 'confirmDeleteTx') handleConfirmDeleteTx();
            if (activeModal === 'confirmDeleteBudget') handleConfirmDeleteBudget();
            if (activeModal === 'confirmDeleteGoal') handleConfirmDeleteGoal();
            if (activeModal === 'confirmDeleteCategory') handleConfirmDeleteCategory();
          }}
          onCancel={() => {
            setActiveModal(null);
            setItemToDelete(null);
          }}
        />
      </ModalDialog>

      {/* 7. Confirm Reset Modal */}
      <ModalDialog
        isOpen={activeModal === 'confirmReset'}
        onClose={() => setActiveModal(null)}
        title={t('resetConfirm')}
        subtitle={t('resetConfirmDetail')}
      >
        <ConfirmModal
          title={t('resetConfirm')}
          description={t('resetConfirmDetail')}
          confirmLabel={t('reset')}
          isDestructive={true}
          onConfirm={handleConfirmReset}
          onCancel={() => setActiveModal(null)}
        />
      </ModalDialog>
    </div>
  );
}
