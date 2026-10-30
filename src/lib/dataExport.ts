import type { Category, Language, Transaction } from '../types/finance.ts';
import {
  calculateTotals,
  formatDisplayDate,
  formatMoney,
  todayISO,
} from './calculations.ts';

export interface TransactionPrintLabels {
  title: string;
  subtitle: string;
  generatedAt: string;
  records: string;
  income: string;
  expenses: string;
  net: string;
  date: string;
  type: string;
  category: string;
  note: string;
  amount: string;
  incomeType: string;
  expenseType: string;
  empty: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] || character;
  });
}

export function buildTransactionsPrintHtml(
  transactions: Transaction[],
  categories: Category[],
  lang: Language,
  labels: TransactionPrintLabels
): string {
  const locale = lang === 'en' ? 'en-US' : 'id-ID';
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const sortedTransactions = [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
  );
  const totals = calculateTotals(sortedTransactions);
  const generatedDate = formatDisplayDate(todayISO(), lang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const rows = sortedTransactions.map((transaction) => {
    const category = categoryMap.get(transaction.categoryId);
    const categoryName =
      lang === 'en' && category?.nameEn ? category.nameEn : category?.name || '—';
    const typeLabel =
      transaction.type === 'income' ? labels.incomeType : labels.expenseType;
    const amountPrefix = transaction.type === 'income' ? '+' : '−';
    const amountClass = transaction.type === 'income' ? 'income' : 'expense';

    return `
      <tr>
        <td>${escapeHtml(formatDisplayDate(transaction.date, lang, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }))}</td>
        <td>${escapeHtml(typeLabel)}</td>
        <td>${escapeHtml(categoryName)}</td>
        <td class="note">${escapeHtml(transaction.note || '—')}</td>
        <td class="amount ${amountClass}">${amountPrefix}${escapeHtml(formatMoney(transaction.amount, lang))}</td>
      </tr>
    `;
  }).join('');

  const emptyRow = `
    <tr><td class="empty" colspan="5">${escapeHtml(labels.empty)}</td></tr>
  `;

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(labels.title)}</title>
  <style>
    :root { color-scheme: light; font-family: Arial, Helvetica, sans-serif; color: #202923; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; background: #fff; color: #202923; font-size: 12px; }
    .report { max-width: 1040px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding-bottom: 18px; border-bottom: 2px solid #176b39; }
    h1 { margin: 0; font-size: 24px; letter-spacing: -0.5px; }
    .subtitle { margin: 6px 0 0; color: #637068; font-size: 12px; }
    .generated { color: #637068; text-align: right; font-size: 11px; line-height: 1.5; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 18px 0 22px; }
    .stat { min-width: 0; padding: 12px; border: 1px solid #e0e7e1; border-radius: 8px; }
    .stat span { display: block; color: #637068; font-size: 10px; }
    .stat strong { display: block; margin-top: 5px; font-size: 15px; overflow-wrap: anywhere; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    thead { display: table-header-group; }
    th { padding: 10px 8px; background: #eef4ef; color: #33443a; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
    td { padding: 9px 8px; border-bottom: 1px solid #e7ece8; vertical-align: top; overflow-wrap: anywhere; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    th:nth-child(1), td:nth-child(1) { width: 16%; }
    th:nth-child(2), td:nth-child(2) { width: 13%; }
    th:nth-child(3), td:nth-child(3) { width: 17%; }
    th:nth-child(4), td:nth-child(4) { width: 29%; }
    th:nth-child(5), td:nth-child(5) { width: 25%; text-align: right; }
    td.amount { font-weight: 700; font-variant-numeric: tabular-nums; }
    td.income { color: #167c35; }
    td.expense { color: #b94e48; }
    td.empty { padding: 28px 10px; color: #637068; text-align: center; }
    footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e7ece8; color: #637068; font-size: 10px; }
    @page { size: A4 portrait; margin: 12mm; }
    @media (max-width: 640px) {
      body { padding: 16px; }
      header { gap: 12px; }
      h1 { font-size: 20px; }
      .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      table { font-size: 10px; }
      th, td { padding: 7px 5px; }
    }
    @media print {
      body { padding: 0; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .report { max-width: none; }
    }
  </style>
</head>
<body>
  <main class="report">
    <header>
      <div>
        <h1>${escapeHtml(labels.title)}</h1>
        <p class="subtitle">${escapeHtml(labels.subtitle)}</p>
      </div>
      <div class="generated">${escapeHtml(labels.generatedAt)}<br>${escapeHtml(generatedDate)}</div>
    </header>
    <section class="stats" aria-label="Transaction summary">
      <div class="stat"><span>${escapeHtml(labels.records)}</span><strong>${sortedTransactions.length.toLocaleString(locale)}</strong></div>
      <div class="stat"><span>${escapeHtml(labels.income)}</span><strong>${escapeHtml(formatMoney(totals.income, lang))}</strong></div>
      <div class="stat"><span>${escapeHtml(labels.expenses)}</span><strong>${escapeHtml(formatMoney(totals.expenses, lang))}</strong></div>
      <div class="stat"><span>${escapeHtml(labels.net)}</span><strong>${escapeHtml(formatMoney(totals.net, lang))}</strong></div>
    </section>
    <table>
      <thead>
        <tr>
          <th>${escapeHtml(labels.date)}</th>
          <th>${escapeHtml(labels.type)}</th>
          <th>${escapeHtml(labels.category)}</th>
          <th>${escapeHtml(labels.note)}</th>
          <th>${escapeHtml(labels.amount)}</th>
        </tr>
      </thead>
      <tbody>${rows || emptyRow}</tbody>
    </table>
    <footer>MONTRACK · ${escapeHtml(labels.subtitle)}</footer>
  </main>
</body>
</html>`;
}
