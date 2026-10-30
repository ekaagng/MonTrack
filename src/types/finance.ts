export type TransactionType = 'income' | 'expense';

export type GoalPriority = 'high' | 'medium' | 'low';

export type Language = 'id' | 'en';
export type Theme = 'light' | 'dark';

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Stored as integer IDR
  categoryId: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number; // Stored as integer IDR
  month: string; // YYYY-MM
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number; // Stored as integer IDR
  initialSaved: number;
  monthlyContribution: number;
  targetDate?: string; // YYYY-MM-DD
  priority: GoalPriority;
  note?: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number; // Stored as integer IDR
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface UserProfile {
  name: string;
}

export interface UserSettings {
  language: Language;
  theme?: Theme;
}

export interface AppState {
  profile: UserProfile;
  settings: UserSettings;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  goalContributions: GoalContribution[];
}

export type PageId =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'reports'
  | 'categories'
  | 'settings';
