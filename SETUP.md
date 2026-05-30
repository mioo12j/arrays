# Setup Guide (Windows)

This project needs **Node.js 18+** and **PostgreSQL 14+**. Neither is currently
installed on this machine. Follow the steps below.

## 1. Install prerequisites

```powershell
winget install OpenJS.NodeJS.LTS
winget install PostgreSQL.PostgreSQL.16
```

Close and re-open your terminal afterwards so `node`, `npm` and `psql` are on PATH.
During the PostgreSQL install you'll set a password for the `postgres` user —
remember it.

## 2. Create the database

```powershell
# Adjust the path/version if you installed a different PostgreSQL version
& "$env:ProgramFiles\PostgreSQL\16\bin\createdb.exe" -U postgres solar_epc
```

## 3. Configure the backend

```powershell
cd server
Copy-Item .env.example .env
# Edit .env: set PGPASSWORD to your postgres password and pick a JWT_SECRET
```

## 4. Install dependencies (from the project root)

```powershell
npm run install:all
```

## 5. Load schema + seed default users

```powershell
npm run db:migrate    # creates all tables (uses Node, no psql needed)
npm run db:seed       # creates admin + operator users and categories
```

## 6. Run it

Open two terminals:

```powershell
# Terminal 1 — API on http://localhost:4000
npm run dev:server

# Terminal 2 — Web app on http://localhost:5173
npm run dev:client
```

Open http://localhost:5173 and sign in:

| Role     | Email                 | Password     |
| -------- | --------------------- | ------------ |
| Admin    | admin@solarepc.com    | Admin@123    |
| Operator | operator@solarepc.com | Operator@123 |

## Notes

- OCR for **images** uses `tesseract.js`, which downloads a language model on
  first use (needs internet once). PDF text extraction works offline.
- Uploaded files are stored under `server/uploads/`.
- The Vite dev server proxies `/api` to the backend, so no CORS setup is needed
  in development.
