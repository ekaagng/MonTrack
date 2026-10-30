# MONEY TRACKER — PRD.01 TECHNICAL PLANNING & SPECIFICATION

**Document Version:** 1.0.0  
**Status:** Approved for Implementation Planning  
**Target Release:** MVP v1.0  
**Target Audience:** Young Professionals (Indonesian & International)  
**Primary Currency:** Indonesian Rupiah (IDR)  
**Locale Support:** Bahasa Indonesia (`id-ID`) and English (`en-US`)

---

## 1. Executive Summary

Money Tracker is a mobile-first personal finance progressive web application engineered specifically for young professionals seeking clarity over discretionary spending, disciplined category budgeting, and milestone-driven savings goals. The product bridges the friction between complex double-entry accounting software and fragmented spreadsheet habits by providing rapid manual transaction logging, transparent cash-flow analytics, and predictive timeline modeling for personal goals.

### Core Value Proposition
- **Clarity over Complexity:** Personal cash-flow monitoring (not corporate accrual accounting).
- **Mobile-First Tactical Execution:** Single-hand thumb-zone ergonomics for logging purchases in under five seconds.
- **Bilingual & Culturally Grounded:** Native Indonesian Rupiah (IDR) currency formatting (zero-decimal standard) and complete bilingual terminology (`id` / `en`).
- **Zero Double-Counting Architecture:** Rigid algebraic separation between operational expenses and goal savings allocations.

---

## 2. Assumptions & Unresolved Decisions

### 2.1 Confirmed Assumptions
1. **Monetary Representation:** IDR has no fractional cents/subunits in practical retail circulation. All financial figures are stored as 64-bit integer amounts (`BIGINT`) representing whole Rupiah units. This eliminates floating-point rounding errors (`0.1 + 0.2 !== 0.3`).
2. **Manual-First Input:** Transaction logging is 100% manual. No third-party open banking aggregators (e.g., Brick, Finantier, Plaid) or SMS scraping are within MVP scope.
3. **User Isolation (Multi-Tenant Row-Level Boundary):** Every sensitive database record (`transactions`, `categories`, `budgets`, `goals`, `goal_contributions`, `audit_logs`) strictly belongs to a single `user_id`. There are no shared household accounts or joint ledgers in MVP.
4. **Timezone Determinism:** Financial transactions occur within user-local dates. Dates are recorded as canonical ISO calendar dates (`YYYY-MM-DD`) alongside UTC timestamps for audit creation, preventing date shifts across timezone boundaries (e.g., UTC+7 Western Indonesia Time / WIB).

### 2.2 Unresolved Decisions & Explicit Recommendations
| Decision Item | Ambiguity / Tension | Recommended Default for MVP | Trade-off / Rationale |
| :--- | :--- | :--- | :--- |
| **Authentication Provider** | Firebase Auth vs. Self-hosted Argon2id JWT | **Firebase Authentication (Email/Password + Google OAuth)** | Eliminates credential leak liability, handles secure token refresh, rate limits brute force, and aligns with Google Cloud architecture. |
| **Database Engine** | Cloud SQL PostgreSQL vs. SQLite / Firestore | **PostgreSQL (Cloud SQL / Neon / Containerized PG)** | Relational integrity with foreign keys, check constraints, strict atomic transactions (`SERIALIZABLE` or `READ COMMITTED`), and subquery rollups for monthly reporting. |
| **Goal Contribution Funding Source** | Does saving to a goal deduct cash from the monthly expense pool? | **Savings Allocation is a Balance Transfer (Neutral Cash Flow)** | Savings contributions are tracked in `goal_contributions` and do **not** create expense records, preventing budget distortion while tracking asset progression. |
| **Category Deletion Behavior** | Cascade delete vs. Restrict vs. Archive | **Soft Archive / Restrict if Referenced** | If a category has associated transactions, deletion is blocked (`RESTRICT`) or soft-archived (`is_active = false`) so historical audits remain intact. |

---

## 3. Requirements Matrix

