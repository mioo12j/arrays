import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import { company } from './config/company.js';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import sitesRoutes from './routes/sites.routes.js';
import vendorsRoutes from './routes/vendors.routes.js';
import employeesRoutes from './routes/employees.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import receiptsRoutes from './routes/receipts.routes.js';
import invoicesRoutes from './routes/invoices.routes.js';
import reconciliationRoutes from './routes/reconciliation.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import auditRoutes from './routes/audit.routes.js';
import quotesRoutes from './routes/quotes.routes.js';
import vaultRoutes from './routes/vault.routes.js';
import companyRoutes from './routes/company.routes.js';

import { notFound, errorHandler } from './middleware/error.js';

const app = express();

// CLIENT_ORIGIN may be a single URL, a comma-separated list, or '*' (any).
const allowed = env.clientOrigin.split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv !== 'test') app.use(morgan('dev'));

// Health check (also verifies DB connectivity)
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', db: 'unavailable', error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/company', companyRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`\n  ${company.name} — ERP API running on http://localhost:${env.port}`);
  console.log(`  Environment: ${env.nodeEnv}`);
  console.log(`  CORS origin: ${env.clientOrigin}\n`);
});
