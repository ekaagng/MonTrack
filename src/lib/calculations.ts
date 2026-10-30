import type {
  Transaction,
  Budget,
  Goal,
  GoalContribution,
  Category,
  Language,
} from '../types/finance.ts';

export function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function currentMonth(): string {
  return todayISO().slice(0, 7);
}

export function monthLabel(month: string = currentMonth(), lang: Language = 'id'): string {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) return month;
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, 1));
}

export function formatDisplayDate(
  dateStr?: string,
  lang: Language = 'id',
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  if (!dateStr) return '—';
  const dt = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(dt.getTime())) return '—';
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'id-ID', opts).format(dt);
}

export function formatMoney(amount: number, lang: Language = 'id'): string {
  const num = Math.round(Number(amount) || 0);
  const abs = Math.abs(num);
  const formattedNumber = abs.toLocaleString('id-ID');
  const prefix = lang === 'en' ? 'IDR\u00A0' : 'Rp\u00A0';
  return (num < 0 ? '−' : '') + prefix + formattedNumber;
}

export function shortMoney(amount: number, lang: Language = 'id'): string {
  const abs = Math.abs(amount);
  const locale = lang === 'en' ? 'en-US' : 'id-ID';
  if (abs >= 1_000_000_000) {
    return (
      (amount / 1_000_000_000).toLocaleString(locale, { maximumFractionDigits: 1 }) + ' M'
    );
  }
  if (abs >= 1_000_000) {
    return (
      (amount / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 }) +
      (lang === 'en' ? 'M' : ' jt')
    );
  }
  if (abs >= 1_000) {
    return (
      (amount / 1_000).toLocaleString(locale, { maximumFractionDigits: 0 }) +
      (lang === 'en' ? 'k' : ' rb')
    );
  }
  return formatMoney(amount, lang);
}

export function calculateTotals(transactions: Transaction[]): {
  income: number;
  expenses: number;
  net: number;
} {
  return transactions.reduce(
    (acc, tx) => {
      const amt = Math.round(Number(tx.amount) || 0);
      if (tx.type === 'income') {
        acc.income += amt;
      } else if (tx.type === 'expense') {
        acc.expenses += amt;
      }
      acc.net = acc.income - acc.expenses;
      return acc;
    },
    { income: 0, expenses: 0, net: 0 }
  );
}

export function calculateCategoryExpenses(
  categoryId: string,
  transactions: Transaction[],
  month?: string
): number {
  return transactions
    .filter((tx) => {
      if (tx.type !== 'expense' || tx.categoryId !== categoryId) return false;
      if (month && (!tx.date || !tx.date.startsWith(month))) return false;
      return true;
    })
    .reduce((sum, tx) => sum + Math.round(Number(tx.amount) || 0), 0);
}

export function calculateBudgetUsage(
  budget: Budget,
  transactions: Transaction[]
): {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'on_track' | 'near_limit' | 'over_budget';
} {
  const budgetAmount = Math.max(0, Math.round(budget.amount));
  const spent = calculateCategoryExpenses(budget.categoryId, transactions, budget.month);
  const remaining = budgetAmount - spent;
  const ratio = budgetAmount > 0 ? spent / budgetAmount : 0;
  const percentage = Math.round(ratio * 100);

  let status: 'on_track' | 'near_limit' | 'over_budget' = 'on_track';
  if (ratio > 1) {
    status = 'over_budget';
  } else if (ratio >= 0.8) {
    status = 'near_limit';
  }

  return { spent, remaining, percentage, status };
}

export function calculateGoalProgress(
  goal: Goal,
  contributions: GoalContribution[]
): {
  currentSaved: number;
  remaining: number;
  percentage: number;
  etaMonths: number | null;
  isCompleted: boolean;
} {
  const initial = Math.max(0, Math.round(goal.initialSaved || 0));
  const target = Math.max(0, Math.round(goal.targetAmount || 0));
  const added = contributions
    .filter((c) => c.goalId === goal.id)
    .reduce((sum, c) => sum + Math.max(0, Math.round(Number(c.amount) || 0)), 0);

  const currentSaved = initial + added;
  const remaining = Math.max(0, target - currentSaved);
  const percentage = target > 0 ? Math.min(100, Math.round((currentSaved / target) * 100)) : 100;
  const isCompleted = currentSaved >= target && target > 0;

  let etaMonths: number | null = null;
  const monthly = Math.round(goal.monthlyContribution || 0);
  if (isCompleted) {
    etaMonths = 0;
  } else if (monthly > 0 && remaining > 0) {
    etaMonths = Math.ceil(remaining / monthly);
  }

  return { currentSaved, remaining, percentage, etaMonths, isCompleted };
}

export function escapeCsvField(val: unknown): string {
  const s = String(val ?? '');
  // Escape potential spreadsheet formulas starting with =, +, -, @
  let safe = s;
  if (/^[=+\-@]/.test(safe)) {
    safe = `'${safe}`;
  }
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function exportTransactionsToCsv(
  transactions: Transaction[],
  categories: Category[],
  headers: {
    date: string;
    type: string;
    category: string;
    note: string;
    amount: string;
    incomeType: string;
    expenseType: string;
  }
): string {
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  const rows = [
    [headers.date, headers.type, headers.category, headers.note, headers.amount],
    ...transactions.map((tx) => {
      const cat = categoryMap.get(tx.categoryId);
      const catName = cat?.name || '—';
      const typeLabel = tx.type === 'income' ? headers.incomeType : headers.expenseType;
      return [tx.date, typeLabel, catName, tx.note || '', tx.amount];
    }),
  ];

  const csvBody = rows.map((r) => r.map(escapeCsvField).join(',')).join('\r\n');
  return '\ufeff' + csvBody; // Prefix UTF-8 BOM for Microsoft Excel
}

export function chartWeeklyData(
  transactions: Transaction[],
  monthStr: string = currentMonth()
): Array<{ label: string; income: number; expenses: number }> {
  const [year, month] = monthStr.split('-').map(Number);
  const weeks = Array.from({ length: 6 }, (_, i) => ({
    label: `M${i + 1}`,
    income: 0,
    expenses: 0,
  }));

  transactions
    .filter((tx) => {
      if (!tx.date || !tx.date.startsWith(monthStr)) return false;
      const d = new Date(`${tx.date}T12:00:00`);
      return d.getFullYear() === year && d.getMonth() === month - 1;
    })
    .forEach((tx) => {
      const day = Number(tx.date.slice(8, 10));
      const idx = Math.min(5, Math.floor((day - 1) / 5));
      const amt = Math.round(Number(tx.amount) || 0);
      if (tx.type === 'income') {
        weeks[idx].income += amt;
      } else {
        weeks[idx].expenses += amt;
      }
    });

  return weeks;
}