| Req ID | User Story | Business Rules & Logic | Inputs & Outputs | Validation & Failure States | Acceptance Criteria | Dependencies | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-AUTH-01** | As a user, I want to sign up and authenticate securely so my personal financial records remain confidential. | Email must be unique. Passwords minimum 8 chars with complexity. Token-based session authentication with HTTP-only cookies or Bearer auth. | **In:** Email, Password, Display Name.<br>**Out:** Auth Token, User Profile. | Invalid email format -> 422.<br>Duplicate email -> 409.<br>Invalid credentials -> 401 with generic error. | User can register, verify email (optional in MVP), log in, retrieve JWT, and log out cleanly. | Auth Infrastructure | **P0** |
| **REQ-USER-02** | As a user, I want to manage my display name, default language, and profile preferences. | Language limited to `id` and `en`. Currency locked to `IDR` for MVP. Profile name max 60 characters. | **In:** `name`, `language`.<br>**Out:** Updated user settings payload. | Empty name -> 422.<br>Unsupported language -> 422. | UI reflects name and language switch immediately; persistent across sessions. | REQ-AUTH-01 | **P1** |
| **REQ-CAT-01** | As a user, I want system default categories and the ability to create custom categories. | Default categories cannot be modified or deleted by users. Custom category names must be unique per user and per type (`income` / `expense`). | **In:** `name`, `type`, `color`, `icon`.<br>**Out:** Category object (`id`, `name`, `type`, `color`, `icon`, `is_default`). | Duplicate name within same type -> 422.<br>Deleting in-use category -> 409 Conflict. | New user gets 12 default categories. Custom category appears in selector immediately. | REQ-AUTH-01 | **P0** |
| **REQ-TX-01** | As a user, I want to record, edit, and delete income and expense transactions. | Amount must be a positive integer > 0. Date cannot be in an impossible range (> 50 years future/past). Category must match transaction type. | **In:** `type`, `amount`, `category_id`, `date`, `note`.<br>**Out:** Transaction record. | Amount <= 0 -> 422.<br>Invalid date format -> 422.<br>Category belongs to other user -> 403/404. | Real-time update of balances, charts, and budget utilization upon mutation. | REQ-CAT-01 | **P0** |
| **REQ-BDG-01** | As a user, I want to set monthly budgets for expense categories and monitor spending against limits. | One budget per category per month (`YYYY-MM`). Only applicable to `expense` categories. Spending is dynamically summed from transactions. | **In:** `category_id`, `month`, `amount`.<br>**Out:** Budget status, spent amount, remaining amount, percentage. | Duplicate budget for same category/month -> 409.<br>Budgeting on income category -> 422. | Clear progress bar indicating normal (<80%), warning (80-100%), and over-budget (>100%). | REQ-TX-01 | **P0** |
| **REQ-GOL-01** | As a user, I want to create savings goals with target amounts, target dates, and monthly allocations. | Target amount > 0. Initial saved >= 0. Monthly contribution >= 0. Estimated completion dynamically computed. | **In:** `name`, `target_amount`, `initial_saved`, `monthly_contribution`, `target_date`, `priority`, `note`.<br>**Out:** Goal entity + ETA months. | Target amount <= initial saved -> Allowed (marked 100% complete).<br>Negative amounts -> 422. | Goal card displays current saved, percentage, remaining IDR, and months to completion. | REQ-AUTH-01 | **P0** |
| **REQ-GOL-02** | As a user, I want to record contributions to my savings goals without double-counting as expenses. | Contribution amount > 0. Cumulative contributions cannot exceed remaining deficit unless deliberate overfunding. Does NOT create an expense row. | **In:** `goal_id`, `amount`, `date`, `note`.<br>**Out:** Contribution record + updated goal progress. | Inactive goal -> 422.<br>Zero or negative contribution -> 422.<br>Accessing another user's goal -> 403. | Goal progress bar advances; total monthly expenses on dashboard remain unaffected. | REQ-GOL-01 | **P0** |
| **REQ-REP-01** | As a user, I want reports filtered by daily, weekly, monthly, and custom date ranges. | Aggregates income, expenses, and net cash flow within `[start_date, end_date]`. Category breakdown sorted descending by volume. | **In:** `range_preset` or `start_date` + `end_date`.<br>**Out:** Total income, total expense, net flow, category breakdown list. | End date before start date -> 422.<br>Date span > 5 years -> 422. | KPI cards and percentage bar distribution match exact sum of transactions in range. | REQ-TX-01 | **P1** |
| **REQ-EXP-01** | As a user, I want to export my filtered transactions to a standard CSV file. | UTF-8 encoded with BOM (`\ufeff`) for Microsoft Excel compatibility. Escaped delimiters and quotes. Localized header titles. | **In:** Date range and filter criteria.<br>**Out:** Streaming CSV download (`text/csv`). | No records in range -> Returns empty file with headers or 404 alert. | Downloaded file opens cleanly in Excel, Numbers, and Google Sheets without encoding errors. | REQ-REP-01 | **P1** |
| **REQ-SEC-01** | As an engineer, I want all sensitive database access isolated by user ID and audit logged. | Zero trust of client user IDs. All SQL queries scoped with `WHERE user_id = $session_user_id`. Audit log on destructive actions. | **In:** Authenticated context.<br>**Out:** Safe queries and immutable audit entries. | Tampered `user_id` in request body -> Ignored; session ID enforced.<br>IDOR attack -> 404/403. | Pen-test verification: User B cannot read or alter User A's transactions or budgets. | REQ-AUTH-01 | **P0** |

---

## 4. Technology Stack Evaluation & Recommendation

### 4.1 Stack Comparison

| Architectural Dimension | Option A: Full-Stack React (SPA + Express Backend) + PostgreSQL | Option B: Next.js (App Router) + Serverless Edge + MongoDB |
| :--- | :--- | :--- |
| **Development Complexity** | **Low-Medium**: Clear separation of concerns, explicit REST endpoints, predictable node runtime, instant hot-reloading with Vite. | **High**: Hydration boundaries, React Server Component caching quirks, cold starts on serverless lambdas. |
| **Financial Data Integrity** | **Superior**: ACID transactions, strict schema types (`BIGINT`), foreign key constraints, check constraints (`amount > 0`). | **Inferior**: Document-based eventual consistency, manual referential integrity enforcement in app code. |
| **Operational & Hosting Cost** | **Zero-to-Low**: Single container or Cloud Run service with scale-to-zero Cloud SQL PostgreSQL. | **Moderate**: Serverless MongoDB Atlas tier + Vercel / Cloud Run invocation overheads. |
| **Security & Isolation** | **High**: Centralized Express auth middleware, deterministic parameter binding, parameterized SQL (no ORM bypass). | **Medium**: Prone to NoSQL injection if query objects are unvalidated; complex edge middleware logic. |
| **Maintainability & Testing** | **Excellent**: Pure functions testable via Node `node:test` or Vitest, standard Supertest API integration tests. | **Moderate**: Mocking server components and edge runtimes requires specialized test harnesses. |
| **Vendor Lock-in** | **Virtually Zero**: Standard PostgreSQL and Node.js container runs on any cloud (GCP, AWS, VPS, Docker). | **High**: Proprietary edge runtime patterns and Vercel-centric routing primitives. |

