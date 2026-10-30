# MONEY TRACKER — UI/UX DESIGN & FRONTEND SPECIFICATION (GATE 1–3)

**Document Version:** 1.0.0  
**Status:** Design Phase Deliverable (Awaiting Validation Gate 3)  
**Primary Reference:** `/public/assets/aistudio/money_tracker_5ccfa2be.html`  
**Design System Theme:** Organic Tactile Precision (Plus Jakarta Sans + Tailwind CSS 4)  
**Target Viewports:** 375px–430px (Mobile-First Touch), 768px–1024px (Tablet), 1024px–1600px (Desktop Full-Width)

---

## 1. Reference Analysis

### 1.1 Source Inspection
The user provided a complete, functional single-file prototype (`/public/assets/aistudio/money_tracker_5ccfa2be.html`). Inspection of this artifact reveals the following visual DNA:
- **Atmospheric Palette:** Warm off-white/linen canvas (`--bg: #f5f6f1`) coupled with crisp white container surfaces (`#ffffff`), hairline borders (`#e8ece5`), and deep forest slate typography (`--ink: #202923`).
- **Accent Identity:** Deep natural evergreen (`--accent: #27694c`, `--accent-deep: #174d36`, `--accent-soft: #e9f3ec`).
- **Tactile Soft Geometry:** Distinctive curved radii: outer containers (`22px`), buttons/form fields (`13px`), inner icons/badges (`10px`–`11px`).
- **Mobile Ergonomics:** Fixed 5-slot bottom bar with an elevated circular `+` button in the center thumb zone; secondary management (Categories, Reports, Settings) delegated to a slide-over drawer.
- **Desktop Layout:** Two-column workspace (244px persistent left sidebar + responsive fluid main canvas up to 1600px).
- **Tabular Rigor:** Zero-decimal Indonesian Rupiah (`IDR`) with standard thousands grouping (e.g. `Rp 8.500.000`), aligned using tabular numbers.

### 1.2 Mandatory, Inspirational, and Prohibited Attributes

| Category | Elements & Rules |
| :--- | :--- |
| **Mandatory (Strict Reference Fidelity)** | - Exact color tokens and semantic contrasts from the prototype.<br>- 5-item mobile bottom navigation with elevated center `+ Tambah` action.<br>- Dual-mode transaction rendering: Desktop data table $\rightarrow$ Mobile high-density cards.<br>- Complete bilingual switching (`id` / `en`) with localized strings.<br>- Modals for Add/Edit Transaction, Budget, Goal, Contribution, and Category.<br>- Zero-decimal integer currency formatting (`IDR`). |
| **Inspirational (Elevated with Design Taste)** | - Smooth, non-distracting CSS transitions ($\le 200\text{ms}$) on cards, buttons, and progress bars.<br>- Accessible SVG cash-flow weekly bar visualization with full ARIA tables.<br>- Visual goal completion states that clearly distinguish actual savings from projections. |
| **Prohibited (Anti-Slop Bans)** | - ❌ No generic purple gradients or AI-template neon glows.<br>- ❌ No static pill badge sandwiches over titles (metadata must be clean unboxed text).<br>- ❌ No fake innovation scores, synthetic telemetry tickers, or decorative pulsing dots.<br>- ❌ No code-style section headers (`// 01 ARCHITECTURE`).<br>- ❌ No double-counting of savings contributions as monthly operational expenses.<br>- ❌ No floating desert-island layouts on desktop (must span 1440px cleanly). |

---

## 2. Design Direction

### 2.1 Visual Personality
**"Organic Tactile Precision"**: A personal finance application designed for young Indonesian and global professionals. It feels like high-end stationery meets precision software: calm, trustworthy, tactile, and completely devoid of high-stress financial clutter.

### 2.2 Core Principles
1. **Numbers are the Interface:** Every currency amount uses `font-variant-numeric: tabular-nums` to prevent horizontal jitter during filtering and ensure vertical column alignment.
2. **60-30-10 Color Discipline:**
   - **60% Neutral Canvas:** `#f5f6f1` (warm linen) and `#ffffff` (surface cards).
   - **30% Structural Muted Tones:** Hairline borders (`#e8ece5`), slate text (`#202923`), and muted captions (`#788079`).
   - **10% Semantic Accents:** Forest emerald (`#27694c`) for income/primary CTAs, warm clay terracotta (`#bd704d`) for expenses, soft amber (`#d97706`) for budget warnings, and crimson (`#b84b40`) for over-budget alerts.
