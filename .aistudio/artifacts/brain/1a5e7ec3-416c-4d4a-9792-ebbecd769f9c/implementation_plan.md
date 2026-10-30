# Money Tracker — UI/UX Layout & Typography Refinement

Comprehensive layout, alignment, and typography refinement for the Money Tracker web application, establishing a disciplined 4px modular spacing grid, responsive 12-column desktop and 4-column mobile structures, strict Manrope/Inter typographic hierarchy, and right-aligned tabular financial metrics.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design preferences have been confirmed through user consultation and will guide the UI/UX refinement:
>
> 1. **Layout Density**: Balanced, structured layout with 16–24px breathing room rather than cramped ultra-dense views, ensuring high legibility and touch ergonomic comfort.
> 2. **Card Visual Styling**: Minimalist flat cards with crisp hairline borders (`border border-[#e7ebe4] dark:border-[#29312b]`) rather than heavy multi-level drop shadows, eliminating visual clutter.
> 3. **Mobile Transaction Display**: Clean single-line transaction rows with right-aligned tabular figures (`tabular-nums font-heading font-bold text-right`) to prevent awkward line wrapping and ensure zero horizontal scrolling.

---

### 1. Overview & Core Concept

- **What It Does**: Money Tracker provides young professionals with intuitive, real-time control over their daily cash flow, category budgets, and savings goals with bilingual support (Indonesian IDR and English) and dual light/dark themes.
- **Target Audience / Persona**: Indonesian and international young professionals who need quick, single-handed mobile transaction logging and an executive desktop overview without complex accrual accounting friction.
- **Key Value**: Crisp visual clarity, zero floating-point rounding errors (IDR integer basis), and instant scannability across balances, budget thresholds, and goal timelines.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Dashboard & Cash Flow Overview**:
   - Primary Saldo Hero Card displaying total balance in Manrope (28–32px mobile / 32–36px desktop) with tabular numbers.
   - 4-column / 12-column KPI strip for Income, Expenses, and Net Flow with left-aligned labels and clear status indicators.
   - Quick action triggers ("Tambah Transaksi", "Set Budget") with standard 14px button typography.
2. **Transaction Scannability & Management**:
   - Search & Category Filter toolbar with 4px grid spacing (h-10 to h-11 controls, rounded-xl).
   - Single-line transaction feed with category icon, note/category label (14px semibold), date metadata (12px, quiet unboxed text), and right-aligned amount (14–15px tabular bold).
3. **Category Budgets & Progress Tracking**:
   - Monthly budget cards with progress bar indicating on-track (<80%), near-limit (80–100%), and over-budget (>100%).
   - Left-aligned category names and limits; right-aligned spent amount and remaining quota.
4. **Savings Goals & Contribution Modals**:
   - Goal progress cards with percentage milestone tracking and dynamic ETA calculations.
   - Seamless contribution modal that increases goal savings without distorting operational expense budgets.

#### Visual Identity & Theme
- **Aesthetic Direction**: Minimalist, warm editorial finance aesthetic with precise hairline boundaries, quiet unboxed metadata, and zero decorative fluff.
- **Color System (60-30-10 Discipline)**:
  - *Canvas (60%)*: `--surface` (`#f9faf5` light / `#121513` dark).
  - *Structural Containers (30%)*: Crisp flat cards with hairline borders (`#e7ebe4` light / `#29312b` dark).
  - *Accent Budget (10%)*: Deep forest green primary (`#045136` light / `#52ba88` dark), emerald income (`#287448` light / `#4ec985` dark), terracotta expense (`#db815e` light / `#e89574` dark).
- **Typography Pairing & Font Scale Hierarchy**:
  - **Manrope**: Headings, page titles, section titles, and primary saldo hero figures.
  - **Inter**: Body prose, form labels, navigation items, metadata timestamps, and button text.
  - **Font Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold).