### 4.2 Stack Decision & Justification
**Selected Architecture: Option A — React 19 SPA (Vite) + Node.js Express REST API + PostgreSQL (Cloud SQL / Drizzle ORM)**.

**Rationale:**
1. **Mathematical & Relational Rigor:** Financial ledgers demand relational integrity. Deleting a category must be constrained if referenced by transactions; computing monthly category usage requires atomic SQL `GROUP BY` and `SUM(amount)` queries that relational databases execute with indexed efficiency.
2. **Deterministic Monetary Types:** PostgreSQL natively supports 64-bit integer (`BIGINT`) arithmetic, preventing IEEE-754 floating-point inaccuracies.
3. **Execution Environment Compatibility:** Matches the existing development repository structure (Vite + Express + TypeScript + Tailwind CSS) with zero wasted migration overhead.

---

## 5. System Architecture & Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT (BROWSER / PWA)                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Mobile-First UI (Tailwind CSS 4 + Lucide Icons + React 19)            │  │
│  │ Views: Dashboard | Transactions | Budgets | Goals | Reports | Settings│  │
│  │ Client Cache & UI State (Optimistic updates, Toast notifications)     │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │ HTTPS (TLS 1.3)
                                       │ Authorization: Bearer <JWT>
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     APPLICATION SERVER (EXPRESS + TSX)                      │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Global Middleware: Helmet (CSP/HSTS) | CORS | RateLimiter | JsonBody  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ Authentication & Authorization Guard (Verify JWT / Session Context)   │  │
│  │ Injects trusted `req.userId` (Client-supplied user IDs are discarded) │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ REST Controllers & Zod Schema Validation Pipeline                     │  │
│  │ ├─ TransactionController  ├─ BudgetController   ├─ GoalController     │  │
│  │ ├─ CategoryController     ├─ ReportController   ├─ ProfileController  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ Service Layer & Domain Calculation Engine                             │  │
│  │ (Pure math formulas: integer totals, budget % thresholds, goal ETAs)  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │ Parameterized Prepared Queries       │
│                                      │ (Drizzle ORM / pg connection pool)   │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RELATIONAL DATABASE (POSTGRESQL)                         │
│                                                                             │
│  ┌──────────────┐   1:N   ┌──────────────┐   1:N   ┌─────────────────────┐  │
│  │    users     ├────────►│  categories  ├────────►│    transactions     │  │
│  └──────┬───────┘         └──────┬───────┘         └─────────────────────┘  │
│         │                        │ 1:N                                      │
│         │ 1:N                    ▼                                          │
│         │                 ┌──────────────┐                                  │
│         ├────────────────►│   budgets    │                                  │
│         │                 └──────────────┘                                  │
│         │ 1:N                                                               │
│         ├────────────────►┌──────────────┐   1:N   ┌─────────────────────┐  │
│         │                 │    goals     ├────────►│ goal_contributions  │  │
│         │                 └──────────────┘         └─────────────────────┘  │
│         │ 1:N                                                               │
│         └────────────────►┌──────────────┐                                  │
│                           │  audit_logs  │                                  │
│                           └──────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Entity Relationship Diagram (ERD) & Data Dictionary

### 6.1 Database ERD

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│              users              │           │           categories            │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ id: UUID (PK)                   │1         N│ id: UUID (PK)                   │
│ email: VARCHAR(255) (UNIQUE)    ├──────────►│ user_id: UUID (FK, NULL=SYSTEM) │
│ password_hash: VARCHAR(255)     │           │ name: VARCHAR(50)               │
│ display_name: VARCHAR(60)       │           │ type: VARCHAR(10) [inc/exp]     │
│ language: VARCHAR(5) [id/en]    │           │ color: VARCHAR(7)               │
│ currency: VARCHAR(3) [IDR]      │           │ icon: VARCHAR(30)               │
│ created_at: TIMESTAMPTZ         │           │ is_default: BOOLEAN             │
│ updated_at: TIMESTAMPTZ         │           │ is_active: BOOLEAN              │
└───────────────┬─────────────────┘           └───────────────┬─────────────────┘
                │ 1                                           │ 1
                │                                             │
                ├──────────────────────┐                      │
                │ 1                    │ 1                    │
                ▼ N                    ▼ N                    ▼ N
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│          transactions           │  │             budgets             │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│ id: UUID (PK)                   │  │ id: UUID (PK)                   │
│ user_id: UUID (FK -> users.id)  │  │ user_id: UUID (FK -> users.id)  │
│ category_id: UUID (FK -> cat.id)│  │ category_id: UUID (FK -> cat.id)│
│ type: VARCHAR(10) [inc/exp]     │  │ month: VARCHAR(7) [YYYY-MM]     │
│ amount: BIGINT [> 0]            │  │ amount: BIGINT [> 0]            │
│ date: DATE [YYYY-MM-DD]         │  │ created_at: TIMESTAMPTZ         │
│ note: VARCHAR(140)              │  │ updated_at: TIMESTAMPTZ         │
│ created_at: TIMESTAMPTZ         │  └─────────────────────────────────┘
│ updated_at: TIMESTAMPTZ         │
└─────────────────────────────────┘
                │ 1
                ├──────────────────────┐
                │ 1                    │ 1
                ▼ N                    ▼ N
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│              goals              │  │           audit_logs            │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│ id: UUID (PK)                   │  │ id: BIGSERIAL (PK)              │
│ user_id: UUID (FK -> users.id)  │  │ user_id: UUID (FK -> users.id)  │
│ name: VARCHAR(70)               │  │ action: VARCHAR(50)             │
│ target_amount: BIGINT [> 0]     │  │ entity_type: VARCHAR(30)        │
│ initial_saved: BIGINT [>= 0]    │  │ entity_id: UUID                 │
│ monthly_contribution: BIGINT    │  │ metadata: JSONB                 │
│ target_date: DATE (NULLABLE)    │  │ ip_address: VARCHAR(45)         │
│ priority: VARCHAR(10) [h/m/l]   │  │ created_at: TIMESTAMPTZ         │
│ note: VARCHAR(180)              │  └─────────────────────────────────┘
│ is_completed: BOOLEAN           │
│ created_at: TIMESTAMPTZ         │
│ updated_at: TIMESTAMPTZ         │
└───────────────┬─────────────────┘
                │ 1
                │
                ▼ N
