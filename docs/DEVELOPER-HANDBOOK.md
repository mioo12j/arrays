# ARRAYS ERP — Developer Handbook

**Audience:** the next engineer or AI assistant who opens this repository with zero prior context.
**Goal:** after reading this document you should understand *what this software is, who uses it, what every module does, which file implements it, why it was built that way, and how to safely change it* — without having to read 29,000 lines of code first.

> **Read this first, then `SYSTEM-GUIDE.md` (plain-language overview) and `FUNCTIONAL-ISSUES.md` (known logic bugs).**
> This handbook is the deep reference. Where this file and older docs disagree, **this file is newer** — but verify against the code before trusting either.

---

## Table of contents

1. [The business this software runs](#1-the-business-this-software-runs)
2. [Who uses it — roles and permissions](#2-who-uses-it--roles-and-permissions)
3. [Running it locally](#3-running-it-locally)
4. [Architecture and request lifecycle](#4-architecture-and-request-lifecycle)
5. [Repository map](#5-repository-map)
6. [The core domain model](#6-the-core-domain-model)
7. [Module deep-dive](#7-module-deep-dive)
8. [The database](#8-the-database)
9. [The PDF engine](#9-the-pdf-engine)
10. [Frontend architecture](#10-frontend-architecture)
11. [Cross-cutting concerns](#11-cross-cutting-concerns)
12. [Operational runbook](#12-operational-runbook)
13. [Gotchas that will bite you](#13-gotchas-that-will-bite-you)
14. [Known issues and tech debt](#14-known-issues-and-tech-debt)
15. [Glossary](#15-glossary)

---

## 1. The business this software runs

### 1.1 The company

**Arrays Ingenieria Private Limited (AIPL)** is an Indian **Solar EPC contractor**. EPC = *Engineering, Procurement, Construction*: the company designs a solar power plant, buys the equipment, builds it on the client's site, connects it to the grid, and maintains it.

The company is veteran-led (CEO **Lt. Gen. A.R. Prasad, Retd**) and does two kinds of work:

- **Solar EPC** — rooftop and ground-mount solar plants (residential, commercial, industrial, PSU/government).
- **Civil & allied works** — piling, foundations, tensile structures, earthing, fencing — sometimes as a subcontractor to larger EPC firms (e.g. Tata Power Solar).

Real clients on record include Tata Power, Tata Steel, Tata Motors, Bharat Petroleum, DCM, Super Smelters, Jayshree Tea, Manjushree, YIAPL.

### 1.2 Why this software exists

This is an **in-house ERP** replacing spreadsheets and manual paperwork. It is **single-operator, local-first**: it runs on the company's own Windows machine against a local PostgreSQL database, with an optional push to a cloud database so a second machine can read the same data.

It does four broad jobs:

| Job | What it means in practice |
|---|---|
| **Money tracking** | Every rupee paid out and received, matched against the bank statement, attributed to a vendor/client/project. |
| **Statutory compliance** | GST e-invoices (IRN/QR), e-way bills, delivery challans (Rule 55), GST returns reconciliation. |
| **Sales documents** | Client-facing proposals, commercial quotations and Bills of Quantities as premium PDFs. |
| **Records & recovery** | Audit log, soft-delete with restore, automatic backups, document/proof vault. |

### 1.3 The mental model of a project's life

```
Lead → Quotation (proposal + commercial quote + BOQ PDF)
     → Client accepts → Project created (PO number, contract value)
     → Purchases: payments to vendors (materials, labour, transport)
     → Billing: invoices raised on the client (proforma → tax invoice)
     → Client pays: receipts recorded, invoice status auto-updates
     → Bank statement imported monthly → every line matched to a payment/receipt
     → GST: e-invoice IRN generated, e-way bill for transport, challan for site delivery
     → Reports: profitability per project, receivable aging, vendor spend
```

Everything in the codebase serves one of those steps.

---

## 2. Who uses it — roles and permissions

There are **four role values** in the `user_role` enum (`admin`, `operator`, `editor`, `auditor`), but in practice **two accounts matter**:

| Role | Who | Can do |
|---|---|---|
| **`editor`** | The owner/operator. **This is the super-admin.** | Everything: create, edit, delete, import, export, data tools, user management. |
| **`admin`** | Oversight account. **View-only by design.** | See everything. **Cannot** write, import, or download/export. |

`operator` and `auditor` exist in the enum for future use but are not the primary accounts.

### 2.1 How this is enforced

`server/src/middleware/rbac.js` — four guards, applied per-route:

```js
adminOnly            // requireRole('admin','editor')  — admin + editor
editorOnly           // requireRole('editor')          — editor exclusively
noImportForAdmin     // blocks admin on upload/OCR/import endpoints
denyExportForAdmin   // blocks admin on download/export endpoints
denyWriteForAdmin    // blocks admin on any non-GET method for a whole router
```

The frontend mirrors this: `client/src/api/client.js` exports `blockExportForAdmin()` which shows a toast and refuses downloads client-side, and `App.jsx` wraps routes in `<Protected editorOnly>` / `<Protected adminOnly>`.

> **Security note:** the frontend guard is UX only. The server guard is the real one. Never rely on hiding a button.

### 2.2 Authentication

- **JWT bearer tokens.** `server/src/utils/token.js` signs, `middleware/auth.js` verifies and populates `req.user = { id, role, name, email }`.
- Token in `localStorage` under `epc_token`; user object under `epc_user`.
- **The login field is `email`, not `username`** — but the seeded values are bare words, not addresses:

```
editor / editor@123    (super-admin, is_protected = true)
admin  / admin@123     (view-only)
```

Seeded by `server/src/db/seed.js`. **These are default development credentials — change them before any real deployment.**

- `middleware/auth.js` also enforces **maintenance mode** and **read-only mode** (from `app_config`): in maintenance only admin/editor pass; in readonly only editor may mutate.

---

## 3. Running it locally

### 3.1 Prerequisites

- **Node.js** (ESM, Node 18+; developed on Node 24)
- **PostgreSQL** running locally
- Windows is the primary platform (PowerShell launcher scripts exist), but nothing is Windows-only except those scripts.

### 3.2 First-time setup

```bash
npm run install:all       # installs server + client deps
```

Create `server/.env` from `server/.env.example`. **`server/.env` is git-ignored and per-machine — it must never be committed.** Key variables:

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 4000) |
| `PGHOST` / `PGPORT` / `PGDATABASE` / `PGUSER` / `PGPASSWORD` | Local PostgreSQL |
| `DATABASE_URL` | Alternative to PG* vars; SSL auto-enabled (use for cloud-hosted runs) |
| `CLOUD_DATABASE_URL` | Neon connection string — target for "Publish to Cloud". Leave unset for local-only |
| `JWT_SECRET` | **Change this.** Long random string |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `UPLOAD_DIR`, `MAX_UPLOAD_MB` | Proof/statement file storage |

Then:

```bash
npm run db:migrate        # applies schema.sql + gst-schema.sql
npm run db:seed           # creates the editor/admin users
npm run build             # builds the React client into client/dist
npm start                 # starts server on :4000, serving client/dist
```

Open **http://localhost:4000**.

### 3.3 Day-to-day development

```bash
npm run dev:server        # nodemon, auto-restart
npm run dev:client        # vite dev server on :5173 (proxies API to :4000)
```

For the operator there is a one-click launcher: **`Start ARRAYS ERP.bat`** → `start-arrays.ps1`, which installs deps and builds the client if missing, starts the server only if port 4000 is free, and opens a chromeless browser window so it feels like a desktop app.

### 3.4 Useful server scripts (`server/package.json`)

| Script | What it does |
|---|---|
| `npm run migrate` | Apply `schema.sql` + `gst-schema.sql` (idempotent) |
| `npm run seed` | Upsert the editor/admin users |
| `npm run gst:seed` / `gst:demo` | GST master data / demo records |
| `npm run clear` | Wipe transactional data |
| `npm run reset-production` | Reset to a clean production state |
| `npm run import-company` | Import company master data |
| `npm run sync` | Publish local DB → `CLOUD_DATABASE_URL` |

---

## 4. Architecture and request lifecycle

### 4.1 Three layers

| Layer | Location | Stack |
|---|---|---|
| **Client** | `client/` | React 18, Vite, Tailwind, React Router, axios, Recharts, Framer Motion, lucide-react |
| **Server** | `server/src/` | Node (ESM), Express, `pg`, pdfkit, tesseract.js, pdfjs-dist, exceljs/xlsx, multer, zod, bcryptjs, jsonwebtoken |
| **Database** | PostgreSQL | `server/src/db/schema.sql` + `gst-schema.sql` |

In production the **server serves the built client** from `client/dist` on port 4000 — one origin, no CORS in practice.

### 4.2 Lifecycle of an API request

```
Browser (axios, api/client.js)
  → attaches Authorization: Bearer <epc_token>
    and x-gst-branch: <branch id>  (from localStorage 'gst_branch', unless 'all')
  → Express (server/src/index.js)
      → morgan logging
      → autoSyncOnWrite       (mounted on /api — schedules debounced cloud publish after writes)
      → authenticate          (JWT → req.user; maintenance/readonly gates)
      → rbac guard            (adminOnly / editorOnly / denyWriteForAdmin / …)
      → route handler         (routes/*.routes.js, wrapped in asyncHandler)
          → service layer     (services/*.js — business logic, SQL)
          → audit(req, {...}) (writes audit_logs)
      → error middleware      (middleware/error.js → { error, detail })
```

**Conventions:**
- Every async handler is wrapped in `asyncHandler` (`utils/asyncHandler.js`) so thrown errors reach the error middleware.
- Errors are thrown as `new ApiError(status, message)`.
- Routes are thin; anything non-trivial belongs in `services/`.

### 4.3 Route mounts (`server/src/index.js`)

```
/api/auth /api/users /api/projects /api/sites /api/vendors /api/employees
/api/clients /api/own-accounts /api/categories /api/payments /api/receipts
/api/invoices /api/reconciliation /api/dashboard /api/reports /api/documents
/api/audit /api/quotes /api/company /api/system /api/gst
```

### 4.4 Background schedulers

Started in `index.js` on boot:

- **proof-archive** — daily; zips proof/statement files older than 30 days into monthly archives (`services/proofArchiver.js`). Archived files still open transparently.
- **auto-backup** — every 2 hours, keeps 30 (`services/gst/autoBackup.js`).
- **recovery-purge** — daily; permanently deletes soft-deleted records older than 30 days (`services/gst/recoveryPurge.js`).
- **auto-sync** — debounced cloud publish after writes (`services/autoSync.js`).

`index.js` also installs **process guards** so a bad upload or failed publish cannot kill the server.

---

## 5. Repository map

```
epc/
├── client/                        React SPA
│   ├── src/
│   │   ├── api/client.js          axios instance, auth header, download(), blockExportForAdmin()
│   │   ├── components/
│   │   │   ├── ui/                Card, Table, Badge, Modal, Toast, ProofView, EmptyState, Loading…
│   │   │   ├── layout/            Shell, sidebar, header
│   │   │   ├── gst/               GST-specific widgets
│   │   │   ├── AllocationModal.jsx  split a payment across projects/sites
│   │   │   └── UpdateNotice.jsx
│   │   ├── lib/                   format.js (inr, fmtDate, titleCase), useFetch.js, gst.js,
│   │   │                          dateRange.js, pincode.js, qrScan.js, i18n-dict.js, langPrompt.js
│   │   ├── pages/                 ONE FILE PER SCREEN (44 pages)
│   │   └── App.jsx                all routes + role gating
│   └── dist/                      build output — served by the server
├── server/
│   ├── src/
│   │   ├── index.js               app bootstrap, route mounts, schedulers, process guards
│   │   ├── config/                db.js (pool + query), env.js, company.js
│   │   ├── middleware/            auth.js, rbac.js, audit.js, error.js, upload.js
│   │   ├── utils/                 asyncHandler.js (+ApiError), token.js
│   │   ├── routes/                21 route files — HTTP layer
│   │   ├── services/              business logic (see §7)
│   │   │   └── gst/               ~39 GST sub-services
│   │   ├── db/                    schema.sql, gst-schema.sql, migrate.js, seed.js, sync-to-cloud.js,
│   │   │                          clear-data.js, reset-production.js, import-company.js, gst-seed.js
│   │   └── assets/brand/          fonts/, photos/, logo, press images  ← PDF assets live HERE
│   └── .env                       GIT-IGNORED, per-machine secrets
├── docs/                          ADMIN_GUIDE, DEVELOPER, ERROR_CODES, reports, THIS FILE
├── SYSTEM-GUIDE.md                plain-language system overview
├── FUNCTIONAL-ISSUES.md           known logic bugs, ranked
├── README.md / SETUP.md / DEPLOY.md
└── start-arrays.ps1 / "Start ARRAYS ERP.bat"
```

**Rule of thumb for "where do I change X?"** → screen: `client/src/pages/X.jsx` · endpoint: `server/src/routes/X.routes.js` · logic/SQL: `server/src/services/X.js` · tables: `server/src/db/schema.sql`.

---

## 6. The core domain model

### 6.1 Everything is a ledger

This is **the single most important concept in the system.**

`ledger_entries` (`services/ledger.service.js`) is a double-sided party ledger. A **vendor** is someone you pay; a **client** is someone who pays you; an **employee** is a third party type.

**Balances are never stored.** They are computed by views (`v_vendor_balances`, `v_client_balances`, `v_employee_balances`) from the entries, so balances always reconcile with the underlying documents.

**Direction convention** (get this wrong and every number is wrong):

| Party | `debit` means | `credit` means |
|---|---|---|
| **Client** | You billed them — receivable ↑ | They paid you — receivable ↓ |
| **Vendor** | You paid them — payable ↓ | They billed you — payable ↑ |

**Edit/delete semantics:** the code never patches a balance. It calls `removeLedgerForSource(db, sourceType, sourceId)` to delete the old entries, then `postLedgerEntry(...)` to post fresh ones. That is why deleting a payment correctly repairs a vendor balance.

Key functions in `services/ledger.service.js`:

```js
postLedgerEntry(db, { partyType, partyId, direction, amount, entryDate,
                      description, projectId, siteId, sourceType, sourceId, userId })
removeLedgerForSource(db, sourceType, sourceId)
refreshInvoiceStatus(db, invoiceId)   // recomputes partially_paid / paid / overdue
```

`db` may be a pooled client inside a transaction or the pool itself — always pass the transaction client when inside `withTransaction`.

### 6.2 Allocation (splitting money across projects)

One payment or receipt can span several projects/sites. Rather than duplicating rows, the split lives in `outgoing_payment_allocations` / `incoming_payment_allocations`, surfaced through `v_outgoing_alloc` / `v_incoming_alloc`.

**The amount, date, reference and party stay locked once saved** — only the split table changes. Project rollups and expense-by-project reports read the allocation views so split money attributes correctly.

### 6.3 Own accounts (internal transfers)

`own_accounts` records the company's *own* bank accounts. When money moves between them (current ↔ OD), it is **not** income or expense.

`services/ownAccountsService.js` matches a bank line against own accounts by **account digits** and **normalized holder name**. Payments carry a `transaction_type` (`expense` / `internal_transfer` / `financing`) so transfers can be excluded from P&L. A **Re-scan existing** button reclassifies historical rows.

> This exists because reconciliation originally assumed *every debit is an expense and every credit is income* — see `FUNCTIONAL-ISSUES.md` #1/#2.

---

## 7. Module deep-dive

### 7.1 Payments — money out
**Routes** `routes/payments.routes.js` · **Service** `services/paymentService.js`, `allocationService.js` · **Page** `pages/Payments.jsx`

Two entry paths:
1. **Proof import** — upload a payment screenshot/PDF → `POST /payments/extract` → OCR (`ocr.service.js → parsePaymentFields`) returns reference/UTR, amount, date, beneficiary, account, network (NEFT/RTGS/IMPS/UPI…). Operator reviews, then `POST /payments`.
2. **From reconciliation** — a debit line in a bank statement becomes a payment.

On save: a **mandatory operator comment**, **vendor auto-mapping**, and a **debit posted to the payee's ledger** (employee if flagged, else vendor). A **duplicate guard** blocks re-saving the same UTR (409 + explicit override).

### 7.2 Receipts — money in
**Routes** `routes/receipts.routes.js` · **Service** `services/receiptService.js` · **Page** `pages/Receipts.jsx`

Requires a **client**. Posts a **credit to the client ledger for the full settled value**:

```
settled = cash credited + deductions + TDS + retention
```

because all of those reduce what the client still owes. If linked to an invoice, `refreshInvoiceStatus` updates `amount_received` and status.

### 7.3 Invoices
**Routes** `routes/invoices.routes.js` · **Services** `invoiceService.js`, `invoice-pdf.js` · **Page** `pages/Invoices.jsx`

Bills raised on clients, in the ARRAYS running-account format, with an auto-generated **Measurement Sheet** and editable letterhead. Types: `proforma` / `tax`. Statuses: `draft → raised/issued → sent → partially_paid → paid → overdue → closed` (plus `cancelled`). Soft-deletable and recoverable.

### 7.4 Bank reconciliation
**Routes** `routes/reconciliation.routes.js` · **Services** `reconciliation.service.js`, `narration.service.js`, `vendor-match.service.js` · **Pages** `Reconciliation.jsx`, `ReconciliationDetail.jsx`

1. **Upload** a statement (PDF/Excel/CSV) → `parseStatement`:
   - IDBI "Statement of Transaction" tabular PDF → `parseIdbiTabular`
   - IDBI "OpTransactionHistory" tail format → `parseIdbiBlocks`
   - Excel/CSV → column detection
   - Each narration parsed by `narration.service.js` → mode / reference / account / beneficiary
2. **Auto-match** (`matchLine`): debit → existing payment; credit → existing receipt. Match by reference, else amount + date ±3 days. Result: `matched` / `unmatched` / `duplicate`.
3. **Resolve**:
   - `POST /statements/:id/import-missing` — bulk-convert unmatched lines into payments/receipts, auto-creating parties
   - `POST /lines/:id/resolve` — one line, mandatory comment, chosen project/vendor/client
   - `POST /lines/:id/ignore` — mark as duplicate

### 7.5 Party matching
**Service** `services/vendor-match.service.js`

| Function | Strategy |
|---|---|
| `findVendorByAccount` | Exact beneficiary account number (`vendor_accounts`, `vendors.bank_account`). Confidence 100 |
| `findVendorByName` | Fuzzy via PostgreSQL `pg_trgm` (`similarity` + `word_similarity`), threshold **0.34** |
| `normalizeName` | Strips honorifics (MR/MRS/SHRI…), "S/O …" tails, bank tokens (NEFT/UPI/REF…) |
| `autoMapVendor` | Account first, then name |
| `findOrCreateVendor/Client` | Creates a lightweight **candidate** party (`is_candidate = true`) so reconciliation never stalls |

`vendor_accounts.account_number` is **globally unique** — that is how re-imports avoid duplicate vendors when the account is known. Candidates are reviewed/merged later from `pages/Vendors.jsx`.

### 7.6 OCR & extraction
**Service** `services/ocr.service.js`

- `extractText` — images via **tesseract.js**; PDFs via **pdfjs-dist** (in-process, memory-friendly). `eng.traineddata` sits at the repo root.
- `parsePaymentFields` / `parseReceiptFields` / `parseInvoiceFields` — heuristic parsers handling two-column screenshot bleed, wrapped names, UPI VPA/reference, largest-amount fallback, and **failed-transaction detection**. Beneficiary is read from "To Account", never "From Account".

### 7.7 Quotes, proposals and BOQ ⭐
**Routes** `routes/quotes.routes.js` · **Services** `quote-calc.service.js`, `quote-docs.service.js`, `proposal-pdf.service.js`, `quote-pdf.service.js` · **Pages** `Quotes.jsx`, `QuoteBuilder.jsx`

This is the sales end of the system and the most actively developed module.

#### The calculation engine — `quote-calc.service.js`

`calculateQuote(input)` returns line items plus every derived figure. **All work rates are ₹ per watt (₹/Wp)** — ₹4/W on a 25 kWp system = ₹4 × 25,000 = ₹1,00,000.

Defaults (all overridable per quote):

```
panel_wattage 545        panel_rate 11990 (₹/module)   panel_rate_per_watt 22 (₹/W)
inverter_rate 4.2        structure_rate 3.5            bos_rate 4
civil_rate (by type)     labour_rate 2.5               transport_rate 0.5
margin_pct 15            gst_pct 13.8                  tariff_per_kwh 8
generation_per_kw_year 1500
```

`CIVIL_BY_TYPE` sets civil intensity by project type (residential 0.5 → ground_mount 3.2).

**Two BOQ paths**, both of which now behave identically with respect to margin:
- **Auto BOQ** — items generated from the per-watt rates (modules by Nos, everything else 1 Lot/Set) plus `custom_extras`.
- **Custom items** — the operator types their own description/qty/unit/rate.

**The margin rule (business-critical):**

```
subtotal  = Σ line items          ← this is COST
margin    = subtotal × margin_pct
taxable   = subtotal + margin
total     = taxable + GST
```

The margin is **never shown to the client as a line item.** In the BOQ it is *folded into the item rates* by `distributeMargin()` in `quote-docs.service.js`, weighted **40% civil / 40% installation & commissioning / 20% across the rest**, normalized over whichever buckets are present (civil and installation always are). The operator sees the margin **only in the app**, in a "My Margin" card below Return on Investment.

Also computed: PM Surya Ghar residential subsidy (capped ₹78,000), net cost, annual generation, annual savings, payback years, 25-year savings, CO₂ offset.

#### Document generation — `streamParts` in `routes/quotes.routes.js`

`loadQuoteData(id)` merges, in precedence order:

```js
{ ...q.inputs, ...q, ...q.proposal_inputs, ...office }
```

so operator-entered fields (tariff, yield, system config) reach the PDF, with GSTIN/company/office joined from `gst_branches`.

`DOC_ORDER = ['proposal', 'quotation', 'boq']`. Endpoints:

```
GET /quotes/:id/document.pdf?parts=proposal,quotation,boq   ← combined
GET /quotes/:id/proposal.pdf | quotation.pdf | boq.pdf | scope.pdf
```

The proposal renders ~22 pages (cover, contents, confidentiality, leadership, about, veteran advantage, capabilities, industries, clients, track record, testimonials, recognition/media, understanding-your-project, system design, how solar works, net metering, execution, savings & ROI, environment, quality & warranty, FAQ, thank-you). It ends at Quality (`skipThankYou`), then FAQ and Thank-You are appended.

**Operator-driven, never invented:** system configuration on the quotation takes *types*, not brands — Solar Module ("545 Wp Mono PERC / latest equivalent technology"), Inverter type, optional **DC capacity** (shown only if entered), MMS, System. There are deliberately **no module/inverter brand fields** — the company supplies to client requirement.

Quotation page order: offer → payment & returns + scope of work → exclusions → **Extra Technical Requirements / Notes** → **Terms & Conditions → Payment & Company details + Payment Method → client Acceptance signature**. The signature block is the **client's acceptance**, not the company's.

Bank details are a **fixed default** in `DEFAULT_BANK` (`quote-docs.service.js`) — IDBI Bank, Greater Noida; account `0875102000012290`; IFSC `IBKL0000875` (verified against a public IFSC registry).

#### Quote lifecycle

`quote_status`: `draft → sent → approved → rejected → revised → converted → expired`. Revising copies the quote and marks the source `revised`. Approving can convert it into a **project**. Quotes are **soft-deleted** (`deleted_at`) with a Trash view, restore, and permanent delete (`?purge=1`).

### 7.8 GST compliance subsystem
**Route** `routes/gst.routes.js` · **Services** `services/gst/*` (~39 files) · **Pages** ~20 `Gst*.jsx`

Largely self-contained. Major pieces:

| Area | Service | Notes |
|---|---|---|
| E-invoices | `einvoiceService.js`, `einvoiceBuilder.js` | IRN + signed QR |
| E-way bills | `ewbService.js`, `ewbBuilder.js` | Transport documents |
| Delivery challans | `challanService.js`, `challan-pdf.js` | **Rule 55** non-sale movement |
| Branches / offices | `branchService.js` | Multi-GSTIN; supplies the `X-Branch` header context |
| Number series | `seriesService.js` | Per-branch document numbering |
| Backups | `backupService.js`, `autoBackup.js` | Every 2h, keep 30, verify + DR test |
| Recovery | `recoveryPurge.js` | 30-day soft-delete window |
| Reconciliation | `reconService.js` | GSTR matching |
| Reports / schedules | `reportService.js`, `scheduleService.js` | Scheduled report runs |
| Diagnostics / readiness / monitoring | `diagnosticsService.js`, `readinessService.js`, `monitorService.js` | Health checks |
| Validation | `gstinValidationService.js`, `validation.js` | GSTIN checks |
| Misc | branding, comments, saved views, imports, notifications, feed, duplicates, OTP, attachments, versions, search, rollups | |

GST PDFs share the house style via `services/gst/pdf.js`.

### 7.9 Projects & sites
`routes/projects.routes.js`, `sites.routes.js` · `pages/Projects.jsx`, `ProjectDetail.jsx`

Projects carry PO number/date, contract value, budget, status, soft-delete, and **payment-terms/milestone checklists** (`project_payment_terms`, due vs released). Sites carry PO details and capacity (kW). Rollups use the allocation views.

### 7.10 Dashboard & reports
`routes/dashboard.routes.js`, `reports.routes.js` · `pages/Dashboard.jsx`, `Reports.jsx`

KPIs: `total_outgoing` (Σ payments), `total_incoming` (Σ receipts), `net_position`, `pending_receivables`, `vendor_liabilities`, plus cashflow, expense-by-category, expense-by-project, vendor spend, receivable aging, client revenue, recent activity. All exclude `is_deleted = TRUE`.

> ⚠️ These headline numbers are **only as correct as the upstream classification**. An internal transfer booked as a receipt inflates income directly.

### 7.11 Documents, proofs & the vault
`routes/documents.routes.js` · `services/document.service.js`, `proofArchiver.js` · `components/ui/ProofView.jsx`

Every payment/receipt proof is stored and openable in-app through an **authenticated blob viewer** (a plain `<a href>` cannot send the JWT). Files older than 30 days are zipped into monthly archives but still open transparently. `vault_documents` + `vault_document_versions` provide versioned document storage.

### 7.12 System, sync, backup, audit
`routes/system.routes.js`, `audit.routes.js` · `services/sync.service.js`, `autoSync.js`, `system.service.js` · `pages/System.jsx`, `Audit.jsx`, `RecoveryCenter.jsx`

- **Publish to Cloud** — mirrors the local DB to Neon: full overwrite, table by table, in FK order, with self-healing enum drift. Needs `CLOUD_DATABASE_URL`. Automatic debounced publish after writes; sign-out flushes.
- **Audit log** — `middleware/audit.js` records every create/update/delete with actor, entity, entity id.
- **Recovery Center** — 30-day restore for invoices, e-invoices, e-way bills, challans, payments, receipts, projects.

---

## 8. The database

### 8.1 Where it is defined

- `server/src/db/schema.sql` — core ERP (~23 tables)
- `server/src/db/gst-schema.sql` — GST + challans + allocations + own accounts (~30 tables)

Both are **idempotent**: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE … ADD COLUMN IF NOT EXISTS`, enum creation wrapped in `DO $$ … EXCEPTION WHEN duplicate_object`.

### 8.2 Core tables

`users` `audit_logs` `projects` `sites` `vendors` `vendor_accounts` `employees` `clients` `expense_categories` `documents` `payments` `invoices` `invoice_items` `receipts` `ledger_entries` `bank_statements` `bank_statement_lines` `materials` `shipments` `geo_verifications` `quotes` `vault_documents` `vault_document_versions` `own_accounts` `project_payment_terms` `incoming_payment_allocations` `outgoing_payment_allocations`

### 8.3 Views (derived truth)

```
v_vendor_balances  v_client_balances  v_employee_balances
v_vendor_spend     v_outgoing_alloc   v_incoming_alloc
```

Never write a balance column. Add a view or extend one.

### 8.4 Enums

`user_role` `payment_mode` `invoice_status` `invoice_type` `invoice_link` `ledger_party` `ledger_direction` `recon_status` `material_status` `quote_status` `gst_einv_status` `gst_ewb_status` `dc_status`

> **Enum gotcha:** PostgreSQL cannot add an enum value inside a transaction, and `schema.sql` runs as one. `migrate.js` therefore issues `ALTER TYPE … ADD VALUE IF NOT EXISTS` **before** applying the schema. Follow that pattern for any new enum value.
>
> When inserting, cast explicitly: `COALESCE($2,'draft')::quote_status`.

### 8.5 ⚠️ Migrations do NOT run on server boot

`server/src/index.js` does **not** apply the schema. Adding a column to `schema.sql` alone changes nothing on a running database — you will get `column "x" does not exist` at runtime.

After any schema edit:

```bash
npm run migrate --prefix server
```

For a one-off column against a live DB:

```bash
node -e "import('./src/config/db.js').then(async m => { await m.query('ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ'); process.exit(0); })"
```

(run from `server/`). Always add it to `schema.sql` **as well**, so fresh installs get it.

### 8.6 Soft delete

Two conventions coexist — check which one a table uses:
- `is_deleted BOOLEAN` — payments, receipts, invoices, projects (and the Recovery Center)
- `deleted_at TIMESTAMPTZ` — quotes (Trash + restore + purge)

Every list query must filter deleted rows explicitly.

---

## 9. The PDF engine

Client-facing PDFs are the company's public face; they get disproportionate attention.

### 9.1 Stack

**pdfkit**, vector output, embedded TTF/OTF fonts from `server/src/assets/brand/fonts/`:

| Alias | Font | Use |
|---|---|---|
| `H`, `HB` | Cormorant SemiBold/Bold | Display headings |
| `body`, `bodyM`, `bodyI` | EB Garamond | Running text |
| `ui`, `uiM`, `uiSB`, `uiB` | Inter | Labels, data, tables |
| `script` | TeX Gyre Chorus | Signature flourish |

Each registration falls back to a core font if the file is missing, so a missing font degrades instead of crashing.

### 9.2 Brand palette

Exported as `PROPOSAL_BRAND = { M, C }` from `proposal-pdf.service.js`. `M = 44` (page margin). Palette `C`: emerald `#0a6045`, deep emerald `#07281d`, gold `#b8860b`, bright gold `#e7a719`, plus mint/paper/ink/mute/line neutrals. Assets (logo, project photos, press clippings, CEO photos) live in `server/src/assets/brand/`.

### 9.3 Layout helpers

`chrome()` (header/footer), `heading()`, `para()`, `panel()`, `eyebrow()`, `drawImg()`, `roundedRect`, plus `KIT` exported for reuse. **Measure before you draw**: use `doc.heightOfString(...)` to size a box to its text rather than hardcoding a height — most reported "text escaping the box" bugs came from fixed heights.

### 9.4 Verifying a PDF change (do this every time)

`pdftoppm` is **not** installed. Use `pdf-to-png-converter` (already a server dependency), run from `server/`:

```bash
node -e "
import('pdf-to-png-converter').then(async ({pdfToPng}) => {
  const pages = await pdfToPng('C:/path/to/out.pdf', { viewportScale: 1.6, pagesToProcess: [4] });
  const fs = require('fs');
  pages.forEach(p => fs.writeFileSync('C:/path/page-' + p.pageNumber + '.png', p.content));
});
"
```

Then **look at the PNG**. Note the path must be in **Windows form** (`C:/Users/...`) — a Git-Bash `/c/Users/...` path makes Node resolve `C:\c\Users\...` and fail.

> The in-app browser preview tab is backgrounded in this environment: screenshots time out and Framer animations sit at `opacity:0`. Verify UI via computed styles, and PDFs via PNG rendering.

### 9.5 Bilingual (Hindi) downloads

`services/pdf-i18n.js` + `client/src/lib/langPrompt.js` — downloads can be English or हिन्दी. Use the **Mukta** font; Noto Devanagari crashes fontkit. Implemented by monkey-patching the doc's text calls.

---

## 10. Frontend architecture

### 10.1 Structure

- **One file per screen** in `client/src/pages/` — no deep component trees. A page owns its state, fetching and modals.
- **Routing** in `App.jsx`, with `<Protected editorOnly>` / `<Protected adminOnly>` wrappers.
- **Hubs** (`Hubs.jsx`) group related screens: Reports, Activity, System Status, Data Admin.

### 10.2 Data fetching

```js
const { data, loading, error, refetch } = useFetch(`/quotes?${qs}`, [qs]);
```

`lib/useFetch.js` — GET + `refetch` + `setData`. Mutations go through the axios instance:

```js
import { api, apiError } from '../api/client.js';
await api.post('/quotes', body);
await api.delete(`/quotes/${id}`);
toast.error(apiError(e));      // normalizes { error, detail } into a message
```

`api/client.js` attaches the JWT and the `x-gst-branch` header, and exposes `download(path)` which fetches as a blob with auth, reads the filename from `Content-Disposition`, and triggers a save dialog — plus `blockExportForAdmin()`.

### 10.3 UI kit

`components/ui/index.jsx` exports `Card`, `PageHeader`, `Table`, `Badge`, `EmptyState`, `Loading`, `Field`. Plus `Modal.jsx`, `Toast.jsx` (`useToast()`), `ProofView.jsx`. Tailwind utility classes `.input`, `.btn-primary`, `.btn-ghost`, `.td` are defined in `client/src/index.css`.

`Table` takes `columns`, `rows`, `renderRow`, `onRowClick`. **When putting buttons in a clickable row, stop propagation** on the cell:

```jsx
<td className="td" onClick={(e) => e.stopPropagation()}>…</td>
```

### 10.4 ⚠️ Numeric inputs — do not use `type="number"` for decimals

`<input type="number">` plus `onChange={e => Number(e.target.value)}` makes decimals **impossible to type**: the intermediate value `"0."` coerces to `0` and the decimal point is erased, forcing the user onto the spinner arrows. For any rate/decimal field use:

```jsx
<input type="text" inputMode="decimal" value={v ?? ''} onChange={e => setX(e.target.value)} />
```

Keep the **raw string** in state while typing; the server coerces with `Number()` on save (`clean()` in `quote-calc.service.js`). This bug shipped once already — do not reintroduce it.

---

## 11. Cross-cutting concerns

| Concern | Where | Notes |
|---|---|---|
| **Errors** | `middleware/error.js`, `utils/asyncHandler.js` | Throw `new ApiError(status, msg)`; response `{ error, detail }` |
| **Audit** | `middleware/audit.js` | `await audit(req, { action, entity, entityId })` on every mutation |
| **Uploads** | `middleware/upload.js` (multer) | `UPLOAD_DIR`, `MAX_UPLOAD_MB` |
| **Validation** | `zod` | Available; used unevenly — prefer it for new endpoints |
| **Money formatting** | `client/src/lib/format.js` | `inr()`, `inr(x,{compact:true})`, `fmtDate`, `titleCase` |
| **Numeric SQL types** | `NUMERIC(16,2)` | `pg` returns numerics as **strings** — always `Number(...)` before math |
| **Idempotent schema** | `schema.sql` | `IF NOT EXISTS` everywhere |

---

## 12. Operational runbook

### Restart the server (Windows)

```bash
powershell -Command "Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"
```

then from `server/`: `node src/index.js`. **Wait ~5 seconds** before curling — an early request returns HTTP 000 because the server has not finished binding.

### Smoke-test the API

```bash
curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"editor\",\"password\":\"editor@123\"}"
```

(the field is `email`, the value is the bare word `editor`) — then send `Authorization: Bearer <token>`.

### After a schema change
`npm run migrate --prefix server` — see §8.5.

### After a client change
`npm run build --prefix client` — the server serves `client/dist`, so an unbuilt change is invisible.

### Delivering PDFs to the owner's phone
Copy the generated PDF into `C:\Users\siddh\OneDrive\` — it syncs to the cloud and appears on the phone.

### Backups
Automatic every 2 hours (keep 30), stored in a separate local folder, with verify and DR-test actions in `pages/GstBackup.jsx`.

---

## 13. Gotchas that will bite you

1. **Migrations don't run on boot.** §8.5.
2. **Login field is `email`, value is `editor`.** Not `username`.
3. **`pg` returns `NUMERIC` as strings.** `"1200.50" + 1` is `"1200.501"`. Coerce first.
4. **Enum values can't be added inside a transaction.** Add them in `migrate.js` before the schema, and cast on insert (`$1::quote_status`).
5. **`type="number"` breaks decimal entry.** §10.4.
6. **Rates are ₹/watt, not ₹/kW.** ₹4/W × 25 kWp = ₹1,00,000.
7. **Margin must apply to *both* BOQ paths** (auto and custom). It was silently dropped on the custom path once — the fix is in `quote-calc.service.js`, and the client-facing rule is that margin is folded into rates, never shown.
8. **The quotation signature is the *client's* acceptance**, not the company's.
9. **Never invent commercial facts in a PDF** (brands, capacities, project claims). Everything client-facing must come from operator input or verified record. A previously-listed "300 MW SECI solar park" was fictitious and had to be purged; YIAPL was civil & tensile work, not a solar park.
10. **`server/.env` is per-machine and git-ignored.** Never commit credentials. Verify with `git ls-files | grep .env` (only `.env.example` should appear).
11. **Windows vs Git-Bash paths in Node.** §9.4.
12. **Rebuild the client** after frontend edits.
13. **The preview tab is backgrounded** — screenshots time out; verify via computed styles / rendered PNGs.

### Repository conventions

- **Author:** Siddhant Kumar. Commit messages are clean and human — **no AI/assistant attribution, no `Co-Authored-By` trailers.**
- Commit style: `Area: what changed` (e.g. `Quote: operator-driven system config, margin folded into BOQ, soft-delete`).
- Data lives in PostgreSQL, **not** in git.

---

## 14. Known issues and tech debt

**`FUNCTIONAL-ISSUES.md` (root) is the ranked list — read it before touching money logic.** Headline items:

1. **Reconciliation classifies by direction alone** — every debit is treated as a vendor expense, every credit as client income. `own_accounts` + `transaction_type` mitigate this but do not fully solve it. Refunds, loans and inter-account moves can still distort the dashboard.
2. **Dashboard totals inherit any upstream misclassification** (§7.10).
3. **`autoMapClient` is looser than the vendor matcher** (plain `similarity()`, name-only) — higher false-match risk.
4. **Candidate parties accumulate.** Auto-created `is_candidate` vendors/clients need periodic review and merging.
5. **Two soft-delete conventions** (`is_deleted` vs `deleted_at`) — unify eventually.
6. **`zod` validation is applied unevenly** across routes.
7. **Client bundle exceeds 500 kB** — no code splitting yet.
8. **`docs/DEVELOPER.md` is older and GST-focused**; this handbook supersedes it.

### Open items owed by the business owner

- Section D proposal content (project photos, experience, track record corrections, client voices, media).
- A genuine **Tata Motors solar** photo — the only real Tata Motors image is piling/civil work, so the capabilities tile currently shows a generic ground-mount photo labelled honestly rather than misattributing another site's array.

---

## 15. Glossary

**Solar / EPC**

| Term | Meaning |
|---|---|
| **EPC** | Engineering, Procurement, Construction — design + buy + build |
| **kW / kWp / Wp** | Kilowatt; kilowatt-peak (panel rating); watt-peak. Quote rates are per **watt** |
| **AC vs DC capacity** | DC = total panel wattage, usually **higher** than the AC (inverter) rating |
| **BOQ** | Bill of Quantities — itemised list of everything supplied, with qty/unit/rate |
| **MMS** | Module Mounting Structure (aluminium/GI) |
| **BOS** | Balance of System — cables, earthing, LA, ACDB/DCDB |
| **String inverter** | Converts panel DC to grid AC |
| **Mono PERC** | Panel cell technology (e.g. 545 Wp Mono PERC) |
| **CUF** | Capacity Utilisation Factor; ~1,500 kWh/kWp/yr ≈ 17% |
| **DISCOM** | Electricity distribution company |
| **Net metering** | Exporting surplus solar to the grid against your bill |
| **PM Surya Ghar** | Residential rooftop subsidy scheme, capped ₹78,000 |
| **O&M** | Operations & Maintenance |
| **Piling** | Driving foundations for ground-mount structures |

**Finance / statutory (India)**

| Term | Meaning |
|---|---|
| **GST** | Goods & Services Tax. **CGST + SGST** intra-state; **IGST** inter-state |
| **GSTIN** | 15-character GST registration number, per state |
| **IRN** | Invoice Reference Number — the e-invoice identifier (with signed QR) |
| **E-way bill** | Document required to move goods above a value threshold |
| **Rule 55 challan** | Delivery challan for movement that is **not** a sale (e.g. to site) |
| **HSN/SAC** | Goods/services classification codes |
| **Proforma invoice** | Pre-payment bill; not a tax invoice |
| **TDS** | Tax Deducted at Source — withheld by the client, still reduces what they owe |
| **Retention** | Amount held back until project completion |
| **UTR** | Unique Transaction Reference for a bank transfer |
| **NEFT / RTGS / IMPS / UPI** | Indian payment rails |
| **PO** | Purchase Order |
| **Running account bill** | Progressive billing against work completed to date |
| **Measurement sheet** | Itemised work-done sheet backing a running-account bill |

---

*Maintained alongside the code. When you change behaviour described here, update this file in the same commit.*