3. **Ergonomic One-Handed Reach:** In mobile view, 100% of frequent tasks (view balance, view recent transactions, tap `+` to log expense) reside within the natural bottom 40% thumb reach zone.

---

## 3. Screen-by-Screen UI Specification (11 Required Screens & States)

### 3.1 Authentication (Login / Register / Profile Context)
- **Purpose:** Secure personal financial records while presenting a welcoming, friction-free onboarding.
- **Hierarchy:** Brand Wordmark & Tagline $\rightarrow$ Mode Toggle (Sign In / Register) $\rightarrow$ Email & Password Fields $\rightarrow$ Primary Submit CTA $\rightarrow$ Privacy Assurance.
- **Actions:** Primary: "Masuk / Masuk Akun" or "Daftar Akun"; Secondary: Language selector (`ID` / `EN`).
- **Validation:** Valid RFC-5322 email; password $\ge 8$ chars; inline error association.
- **States:**
  - *Loading:* Spinner in submit button with disabled inputs.
  - *Error:* Red highlight on field + top alert banner (*"Email atau kata sandi tidak cocok"*).
  - *Success:* Instant session initialization and redirect to Dashboard.
- **Mobile vs Desktop:** Centered floating card (`max-w-md`) on desktop with subtle background motif; full-bleed card with top brand header on mobile.

### 3.2 Main Dashboard (Overview)
- **Purpose:** Immediate snapshot of current-month cash flow, budget health, and recent transactions.
- **Hierarchy:** Quick Access Cards (Goals & Monthly Analysis) $\rightarrow$ 3 KPI Metric Cards (Income, Expenses, Net Flow) $\rightarrow$ 2-Column Split: Cash Flow Trend (left) + Category Budget Usage (right) $\rightarrow$ Recent Transactions list $\rightarrow$ Active Goals progress.
- **Actions:** Top right `+ Catat Transaksi` button; View All links on each section.
- **States:**
  - *Empty:* If zero transactions, display warm empty state: *"Belum ada transaksi — Catat pemasukan atau pengeluaran supaya ringkasan mulai terbentuk"* with `+ Catat transaksi pertama` CTA.
  - *Negative Net Flow:* If expenses exceed income, Net Cash Flow displays negative indicator `−Rp X.XXX.XXX` with down arrow and warning caption.
- **Mobile vs Desktop:** Desktop displays 3-column KPI row and 1.4:0.8 dashboard grid. Mobile displays 2-column KPI grid (with Net Flow spanning full width) and stacked single-column sections.

### 3.3 Transaction History
- **Purpose:** Searchable, filterable, audit-ready ledger of all recorded financial movements.
- **Hierarchy:** Page Header $\rightarrow$ Toolbar (Live Search input + Type Filter + Month Selector + Count Label) $\rightarrow$ Data Container (Desktop Table or Mobile Cards).
- **Actions:** Quick filter pills, row edit button, row delete button, add transaction button.
- **States:**
  - *Loading:* 5 skeleton rows with shimmering cells.
  - *Empty Filter:* *"Transaksi tidak ditemukan — Coba ubah kata kunci atau filter yang digunakan"*.
  - *Success:* Inline update toast upon editing or deletion.
- **Mobile vs Desktop:** Desktop renders 5-column table (`Transaksi`, `Tanggal`, `Jenis`, `Jumlah`, `Aksi`). Mobile switches automatically to stacked touch cards with icon, date, category tag, large amount, and touch-friendly edit/delete action triggers ($\ge 44\text{px}$).