| Element | Mobile Size | Desktop Size | Weight | Font Family | Line Height |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Angka Saldo Utama** | 28–32px | 32–36px | 700 (Bold) | Manrope | 1.2 (`leading-tight`) |
| **Judul Halaman** | 22px | 24–28px | 700 (Bold) | Manrope | 1.25 (`leading-tight`) |
| **Judul Section** | 16px | 18px | 700 (Bold) | Manrope | 1.3 (`leading-snug`) |
| **Judul Card** | 15px | 16px | 600 (Semibold) | Manrope | 1.3 (`leading-snug`) |
| **Judul Transaksi** | 14px | 14–15px | 600 (Semibold) | Inter | 1.4 (`leading-normal`) |
| **Body Text** | 14px | 14–15px | 400–500 | Inter | 1.45–1.5 |
| **Label Form** | 12–13px | 13px | 500 (Medium) | Inter | 1.4 |
| **Metadata / Tanggal** | 12px | 12px | 400–500 | Inter | 1.35 |
| **Button / Nav Link** | 14px | 14px | 600 (Semibold) | Inter | 1.2 |

#### Spacing System (Strict 4px Modular Rhythm)
- **4px**: Minimum micro-gap (e.g. icon to text micro-spacing).
- **8px**: Related sibling elements (e.g. badge to title, input icon to field).
- **12px**: Internal card padding on compact mobile widgets and form field spacing.
- **16px**: Mobile card padding and medium component margins.
- **20px**: Standard gap between related cards and grid items.
- **24px**: Inter-section gaps (`space-y-6`).
- **32px**: Large major section dividers and page header breathing space.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Zero-Pill Metadata Discipline**
  - *Chosen Approach*: Replace bordered pill capsules around dates, categories, and tags with quiet unboxed text separated by typographic middots (`·`).
  - *Why*: Eliminates visual clutter, enhances scannability, and prevents the app from feeling like a toy or generic AI template.
- **Decision 2: Strict Grid Alignment (Left Text, Right Numbers)**
  - *Chosen Approach*: All transaction labels, category headers, and descriptions are strictly left-aligned (`text-left`). All monetary figures, percentages, and counters are strictly right-aligned (`text-right tabular-nums`).
  - *Why*: Conforms to professional financial reporting standards and allows instant vertical scanning of values.
- **Decision 3: Mobile Viewport Horizontal Scroll Prevention**
  - *Chosen Approach*: Implement flexible flexbox with `truncate` on note text, shrink-0 on amounts and action buttons, and responsive grid columns (`grid-cols-4` on mobile, `grid-cols-12` on desktop).
  - *Why*: Eliminates horizontal page overflow and maintains single-hand thumb navigation comfort.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        APP CONTAINER (Vite + React 19)                │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar / Mobile Topbar (Sticky 52px, Manrope Wordmark, Actions)     │
├────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ Desktop Sidebar         │  │ Main Viewport (max-w-6xl)           │  │
│  │ (240px, Inter 14px Nav) │  │  ├── 4-col (sm) / 12-col (lg) Grid  │  │
│  │                         │  │  ├── Saldo Hero (Manrope 32-36px)   │  │
│  │                         │  │  ├── KPI Metric Cards               │  │
│  │                         │  │  ├── Transaction Feed (Single-line) │  │
│  │                         │  │  └── Budgets & Goal Cards           │  │
│  └─────────────────────────┘  └─────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  Mobile Bottom Nav (Fixed 56px, 4-Tab Thumb Ergonomics, Touch >=44px)   │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                 Local State & Calculations (localStorage)
          [Transactions, Budgets, Goals, Categories, Settings]
```

- **Interactive State & Handlers**: All mutations (create/edit/delete transaction, budget, goal, contribution, category) retain their existing verified state handlers and calculations.
- **Typography & Utility Harmonization**:
  - Global CSS index updated with explicit font utilities and line-height definitions.
  - Component audits across `DashboardView.tsx`, `TransactionsView.tsx`, `BudgetsView.tsx`, `GoalsView.tsx`, `ReportsView.tsx`, `CategoriesView.tsx`, `SettingsView.tsx`, `Sidebar.tsx`, `Topbar.tsx`, `MobileBottomNav.tsx`, and all Modal dialogs.