┌─────────────────────────────────┐
│       goal_contributions        │
├─────────────────────────────────┤
│ id: UUID (PK)                   │
│ goal_id: UUID (FK -> goals.id)  │
│ user_id: UUID (FK -> users.id)  │
│ amount: BIGINT [> 0]            │
│ date: DATE [YYYY-MM-DD]         │
│ note: VARCHAR(140)              │
│ created_at: TIMESTAMPTZ         │
└─────────────────────────────────┘
```

### 6.2 Data Dictionary & Integrity Rules

#### 1. `users` Table
| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique user identifier. |
| `email` | `VARCHAR(255)` | No | `UNIQUE, LOWER(email)` | Normalized login email. |
| `password_hash`| `VARCHAR(255)` | No | Argon2id hash | Securely salted password hash. |
| `display_name` | `VARCHAR(60)` | No | `CHECK (LENGTH(TRIM(display_name)) > 0)` | Profile name. |
| `language` | `VARCHAR(5)` | No | `DEFAULT 'id', CHECK (language IN ('id', 'en'))` | UI language preference. |
| `currency` | `VARCHAR(3)` | No | `DEFAULT 'IDR', CHECK (currency = 'IDR')` | Currency code. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT NOW()` | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT NOW()` | Last update timestamp. |

#### 2. `categories` Table
| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Category identifier. |
| `user_id` | `UUID` | Yes | `REFERENCES users(id) ON DELETE CASCADE` | Owner ID (`NULL` for global defaults). |
| `name` | `VARCHAR(50)` | No | `CHECK (LENGTH(TRIM(name)) > 0)` | Category label. |
| `name_en` | `VARCHAR(50)` | Yes | | English localized label for defaults. |
| `type` | `VARCHAR(10)` | No | `CHECK (type IN ('income', 'expense'))` | Transaction classification. |
| `color` | `VARCHAR(7)` | No | `CHECK (color ~* '^#[0-9a-f]{6}$')` | Hex color code. |
| `icon` | `VARCHAR(30)` | No | Supported Lucide icon key | Display icon glyph. |
| `is_default` | `BOOLEAN` | No | `DEFAULT FALSE` | System default flag. |
| `is_active` | `BOOLEAN` | No | `DEFAULT TRUE` | Soft-deletion flag. |

*Unique Index:* `CREATE UNIQUE INDEX uq_user_category ON categories (COALESCE(user_id, '00000000-0000-0000-0000-000000000000'), LOWER(name), type) WHERE is_active = TRUE;`

#### 3. `transactions` Table
| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Transaction identifier. |
| `user_id` | `UUID` | No | `REFERENCES users(id) ON DELETE CASCADE` | Data ownership isolation. |
| `category_id` | `UUID` | No | `REFERENCES categories(id) ON DELETE RESTRICT` | Referenced category. |
| `type` | `VARCHAR(10)` | No | `CHECK (type IN ('income', 'expense'))` | Type classification. |
| `amount` | `BIGINT` | No | `CHECK (amount > 0)` | Whole IDR value (never floating point). |
| `date` | `DATE` | No | ISO calendar date (`YYYY-MM-DD`) | Transaction occurrence date. |
| `note` | `VARCHAR(140)` | Yes | | User note/memo. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT NOW()` | System creation time. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT NOW()` | System update time. |

*Indexes:*
- `CREATE INDEX idx_transactions_user_date ON transactions (user_id, date DESC);`
- `CREATE INDEX idx_transactions_user_category ON transactions (user_id, category_id, date);`

#### 4. `budgets` Table
| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Budget entry identifier. |
| `user_id` | `UUID` | No | `REFERENCES users(id) ON DELETE CASCADE` | Data ownership isolation. |
| `category_id` | `UUID` | No | `REFERENCES categories(id) ON DELETE RESTRICT` | Budgeted expense category. |
| `month` | `VARCHAR(7)` | No | `CHECK (month ~ '^[0-9]{4}-(0[1-9]\|1[0-2])$')` | Month in `YYYY-MM` format. |
| `amount` | `BIGINT` | No | `CHECK (amount > 0)` | Maximum budget ceiling in IDR. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT NOW()` | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT NOW()` | Last modification timestamp. |

*Unique Constraint:* `CREATE UNIQUE INDEX uq_user_budget_month ON budgets (user_id, category_id, month);`

#### 5. `goals` Table
| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Goal identifier. |
| `user_id` | `UUID` | No | `REFERENCES users(id) ON DELETE CASCADE` | Owner user ID. |
| `name` | `VARCHAR(70)` | No | `CHECK (LENGTH(TRIM(name)) > 0)` | Target objective name. |
| `target_amount`| `BIGINT` | No | `CHECK (target_amount > 0)` | Target IDR sum. |
| `initial_saved`| `BIGINT` | No | `DEFAULT 0, CHECK (initial_saved >= 0)` | Seed savings already held. |
| `monthly_contribution` | `BIGINT` | No | `DEFAULT 0, CHECK (monthly_contribution >= 0)` | Planned monthly savings rate. |
| `target_date` | `DATE` | Yes | Target completion date. |
| `priority` | `VARCHAR(10)` | No | `DEFAULT 'medium', CHECK (priority IN ('high', 'medium', 'low'))` | Urgency tier. |
| `note` | `VARCHAR(180)` | Yes | | Goal context / rationale. |
| `is_completed` | `BOOLEAN` | No | `DEFAULT FALSE` | Manual or calculated completion flag. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT NOW()` | Goal creation timestamp. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT NOW()` | Goal update timestamp. |

#### 6. `goal_contributions` Table
| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Contribution identifier. |
| `goal_id` | `UUID` | No | `REFERENCES goals(id) ON DELETE CASCADE` | Parent goal. |
| `user_id` | `UUID` | No | `REFERENCES users(id) ON DELETE CASCADE` | User ownership check. |
| `amount` | `BIGINT` | No | `CHECK (amount > 0)` | Allocated savings in IDR. |
| `date` | `DATE` | No | Occurrence date (`YYYY-MM-DD`). |
| `note` | `VARCHAR(140)` | Yes | | Allocation memo. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT NOW()` | Creation timestamp. |