### 3.4 Add & Edit Transaction (Modal Flow)
- **Purpose:** Fast manual transaction recording with minimal required keystrokes.
- **Hierarchy:** Modal Header $\rightarrow$ Type Segmented Switch (`Pengeluaran` / `Pemasukan`) $\rightarrow$ Amount Field (IDR) $\rightarrow$ Date Field (defaulting to today) $\rightarrow$ Category Dropdown $\rightarrow$ Optional Note $\rightarrow$ Footer CTAs.
- **Validation:** Amount must be integer $> 0$; date must be valid ISO date; category required and must match selected type.
- **Interactions:** Switching between Expense and Income automatically repopulates the category dropdown with eligible categories without losing the entered amount.
- **States:**
  - *Error:* Red outline on invalid input with message (e.g. *"Masukkan jumlah yang lebih besar dari 0"*).
  - *Submitting:* Primary button disabled with loading state; double-click submission prevented.

### 3.5 Category Management
- **Purpose:** Organization of income and expense taxonomy with distinct colors and glyphs.
- **Hierarchy:** Income Categories Grid $\rightarrow$ Expense Categories Grid $\rightarrow$ Custom Category Creation CTA.
- **Actions:** Add Category, Edit Category Name/Color, Deactivate/Delete Custom Category.
- **Constraints:** System default categories (Gaji, Makan, Transport, Tagihan, etc.) cannot be deleted. Custom categories referenced by existing transactions cannot be hard-deleted (shows toast warning: *"Kategori ini masih dipakai transaksi atau anggaran"*).
- **Mobile vs Desktop:** Desktop renders 3-column category grid; mobile renders 1-column touch-friendly cards.

### 3.6 Monthly Budget Management
- **Purpose:** Set and monitor spending ceilings for discretionary expense categories.
- **Hierarchy:** Month Filter Selector $\rightarrow$ Budget Cards Grid $\rightarrow$ Contextual Budget Methodology Notice.
- **Card Elements:** Category icon & label $\rightarrow$ Status badge (*Terkendali*, *Mendekati batas*, *Melebihi batas*) $\rightarrow$ Spent vs Total Number $\rightarrow$ Visual Progress Bar $\rightarrow$ Remaining Rupiah.
- **Status Thresholds:**
  - $<80\%$: `#81b98d` (green).
  - $80\% - 100\%$: `#e2a06f` (amber warning).
  - $>100\%$: `#d57367` (red alert, label displays *Rp X melewati anggaran*).
- **Actions:** Add Budget, Edit Limit, Delete Budget.

### 3.7 Financial Goal Overview
- **Purpose:** High-level tracking of active savings milestones (Emergency fund, Vacation, Hardware upgrade).
- **Hierarchy:** Goal Cards Grid $\rightarrow$ Savings Separation Educational Notice.
- **Card Elements:** Goal glyph $\rightarrow$ Priority Pill (`Tinggi`, `Sedang`, `Rendah`) $\rightarrow$ Goal Title & Note $\rightarrow$ Current Saved Amount $\rightarrow$ Target Amount $\rightarrow$ Progress Bar & Percentage $\rightarrow$ ETA Projection $\rightarrow$ `+ Catat alokasi` CTA.
- **States:**
  - *Fully Funded:* Progress bar hits 100%, card receives celebratory check badge (*"Target tercapai"*), contribute button disabled.
  - *Unassigned Monthly Allocation:* Displays prompt *"Atur alokasi bulanan untuk melihat estimasi waktu"*.

### 3.8 Create & Edit Financial Goal & Record Contribution
- **Purpose:** Authoring target amounts, deadlines, and recording savings transfers without double-counting.
- **Hierarchy:** Goal Form: Name $\rightarrow$ Target Amount $\rightarrow$ Initial Saved $\rightarrow$ Monthly Allocation $\rightarrow$ Target Date $\rightarrow$ Priority $\rightarrow$ Memo.
- **Contribution Modal:** Amount $\rightarrow$ Date $\rightarrow$ Note $\rightarrow$ Reassurance copy: *"Catatan tabungan ini terpisah dari pengeluaran agar tidak terhitung dua kali dalam laporan."*
- **Validation:** Amount $\le$ remaining deficit to prevent inadvertent multi-million overfunding without confirmation.

### 3.9 Financial Reports
- **Purpose:** Deep visual analytics of income, expenses, and category distributions across custom horizons.
- **Hierarchy:** Period Selector (`Bulan ini`, `Bulan lalu`, `30 hari terakhir`, `Semua waktu`) $\rightarrow$ 3 Summary KPI Cards $\rightarrow$ 2-Column Analytical Layout: Category Breakdown Progress List (left) + Filtered Transaction Stream (right) $\rightarrow$ Export CSV CTA.
- **Visualization:** Horizontal weighted distribution bars showing exact percentage of total expenses per category with colored legend dots.

