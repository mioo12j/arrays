# Solar EPC ERP & Financial Intelligence Platform

A modern, enterprise-grade ERP & Financial Intelligence platform for Solar EPC
(Engineering, Procurement & Construction) companies. It centralizes outgoing
payments, incoming receipts, vendor/client ledgers, invoicing, bank-statement
reconciliation, project costing, procurement, logistics and site verification
into one intelligent web platform.

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Frontend   | React 18 + Vite + Tailwind CSS + Recharts   |
| Backend    | Node.js + Express                           |
| Database   | PostgreSQL                                   |
| Auth       | JWT (access tokens) + bcrypt                 |
| OCR        | tesseract.js (images) + pdf-parse (PDFs)    |
| Exports    | exceljs (Excel) + pdfkit (PDF)              |
| Storage    | Local filesystem (cloud-ready abstraction)  |

## Monorepo Layout

```
epc/
├── server/          Express API, PostgreSQL, OCR, exports
│   ├── src/
│   │   ├── config/        env + db pool
│   │   ├── db/            schema.sql + seed
│   │   ├── middleware/    auth, rbac, audit, upload, errors
│   │   ├── services/      ocr, ledger, reconciliation, export
│   │   ├── routes/        REST endpoints per module
│   │   └── index.js       app entry
│   └── uploads/          local file storage
└── client/          React + Tailwind SPA
    └── src/
        ├── api/          axios client
        ├── context/      auth state
        ├── components/    layout + reusable UI
        └── pages/         one folder per module
```

## Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL 14+** running locally

If you are on Windows and don't have these:

```powershell
winget install OpenJS.NodeJS.LTS
winget install PostgreSQL.PostgreSQL.16
```

## Setup

### 1. Database

Create the database and load the schema:

```bash
createdb solar_epc
psql -d solar_epc -f server/src/db/schema.sql
```

### 2. Backend

```bash
cd server
cp .env.example .env          # then edit DB credentials + JWT secret
npm install
npm run seed                  # creates default admin + operator users
npm run dev                   # http://localhost:4000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev                   # http://localhost:5173
```

## Default Logins (after seeding)

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Admin    | admin@solarepc.com    | Admin@123   |
| Operator | operator@solarepc.com | Operator@123|

> Change these immediately in any real deployment.

## Roles

- **Admin** — full visibility: dashboards, analytics, ledgers, reconciliation
  summaries, profitability, reports & exports.
- **Operator** — day-to-day data entry: upload payment/receipt proofs & bank
  statements, mandatory comments, classify transactions, upload invoices.

## Module Build Order

1. Authentication & User Roles ✅
2. Project / Site Management ✅
3. Outgoing Payment Module ✅
4. OCR & Extraction Engine ✅
5. Vendor Ledger ✅
6. Incoming Receipt Module ✅
7. Client Ledger & Receivables ✅
8. Invoice & Proforma Invoice Module ✅
9. Bank Statement Reconciliation ✅
10. Material & Procurement Tracking (schema ready)
11. Delivery & E-Way Bill Tracking (schema ready)
12. Geo-Tagged Verification (schema ready)
13. Dashboard & Analytics ✅
14. Reporting & Export System ✅