#### 7. `audit_logs` Table
| Column Name | Data Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | No | `PRIMARY KEY` | Incremental log sequence. |
| `user_id` | `UUID` | Yes | Indexed user reference | Actor user. |
| `action` | `VARCHAR(50)` | No | e.g., `DELETE_TRANSACTION` | Performed operation. |
| `entity_type` | `VARCHAR(30)` | No | `transaction`, `budget`, `goal` | Target domain entity. |
| `entity_id` | `UUID` | Yes | Affected record ID. |
| `metadata` | `JSONB` | Yes | Old/new values snapshot. |
| `ip_address` | `VARCHAR(45)` | Yes | Client IP address. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT NOW()` | Immutable log timestamp. |

---

## 7. Financial Calculation Specifications

All monetary calculations are performed strictly using integer math in whole IDR currency units. Floating-point division is permitted only for ratio and percentage derivation, with explicit boundary checks against division by zero.

### 7.1 Income, Expense, and Net Cash Flow
Given a set of transactions $T$ within a specific date range $[D_{start}, D_{end}]$ for user $U$:

$$\text{Income Total } (I) = \sum_{t \in T, t.type = \text{'income'}} t.amount$$

$$\text{Expense Total } (E) = \sum_{t \in T, t.type = \text{'expense'}} t.amount$$

$$\text{Net Cash Flow } (N) = I - E$$

**Edge Cases & Rules:**
- If $T = \emptyset$, $I = 0$, $E = 0$, $N = 0$.
- $N$ can be negative. UI formats negative values cleanly as `−Rp 1.500.000` with high-contrast red warning styling.
- Transactions with $amount \le 0$ are rejected at the API schema boundary and cannot exist in $T$.

### 7.2 Budget Utilization & Remaining Budget
For a given category $C$ and calendar month $M = \text{'YYYY-MM'}$ with defined budget ceiling $B_{C,M}$:

$$\text{Spent Amount } (S_{C,M}) = \sum_{t \in T, t.categoryId = C \land \text{month}(t.date) = M \land t.type = \text{'expense'}} t.amount$$

$$\text{Remaining Budget } (R_{C,M}) = B_{C,M} - S_{C,M}$$

$$\text{Utilization Percentage } (P_{C,M}) = \begin{cases} 
0 & \text{if } B_{C,M} \le 0 \\
\text{round}\left(\frac{S_{C,M}}{B_{C,M}} \times 100\right) & \text{if } B_{C,M} > 0 
\end{cases}$$

**UI Status States:**
- $P_{C,M} < 80\% \implies \textbf{On Track}$ (`#81b98d` calm green fill).
- $80\% \le P_{C,M} \le 100\% \implies \textbf{Near Limit}$ (`#e2a06f` amber warning fill).
- $P_{C,M} > 100\% \implies \textbf{Over Budget}$ (`#d57367` alert red fill; $R_{C,M} < 0$, labeled as "melewati anggaran").

### 7.3 Goal Progress & Estimated Completion Time (ETA)
For a financial goal $G$:

$$\text{Current Saved } (S_G) = G.initial\_saved + \sum_{c \in \text{Contributions}_G} c.amount$$