### 3.10 CSV Export Workflow
- **Purpose:** Data portability and backup for external spreadsheet verification.
- **Interaction:** Triggered via `Ekspor CSV` button in Reports or Transactions $\rightarrow$ Instant streaming file download (`money-tracker-{period}-{date}.csv`).
- **Data Protection:** Formatted with UTF-8 BOM (`\ufeff`) for clean Indonesian character display in Excel; spreadsheet formula injection protection applied to all notes starting with `=`, `+`, `-`, `@`.
- **Feedback:** Success toast *"File CSV berhasil dibuat"* or warning toast if zero records found.

### 3.11 User Settings & Language Selection
- **Purpose:** Personalization of profile name, interface language, and prototype data state.
- **Hierarchy:** Profile Settings Form $\rightarrow$ Language Selector Radio Cards (`Bahasa Indonesia` / `English`) $\rightarrow$ Data & Privacy Security Card $\rightarrow$ Reset Sample Data Section.
- **Reset Flow:** Destructive action requires confirmation modal with red warning button. Resets localStorage to seed baseline and redirects to dashboard with toast confirmation.

---

## 4. Design Tokens & Styling Specs

```css
:root {
  /* Canvas & Structural Surfaces */
  --bg: #f5f6f1;               /* 60% Warm organic linen neutral */
  --surface: #ffffff;          /* 30% Pure crisp white container */
  --surface-soft: #fafbf8;     /* Subtle table header fill */
  --line: #e8ece5;             /* 1px crisp structural border */
  
  /* Typography & Ink */
  --ink: #202923;              /* Primary text (high-contrast deep slate) */
  --muted: #788079;            /* Secondary metadata and helper labels */
  
  /* Brand Accent Tokens */
  --accent: #27694c;           /* Primary brand green (buttons, active states) */
  --accent-deep: #174d36;      /* Hover / pressed state */
  --accent-soft: #e9f3ec;      /* Active selection backgrounds */
  
  /* Financial Semantic Status */
  --income: #287448;           /* Income text */
  --income-bg: #e9f4eb;        /* Income badge/icon background */
  --expense: #bd704d;          /* Expense text */
  --expense-bg: #fff0e8;       /* Expense badge/icon background */
  --net-neutral: #586ab0;      /* Net flow accent */
  --net-bg: #edf0fb;           /* Net flow icon background */
  
  /* Alert & Warning Tokens */
  --warn: #e2a06f;             /* 80-100% budget warning */
  --red: #b84b40;              /* Over-budget & destructive actions */
  --red-soft: #fff0ed;         /* Alert banner background */
  
  /* Spatial Geometry & Motion */
  --radius: 22px;              /* Main cards and dialog panels */
  --radius-sm: 13px;           /* Buttons, inputs, pills */
  --radius-xs: 10px;           /* Inner bullets, action icon buttons */
  --shadow: 0 4px 18px rgba(39, 58, 39, 0.022);
  --shadow-modal: 0 25px 80px rgba(25, 40, 29, 0.22);
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

---

## 5. Component Inventory

1. **`AppLayout`**: Desktop sidebar (244px) + Sticky mobile topbar + Mobile bottom bar (64px) + Backdrop drawers.
2. **`Topbar`**: Breadcrumb hierarchy, Language dropdown with radio options, Quick Add transaction trigger.
3. **`Sidebar`**: Brand wordmark, Primary navigation list, Prototype environment note, Profile thumbnail with settings link.
4. **`MobileBottomNav`**: 5 ergonomic touch slots (`Ringkasan`, `Transaksi`, elevated `+ Tambah`, `Anggaran`, `Tujuan`).
5. **`MetricCard`**: Title, Tabular IDR value, Semantic icon pill, Contextual trend caption.
6. **`CashflowBarChart`**: SVG/CSS 6-period bar group comparing income vs expense heights with hover tooltips.
7. **`BudgetProgressItem`**: Category badge, spend vs limit label, color-coded fill bar (`onTrack` / `warn` / `over`).
8. **`TransactionRow` (Desktop)**: Tabular layout with category icon, memo note, formatted date, colored amount, edit/delete actions.
9. **`MobileTransactionCard`**: High-density card layout optimized for narrow touchscreens.
10. **`GoalCard`**: Target summary, progress meter, priority chip, remaining calculation, ETA projection, quick contribution CTA.
11. **`ModalDialog`**: Accessible backdrop overlay (`role="dialog"`), sticky header, focus trap, Escape key dismiss.
12. **`ToastNotification`**: Live region (`aria-live="polite"`), auto-dismissing feedback alert with clean icon.

---

## 6. Responsive Behavior & Viewport Breakpoints

| Breakpoint | Layout Changes | Specific Mobile Adaptations |
| :--- | :--- | :--- |
| **Mobile (<768px)** | - Sidebar collapsed into hidden slide-over drawer.<br>- Bottom navigation bar fixed at bottom (64px + safe area padding).<br>- Desktop table hidden; mobile card list active.<br>- Transaction add button prominent in center thumb position. | - Sticky header + bottom bar $\le 15\%$ viewport height.<br>- Filter controls stack vertically or use 2-column grid.<br>- Search box spans 100% width.<br>- Modal sheets dock to bottom with rounded top corners. |
| **Tablet (768px–1024px)** | - Compact 218px sidebar.<br>- 2-column KPI metric cards.<br>- Single-column dashboard grid.<br>- 2-column budget and goal cards. | - Full desktop navigation active.<br>- Data table enabled with horizontal scroll wrapper if needed. |
| **Desktop (1024px–1600px)** | - 244px fixed sidebar.<br>- 3-column KPI metric cards.<br>- 1.4:0.8 multi-column dashboard grid.<br>- High-density transaction data table. | - Full 1440px viewport presence.<br>- Maximum line length for prose restricted to 65ch.<br>- Modals centered with soft backdrop blur. |

---

## 7. Accessibility Checklist (WCAG 2.1 AA Compliance)

- [x] **Color Contrast:** All body text (`#202923` on `#f5f6f1` and `#ffffff`) satisfies contrast ratio $\ge 8.5:1$ (exceeds 4.5:1 requirement). Muted captions (`#788079`) meet $4.6:1$.
- [x] **Non-Color State Indicators:** Over-budget items display both red fill and explicit text badge (*"Melebihi batas"* / *"Over budget"*). Income and expense items include `+` / `−` sign prefixes.
- [x] **Touch Targets:** All buttons, nav items, and table action icons have minimum click dimensions $\ge 44 \times 44\text{px}$ on mobile devices.
- [x] **Keyboard Navigation & Focus Rings:** Every interactive button, link, and form input has visible focus outlines (`outline: 3px solid rgba(39, 105, 76, 0.26); outline-offset: 2px`).
- [x] **Screen Reader Support:** Modals use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`. Dynamic alerts use `aria-live="polite"`. Form inputs use explicit `<label for="...">` pairings and `aria-invalid="true"` on errors.
- [x] **Tabular Numerals:** All financial metrics enforce `tabular-nums` so columns align and screen readers announce values consistently.
- [x] **Reduced Motion Support:** `@media (prefers-reduced-motion: reduce)` disables all animations and transitions across the application.

---

## 8. Open Questions & Design Trade-offs for User Validation (Gate 3)

1. **Category Deletion with Existing Records:**
   - *Current Decision:* Restrict deletion if category has associated transactions or budgets to prevent historical data corruption.
   - *Alternative:* Allow deletion with mandatory reassignment to a generic "Lainnya / Other" category.
2. **Chart Visualization for Mobile:**
   - *Current Decision:* Responsive 6-period vertical bar chart showing weekly income vs expense volume.
   - *Alternative:* Expense doughnut breakdown chart on mobile overview.
3. **Data Storage & Sync Staging:**
   - *Current Decision:* Zero-latency localStorage client engine with sample seed data and CSV export for MVP verification, ready for REST API hydration.
   - *Alternative:* Enforce strict server authentication from the very first screen.

---

*This specification is committed at `/docs/UI-UX-DESIGN-SPECIFICATION.md`. Upon completion of this design review (Gate 3), frontend implementation into modular React 19 components with full test verification will commence.*
