import type { AppState, Category, Transaction } from '../types/finance.ts';
import { currentMonth } from '../lib/calculations.ts';

export function getSeedData(): AppState {
  const m = currentMonth();
  const day = (n: number) => `${m}-${String(n).padStart(2, '0')}`;

  const categories: Category[] = [
    { id: 'cat-salary', name: 'Gaji', nameEn: 'Salary', type: 'income', color: '#7cae8a', icon: 'briefcase', isDefault: true },
    { id: 'cat-side', name: 'Freelance', nameEn: 'Freelance', type: 'income', color: '#81a7b7', icon: 'money', isDefault: true },
    { id: 'cat-gift', name: 'Hadiah', nameEn: 'Gifts', type: 'income', color: '#b58bb2', icon: 'gift', isDefault: true },
    { id: 'cat-food', name: 'Makan & minum', nameEn: 'Food & drinks', type: 'expense', color: '#d99873', icon: 'food', isDefault: true },
    { id: 'cat-transport', name: 'Transportasi', nameEn: 'Transport', type: 'expense', color: '#8e9bc8', icon: 'car', isDefault: true },
    { id: 'cat-home', name: 'Tempat tinggal', nameEn: 'Housing', type: 'expense', color: '#c0a36b', icon: 'home', isDefault: true },
    { id: 'cat-bills', name: 'Tagihan', nameEn: 'Bills', type: 'expense', color: '#81a7b7', icon: 'wallet', isDefault: true },
    { id: 'cat-shopping', name: 'Belanja', nameEn: 'Shopping', type: 'expense', color: '#b58bb2', icon: 'bag', isDefault: true },
    { id: 'cat-health', name: 'Kesehatan', nameEn: 'Health', type: 'expense', color: '#87aaa0', icon: 'health', isDefault: true },
    { id: 'cat-leisure', name: 'Hiburan', nameEn: 'Leisure', type: 'expense', color: '#d27d75', icon: 'coffee', isDefault: true },
    { id: 'cat-education', name: 'Pendidikan', nameEn: 'Education', type: 'expense', color: '#a7b77a', icon: 'book', isDefault: true },
    { id: 'cat-other', name: 'Lainnya', nameEn: 'Other', type: 'expense', color: '#9ba69b', icon: 'tag', isDefault: true },
  ];

  const transactions: Transaction[] = [
    { id: 'tx-1', type: 'income', amount: 8500000, categoryId: 'cat-salary', date: day(1), note: 'Gaji bulanan', createdAt: Date.now() - 200000 },
    { id: 'tx-2', type: 'expense', amount: 2100000, categoryId: 'cat-home', date: day(2), note: 'Sewa tempat tinggal', createdAt: Date.now() - 190000 },
    { id: 'tx-3', type: 'expense', amount: 265000, categoryId: 'cat-food', date: day(3), note: 'Belanja mingguan', createdAt: Date.now() - 180000 },
    { id: 'tx-4', type: 'expense', amount: 180000, categoryId: 'cat-transport', date: day(4), note: 'Bensin dan parkir', createdAt: Date.now() - 170000 },
    { id: 'tx-5', type: 'income', amount: 1250000, categoryId: 'cat-side', date: day(6), note: 'Proyek desain', createdAt: Date.now() - 160000 },
    { id: 'tx-6', type: 'expense', amount: 325000, categoryId: 'cat-bills', date: day(7), note: 'Internet dan listrik', createdAt: Date.now() - 150000 },
    { id: 'tx-7', type: 'expense', amount: 195000, categoryId: 'cat-food', date: day(9), note: 'Makan bersama teman', createdAt: Date.now() - 140000 },
    { id: 'tx-8', type: 'expense', amount: 235000, categoryId: 'cat-shopping', date: day(11), note: 'Kebutuhan rumah', createdAt: Date.now() - 130000 },
    { id: 'tx-9', type: 'expense', amount: 85000, categoryId: 'cat-transport', date: day(13), note: 'Transport akhir pekan', createdAt: Date.now() - 120000 },
    { id: 'tx-10', type: 'expense', amount: 210000, categoryId: 'cat-food', date: day(15), note: 'Makan siang', createdAt: Date.now() - 110000 },
    { id: 'tx-11', type: 'expense', amount: 150000, categoryId: 'cat-leisure', date: day(17), note: 'Nonton film', createdAt: Date.now() - 100000 },
    { id: 'tx-12', type: 'expense', amount: 125000, categoryId: 'cat-health', date: day(19), note: 'Vitamin dan obat', createdAt: Date.now() - 90000 },
    { id: 'tx-13', type: 'expense', amount: 160000, categoryId: 'cat-food', date: day(21), note: 'Makan malam', createdAt: Date.now() - 80000 },
  ];

  return {
    profile: { name: 'Pengguna' },
    settings: { language: 'id' },
    categories,
    transactions,
    budgets: [
      { id: 'budget-1', categoryId: 'cat-food', amount: 1500000, month: m },
      { id: 'budget-2', categoryId: 'cat-transport', amount: 600000, month: m },
      { id: 'budget-3', categoryId: 'cat-shopping', amount: 500000, month: m },
      { id: 'budget-4', categoryId: 'cat-bills', amount: 450000, month: m },
    ],
    goals: [
      { id: 'goal-1', name: 'Dana darurat', targetAmount: 15000000, initialSaved: 3500000, monthlyContribution: 1000000, targetDate: '2027-06-30', priority: 'high', note: 'Cadangan biaya hidup' },
      { id: 'goal-2', name: 'Liburan akhir tahun', targetAmount: 5000000, initialSaved: 1200000, monthlyContribution: 450000, targetDate: '2027-12-15', priority: 'medium', note: 'Perjalanan singkat' },
      { id: 'goal-3', name: 'Upgrade laptop', targetAmount: 12000000, initialSaved: 2500000, monthlyContribution: 600000, targetDate: '2027-12-31', priority: 'medium', note: 'Perangkat kerja' },
    ],
    goalContributions: [
      { id: 'contrib-1', goalId: 'goal-1', amount: 500000, date: day(4), note: 'Alokasi rutin' },
      { id: 'contrib-2', goalId: 'goal-2', amount: 150000, date: day(12), note: 'Alokasi rutin' },
      { id: 'contrib-3', goalId: 'goal-3', amount: 200000, date: day(16), note: 'Alokasi rutin' },
    ],
  };
}