$$\text{Remaining Target } (Rem_G) = \max(0, G.target\_amount - S_G)$$

$$\text{Goal Progress } (Prog_G) = \begin{cases}
100\% & \text{if } G.target\_amount \le 0 \lor S_G \ge G.target\_amount \\
\min\left(100, \text{round}\left(\frac{S_G}{G.target\_amount} \times 100\right)\right) & \text{otherwise}
\end{cases}$$

$$\text{Estimated Months to Completion } (ETA_G) = \begin{cases}
0 & \text{if } Rem_G = 0 \\
\text{null / undefined} & \text{if } G.monthly\_contribution \le 0 \\
\left\lceil \frac{Rem_G}{G.monthly\_contribution} \right\rceil & \text{if } G.monthly\_contribution > 0
\end{cases}$$

**Handling Boundary Anomalies:**
- **Zero Monthly Contribution:** UI must not display `NaN` or `Infinity`. It displays a clear prompt: *"Atur alokasi bulanan untuk melihat estimasi waktu."*
- **Overfunded Goals:** If $S_G > G.target\_amount$, $Rem_G = 0$, progress is clamped to $100\%$, and status is tagged *"Target tercapai"*.
- **Double-Counting Prevention (Core Constraint):** Adding a goal contribution does **not** create a row in the `transactions` table. Goal contributions are pure asset transfers toward an objective and do not artificially inflate monthly operational expenses.

---

## 8. API Specifications & Contracts

### 8.1 Global Standards
- **Base URL:** `/api/v1`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <JWT>`
- **Standard Error Response:**
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Jumlah transaksi harus lebih besar dari 0.",
      "details": [{ "field": "amount", "issue": "must be > 0" }]
    }
  }
  ```

### 8.2 Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/v1/user/profile` | Retrieve profile and settings | Yes |
| `PATCH`| `/api/v1/user/profile` | Update display name and language | Yes |
| `GET` | `/api/v1/categories` | List default & user categories | Yes |
| `POST` | `/api/v1/categories` | Create custom category | Yes |
| `PATCH`| `/api/v1/categories/:id`| Update custom category | Yes |
| `DELETE`|`/api/v1/categories/:id`| Soft-delete/deactivate category | Yes |
| `GET` | `/api/v1/transactions` | Query filtered transactions | Yes |
| `POST` | `/api/v1/transactions` | Create new transaction | Yes |
| `PUT` | `/api/v1/transactions/:id` | Update transaction | Yes |
| `DELETE`|`/api/v1/transactions/:id` | Delete transaction | Yes |
| `GET` | `/api/v1/budgets` | Get budgets for month with usage | Yes |
| `POST` | `/api/v1/budgets` | Set or update monthly budget | Yes |
| `DELETE`|`/api/v1/budgets/:id` | Remove budget | Yes |
| `GET` | `/api/v1/goals` | List all goals with calculated progress | Yes |
| `POST` | `/api/v1/goals` | Create financial goal | Yes |
| `PUT` | `/api/v1/goals/:id` | Update goal parameters | Yes |
| `DELETE`|`/api/v1/goals/:id` | Delete goal and contributions | Yes |
| `POST` | `/api/v1/goals/:id/contributions` | Record savings allocation | Yes |
| `GET` | `/api/v1/reports/summary` | Aggregate analytics & category split | Yes |
| `GET` | `/api/v1/reports/export.csv` | Stream CSV of filtered records | Yes |

### 8.3 Key Request & Response Payloads

#### `POST /api/v1/transactions`
**Request:**
```json
{
  "type": "expense",
  "amount": 45000,
  "categoryId": "48b61c14-2794-4d83-9993-4a11f2f012aa",
  "date": "2026-10-22",
  "note": "Kopi susu & roti bakar"
}
```
**Response (201 Created):**
```json
{
  "data": {
    "id": "e7b0a726-215c-4c6e-8210-907137f8f941",
    "type": "expense",
    "amount": 45000,
    "categoryId": "48b61c14-2794-4d83-9993-4a11f2f012aa",
    "date": "2026-10-22",
    "note": "Kopi susu & roti bakar",
    "createdAt": "2026-10-22T06:20:00Z"
  }
}
```

