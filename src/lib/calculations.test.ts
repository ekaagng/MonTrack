import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTotals,
  calculateBudgetUsage,
  calculateGoalProgress,
  escapeCsvField,
  exportTransactionsToCsv,
} from './calculations.ts';
import type { Transaction, Budget, Goal, GoalContribution, Category } from '../types/finance.ts';

test('calculateTotals computes whole integer income, expenses, and net', () => {
  const transactions: Transaction[] = [
    { id: '1', type: 'income', amount: 5000000, categoryId: 'c1', date: '2026-10-01', createdAt: 1 },
    { id: '2', type: 'income', amount: 1500000, categoryId: 'c2', date: '2026-10-05', createdAt: 2 },
    { id: '3', type: 'expense', amount: 2000000, categoryId: 'c3', date: '2026-10-10', createdAt: 3 },
    { id: '4', type: 'expense', amount: 350000, categoryId: 'c4', date: '2026-10-12', createdAt: 4 },
  ];

  const result = calculateTotals(transactions);
  assert.equal(result.income, 6500000);
  assert.equal(result.expenses, 2350000);
  assert.equal(result.net, 4150000);
});

test('calculateTotals handles empty transaction list', () => {
  const result = calculateTotals([]);
  assert.equal(result.income, 0);
  assert.equal(result.expenses, 0);
  assert.equal(result.net, 0);
});

test('calculateBudgetUsage computes percentage and thresholds correctly', () => {
  const budget: Budget = { id: 'b1', categoryId: 'food', amount: 1000000, month: '2026-10' };
  
  // Case 1: 50% spent -> on_track
  const tx1: Transaction[] = [
    { id: '1', type: 'expense', amount: 500000, categoryId: 'food', date: '2026-10-02', createdAt: 1 },
  ];
  const r1 = calculateBudgetUsage(budget, tx1);
  assert.equal(r1.spent, 500000);
  assert.equal(r1.remaining, 500000);
  assert.equal(r1.percentage, 50);
  assert.equal(r1.status, 'on_track');

  // Case 2: 85% spent -> near_limit
  const tx2: Transaction[] = [
    { id: '1', type: 'expense', amount: 850000, categoryId: 'food', date: '2026-10-02', createdAt: 1 },
  ];
  const r2 = calculateBudgetUsage(budget, tx2);
  assert.equal(r2.percentage, 85);
  assert.equal(r2.status, 'near_limit');

  // Case 3: 120% spent -> over_budget
  const tx3: Transaction[] = [
    { id: '1', type: 'expense', amount: 1200000, categoryId: 'food', date: '2026-10-02', createdAt: 1 },
  ];
  const r3 = calculateBudgetUsage(budget, tx3);
  assert.equal(r3.percentage, 120);
  assert.equal(r3.remaining, -200000);
  assert.equal(r3.status, 'over_budget');
});

test('calculateGoalProgress handles ETA, progress percentage, and completed targets', () => {
  const goal: Goal = {
    id: 'g1',
    name: 'Dana Darurat',
    targetAmount: 10000000,
    initialSaved: 2000000,
    monthlyContribution: 1000000,
    priority: 'high',
  };

  const contributions: GoalContribution[] = [
    { id: 'c1', goalId: 'g1', amount: 1000000, date: '2026-10-04' },
    { id: 'c2', goalId: 'g1', amount: 1000000, date: '2026-10-14' },
  ];

  const res = calculateGoalProgress(goal, contributions);
  assert.equal(res.currentSaved, 4000000); // 2M initial + 2M contributions
  assert.equal(res.remaining, 6000000);
  assert.equal(res.percentage, 40);
  assert.equal(res.etaMonths, 6); // 6M remaining / 1M per month = 6 months
  assert.equal(res.isCompleted, false);

  // When goal is fully funded
  const fullContributions: GoalContribution[] = [
    { id: 'c1', goalId: 'g1', amount: 8000000, date: '2026-10-04' },
  ];
  const resFull = calculateGoalProgress(goal, fullContributions);
  assert.equal(resFull.currentSaved, 10000000);
  assert.equal(resFull.remaining, 0);
  assert.equal(resFull.percentage, 100);
  assert.equal(resFull.etaMonths, 0);
  assert.equal(resFull.isCompleted, true);
});

test('escapeCsvField mitigates formula injection and escapes quotes', () => {
  assert.equal(escapeCsvField('=1+1'), "'=1+1");
  assert.equal(escapeCsvField('+123'), "'+123");
  assert.equal(escapeCsvField('-456'), "'-456");
  assert.equal(escapeCsvField('@SUM(A1)'), "'@SUM(A1)");
  assert.equal(escapeCsvField('Biasa saja'), 'Biasa saja');
  assert.equal(escapeCsvField('Makan "enak"'), '"Makan ""enak"""');
});

test('exportTransactionsToCsv generates valid UTF-8 BOM CSV format', () => {
  const categories: Category[] = [
    { id: 'cat-1', name: 'Gaji', type: 'income', color: '#7cae8a', icon: 'briefcase', isDefault: true },
  ];
  const transactions: Transaction[] = [
    { id: '1', type: 'income', amount: 8500000, categoryId: 'cat-1', date: '2026-10-01', note: 'Gaji bulanan', createdAt: 1 },
  ];
  const headers = {
    date: 'Tanggal',
    type: 'Jenis',
    category: 'Kategori',
    note: 'Catatan',
    amount: 'Jumlah',
    incomeType: 'Pemasukan',
    expenseType: 'Pengeluaran',
  };

  const csv = exportTransactionsToCsv(transactions, categories, headers);
  assert.ok(csv.startsWith('\ufeffTanggal,Jenis,Kategori,Catatan,Jumlah'));
  assert.ok(csv.includes('2026-10-01,Pemasukan,Gaji,Gaji bulanan,8500000'));
});