#### `GET /api/v1/budgets?month=2026-10`
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "bdg-1",
      "categoryId": "48b61c14-2794-4d83-9993-4a11f2f012aa",
      "categoryName": "Makan & minum",
      "month": "2026-10",
      "budgetAmount": 1500000,
      "spentAmount": 820000,
      "remainingAmount": 680000,
      "percentage": 55,
      "status": "on_track"
    }
  ]
}
```

---

## 9. Security Threat Model (STRIDE) & Mitigations

| Threat Category | Material Risk & Attack Vector | Impact | Mitigation Architecture | Verification Test |
| :--- | :--- | :--- | :--- | :--- |
| **Broken Access Control / IDOR** | Attacker substitutes another user's `id` in `/api/v1/transactions/:id` to view or delete their records. | Complete compromise of confidentiality and data destruction. | All queries enforce `WHERE id = $1 AND user_id = $sessionUserId`. Client-supplied user IDs in bodies are stripped. | Automated test: User B executes `DELETE /api/v1/transactions/{UserA_TxID}` $\implies$ Assert 404 Not Found. |
| **Cross-User Data Leakage** | Caching layers or shared memory pools leaking financial balances across sessions. | Privacy violation under personal data protection laws (UU PDP). | No in-memory shared user state; Cache-Control headers set to `no-store, private` on all authenticated financial endpoints. | Integration test verifying authenticated responses include `Cache-Control: private, no-store`. |
| **SQL Injection** | Malicious input injected via transaction search query or memo notes. | Remote code execution or database exfiltration. | 100% Parameterized queries via Drizzle ORM / node-pg. No raw string interpolation. | Security test sending `' OR '1'='1` and `"; DROP TABLE transactions;--` $\implies$ Treated as literal text. |
| **Cross-Site Scripting (XSS)** | Malicious HTML/JS injected via transaction note or category name. | Session token theft or unauthorized client actions. | Strict CSP header (`script-src 'self'`); React auto-escapes JSX text; sanitization helper on CSV export. | Inject `<script>alert(1)</script>` in transaction note $\implies$ Rendered as harmless encoded text string. |
| **Mass Assignment** | Client passes `{"is_default": true, "user_id": "victim"}` when creating categories. | Privilege escalation or corrupted shared categories. | Zod schema whitelist validation. Only explicitly allowed fields are unpacked. | POST payload with injected extraneous fields $\implies$ Zod drops or rejects unauthorized keys. |
| **Export Abuse / DoS** | Malicious script requests CSV export for millions of records concurrently. | Server memory exhaustion and CPU denial of service. | Rate limiting (`express-rate-limit` max 10 exports per minute per user); row limit cap of 50,000 records per export. | Rapid 15x export requests in 5 seconds $\implies$ 11th request receives HTTP 429 Too Many Requests. |
| **CSV Formula Injection** | Note starting with `=CMD\|' /C calc'!A0` or `=SUM(...)`. | Client-side spreadsheet execution on accountant/user machine. | Prepend single quote `'` or tab character to any string beginning with `=`, `+`, `-`, or `@`. | Export transaction with note `=1+1` $\implies$ Output CSV cell formatted as `"'=1+1"`. |

---

## 10. UI/UX Specification (Aligned with Prototype)

The UI architecture directly adopts the proven tactile design tokens and layout from the user's provided prototype asset (`/public/assets/aistudio/money_tracker_5ccfa2be.html`):

### 10.1 Design Tokens
- **Background Atmosphere:** `--bg: #f5f6f1` (calm organic neutral, non-harsh light mode).
- **Surface Elevation:** `--surface: #ffffff` with 1px border `#e8ece5` and soft ambient shadow `0 4px 18px rgba(39,58,39,0.022)`.
- **Primary Ink:** `--ink: #202923` (deep slate forest green/black for high readability).
- **Muted Ink:** `--muted: #788079`.
- **Primary Accent:** `--accent: #27694c` (rich emerald green) and `--accent-deep: #174d36`.
- **Income Accent:** `#287448` on light background `#e9f4eb`.
- **Expense Accent:** `#bd704d` / `#db815e` on light background `#fff0e8`.
- **Border Radius:** `--radius: 22px` for main cards; `13px` for interactive buttons and inputs.
- **Typography:** `Plus Jakarta Sans`, system fallback `sans-serif`.

### 10.2 Navigation & Responsive Behavior
- **Desktop (Viewport $\ge 768\text{px}$):**
  - Persistent left sidebar (244px) with brand mark, navigation links, prototype status badge, and profile gear.
  - Top action bar with breadcrumb, quick language dropdown (`ID` / `EN`), and quick `+` transaction button.
- **Mobile (Viewport $< 768\text{px}$):**
  - Fixed mobile bottom navigation with 5 thumb-friendly items: `Ringkasan`, `Transaksi`, elevated circular center `+ Tambah` action button, `Anggaran`, `Tujuan`.
  - Secondary pages (`Kategori`, `Laporan`, `Pengaturan`) accessible via slide-over drawer triggered by header menu toggle.
  - Desktop data table transforms into stacked high-density card components with clear visual badges.

### 10.3 Five Mandatory Interface States
1. **Loading State:** Subtle skeleton shimmer matching card radius (never blocking layout jump).
2. **Empty State:** Clean centered spark icon, explanatory copy, and clear primary CTA button (e.g., *"Belum ada transaksi — Catat pemasukan atau pengeluaran"*).
3. **Success State:** Non-intrusive floating toast alert in bottom-right (mobile) or top-right (desktop) auto-dismissing after 3.3 seconds.
4. **Error State:** Field-level inline micro-copy in red (`#b84b40`) with `aria-invalid="true"` attributes and top banner summary.
5. **Confirmation State:** Backdrop-dimmed modal with explicit destruction warning and red danger button for deletions.

---

## 11. Test Plan & Release Quality Gates

### 11.1 Test Pyramid Strategy
1. **Unit Tests (`node:test` / Vitest):**
   - Pure domain calculation formulas (income/expense sums, net flow, budget usage %, goal ETA ceil rounding).
   - Date range slicing and timezone preservation across WIB (UTC+7) boundaries.
   - CSV formula escaping helper functions.
2. **Integration & API Tests (Supertest):**
   - Full REST endpoint validation with positive, negative, and boundary payloads.
   - Authentication middleware token verification and expiration.
   - IDOR prevention checks verifying cross-user isolation.
3. **End-to-End & Playwright Verification:**
   - User creates income transaction $\implies$ verifies dashboard metrics update.
   - User creates expense transaction $\implies$ verifies budget utilization bar increases.
   - User switches language from Indonesian to English $\implies$ verifies all text updates.
   - Mobile viewport check (390px iPhone 14) ensuring no horizontal overflow and bottom bar tap targets $\ge 44\text{px}$.

### 11.2 Release Quality Gates
- **Gate 1 (Build & Types):** Zero TypeScript compilation errors (`tsc --noEmit`).
- **Gate 2 (Linter):** Zero ESLint warnings or errors (`npm run lint`).
- **Gate 3 (Test Coverage):** 100% pass rate on financial business logic unit tests.
- **Gate 4 (Security Gate):** Clean audit with no high-severity vulnerabilities (`npm audit`).
- **Gate 5 (Accessibility):** WCAG 2.1 AA compliance: all interactive controls have accessible names, form inputs paired with labels, contrast ratio $\ge 4.5:1$.

---

## 12. Deployment & Operational Strategy

### 12.1 Environment Configuration
```ini
# Server Runtime
PORT=3000
NODE_ENV=production
APP_URL=https://ais-dev-7gidto22eponlbi2adqt6o-342609493082.asia-southeast1.run.app

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/money_tracker?sslmode=require

# Authentication
JWT_SECRET=super_secret_sha256_key_min_32_characters
JWT_EXPIRES_IN=7d
```

### 12.2 Database Migration & Backup Strategy
- **Migration Tool:** Drizzle Kit migrations (`drizzle-kit generate` & `drizzle-kit migrate`).
- **Rollback Plan:** Every migration step accompanied by a forward and down script tested against staging replicas.
- **Automated Backup Schedule:** Daily automated point-in-time recovery (PITR) snapshots retained for 30 days on Cloud SQL.
- **Restore Verification Drill:** Monthly automated test spinning up a temporary instance from backup to verify zero corruption.

---

## 13. Implementation Roadmap

```
  ┌──────────────────────────────────────────────────────────────────┐
  │ MILESTONE 1: Relational Data Model, Drizzle Schema & Core Engine │
  │ Scope: DB tables, constraints, integer math unit tests           │
  └────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ MILESTONE 2: Express REST API & Authentication Boundaries        │
  │ Scope: Zod validation, JWT middleware, transaction & budget CRUD │
  └────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ MILESTONE 3: Reactive Frontend Views & Design Token Integration  │
  │ Scope: Dashboard, Transactions, Budgets, Goals, Reports, Settings│
  └────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ MILESTONE 4: Bilingual Engine & CSV Export Engine                │
  │ Scope: ID/EN dictionary synchronization, UTF-8 CSV download      │
  └────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ MILESTONE 5: Security Hardening, E2E Verification & Launch       │
  │ Scope: IDOR tests, rate limiting, mobile viewport verification   │
  └──────────────────────────────────────────────────────────────────┘
```

### Detailed Milestone Breakdown

#### Milestone 1: Data Model, Database Schema & Core Math Engine
- **Scope:** Define PostgreSQL schema (tables, foreign keys, check constraints, unique indexes). Implement pure calculation functions for totals, budgets, and goal ETAs.
- **Files Affected:** `src/db/schema.ts`, `src/lib/calculations.ts`, `test/calculations.test.ts`.
- **Deliverables:** Drizzle schema migration file, 100% unit test pass on financial formulas.
- **Acceptance Criteria:** Integer math handles large sums without precision loss; negative budgets and invalid dates are rejected by check constraints.

#### Milestone 2: Express REST API & Security Boundaries
- **Scope:** Auth endpoints (login/register), transaction CRUD, budget CRUD, goal CRUD, category CRUD with Zod validation and user-isolation middleware.
- **Files Affected:** `server.ts`, `src/api/routes/*.ts`, `src/api/middleware/auth.ts`.
- **Deliverables:** Functional API endpoints running on port 3000.
- **Acceptance Criteria:** Supertest suite validates that User B receives 404/403 when trying to access User A's data.

#### Milestone 3: Reactive Frontend Implementation
- **Scope:** Port the comprehensive UI from `money_tracker_5ccfa2be.html` into modern modular React 19 components with Tailwind CSS.
- **Files Affected:** `src/App.tsx`, `src/components/*.tsx`, `src/hooks/*.ts`.
- **Deliverables:** Complete interactive UI (Dashboard, Transactions, Budgets, Goals, Reports, Settings) running seamlessly in Vite dev server.
- **Acceptance Criteria:** Zero layout shift, bottom navigation for mobile, interactive modal dialogs for all CRUD operations.

#### Milestone 4: Bilingual Engine & CSV Export
- **Scope:** Complete Indonesian (`id`) and English (`en`) dictionary toggle, UTF-8 BOM CSV streaming with formula injection protection.
- **Files Affected:** `src/i18n/*.ts`, `src/services/exportService.ts`.
- **Deliverables:** Instant language switching across all screens; compliant CSV exports.
- **Acceptance Criteria:** CSV opens cleanly in Microsoft Excel with correct Indonesian characters and no formula execution hazards.

#### Milestone 5: Verification, Release Gates & Handover
- **Scope:** End-to-end testing with Playwright CLI, performance audit, mobile responsive verification on 390px viewports, documentation update.
- **Files Affected:** `package.json`, `README.md`.
- **Deliverables:** Clean compilation (`npm run build`), zero lint errors (`npm run lint`), verified UI across mobile and desktop.
