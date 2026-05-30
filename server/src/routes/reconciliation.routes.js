import { Router } from 'express';
import { query, withTransaction } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../middleware/audit.js';
import { upload } from '../middleware/upload.js';
import { saveDocument } from '../services/document.service.js';
import { parseStatement, matchLine } from '../services/reconciliation.service.js';
import { postLedgerEntry } from '../services/ledger.service.js';
import { autoMapVendor, autoMapClient, findOrCreateVendor, findOrCreateClient } from '../services/vendor-match.service.js';

const router = Router();
router.use(authenticate);

// ── Upload a monthly statement -> parse -> auto-match ────────────────────────
router.post(
  '/statements',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'A bank statement file is required');
    const b = req.body || {};

    let lines;
    try {
      lines = await parseStatement(req.file.path, req.file.mimetype);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[reconciliation] parse failed:', err.message);
      throw new ApiError(422, 'Could not read this statement file. Supported formats: PDF, Excel (.xls/.xlsx) and CSV.');
    }
    if (!lines.length) {
      throw new ApiError(422, 'No transactions could be read from this statement. Check the file format/columns.');
    }

    const result = await withTransaction(async (db) => {
      const doc = await saveDocument({
        file: req.file, kind: 'bank_statement', userId: req.user.id,
      });

      const { rows: stmtRows } = await db.query(
        `INSERT INTO bank_statements
          (label, bank_name, account_number, period_start, period_end, document_id, total_lines, uploaded_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [b.label || `Statement ${new Date().toISOString().slice(0, 10)}`, b.bank_name, b.account_number,
         b.period_start || null, b.period_end || null, doc.id, lines.length, req.user.id]
      );
      const statement = stmtRows[0];
      await db.query(`UPDATE documents SET entity='bank_statements', entity_id=$1 WHERE id=$2`,
        [statement.id, doc.id]);

      // Sanitize parsed values so a mis-read number/string can never overflow a
      // column or poison the transaction (which would 500 the whole upload).
      const NUM_MAX = 1e13;                       // safe for NUMERIC(16,2)
      const num = (v, nullable = false) => {
        const n = Number(v);
        if (!Number.isFinite(n) || Math.abs(n) >= NUM_MAX) return nullable ? null : 0;
        return n;
      };
      const intc = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) && Math.abs(n) < 2147483647 ? n : null; };
      const str = (v, len) => (v == null || v === '' ? null : String(v).slice(0, len));
      const date = (v) => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? v : null);

      let matched = 0, unmatched = 0, duplicate = 0;
      for (const raw of lines) {
        const line = {
          txn_date: date(raw.txn_date),
          description: str(raw.description, 500),
          reference_id: str(raw.reference_id, 80),
          debit: num(raw.debit),
          credit: num(raw.credit),
          balance: num(raw.balance, true),
          mode: str(raw.mode, 16),
          account_number: str(raw.account_number, 40),
          beneficiary: str(raw.beneficiary, 160),
          txn_time: str(raw.txn_time, 40),
          currency: str(raw.currency, 8) || 'INR',
          serial_no: intc(raw.serial_no),
        };
        const m = await matchLine(db, line);
        if (m.status === 'matched') matched++;
        else if (m.status === 'duplicate') duplicate++;
        else unmatched++;

        // Auto-map a probable vendor (debits) or client (credits) using the
        // structured beneficiary account + name from the narration parser.
        let vendorId = null, clientId = null, confidence = null;
        if (line.debit > 0) {
          const v = await autoMapVendor(db, { accountNumber: line.account_number, beneficiary: line.beneficiary });
          if (v) { vendorId = v.vendor_id; confidence = v.confidence; }
        } else if (line.credit > 0) {
          const c = await autoMapClient(db, { name: line.beneficiary });
          if (c) { clientId = c.client_id; confidence = c.confidence; }
        }

        await db.query(
          `INSERT INTO bank_statement_lines
            (statement_id, txn_date, description, reference_id, debit, credit, balance,
             status, matched_type, matched_id, classified,
             mode, account_number, beneficiary, txn_time, vendor_id, vendor_confidence,
             client_id, currency, serial_no)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
          [statement.id, line.txn_date, line.description, line.reference_id, line.debit, line.credit,
           line.balance, m.status, m.matchedType, m.matchedId, m.status === 'matched',
           line.mode, line.account_number, line.beneficiary, line.txn_time, vendorId, confidence,
           clientId, line.currency || 'INR', line.serial_no ?? null]
        );
      }

      await db.query(
        `UPDATE bank_statements SET matched_count=$1, unmatched_count=$2, duplicate_count=$3 WHERE id=$4`,
        [matched, unmatched, duplicate, statement.id]
      );
      return { statement: { ...statement, matched_count: matched, unmatched_count: unmatched, duplicate_count: duplicate } };
    });

    await audit(req, { action: 'reconcile', entity: 'bank_statements', entityId: result.statement.id, changes: { lines: lines.length } });
    res.status(201).json(result);
  })
);

// List statements
router.get(
  '/statements',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT bs.*, u.name AS uploaded_by_name,
        (SELECT COUNT(*) FROM bank_statement_lines l WHERE l.statement_id=bs.id AND l.status='unmatched' AND (l.comment IS NULL OR l.classified=false)) AS pending_review
       FROM bank_statements bs
       LEFT JOIN users u ON u.id=bs.uploaded_by
       ORDER BY bs.created_at DESC`
    );
    res.json(rows);
  })
);

// Get a statement with its lines
router.get(
  '/statements/:id',
  asyncHandler(async (req, res) => {
    const { rows: stmt } = await query('SELECT * FROM bank_statements WHERE id=$1', [req.params.id]);
    if (!stmt[0]) throw new ApiError(404, 'Statement not found');
    const { rows: lines } = await query(
      'SELECT * FROM bank_statement_lines WHERE statement_id=$1 ORDER BY txn_date, created_at',
      [req.params.id]
    );
    res.json({ statement: stmt[0], lines });
  })
);

// ── One-click: import ALL unmatched lines into the correct module ───────────
// Debits -> outgoing payments (auto-create/auto-map vendor)
// Credits -> incoming receipts (auto-create/auto-map client)
// Posts ledger entries and links everything back to the statement line.
router.post(
  '/statements/:id/import-missing',
  asyncHandler(async (req, res) => {
    const result = await withTransaction(async (db) => {
      const { rows: lines } = await db.query(
        `SELECT * FROM bank_statement_lines WHERE statement_id=$1 AND status='unmatched' AND classified=false`,
        [req.params.id]
      );
      let payments = 0, receipts = 0, newVendors = 0, newClients = 0;

      for (const line of lines) {
        const comment = `Auto-imported from statement: ${line.beneficiary || line.description || 'transaction'}`.slice(0, 250);
        if (line.debit > 0) {
          const v = await findOrCreateVendor(db, {
            accountNumber: line.account_number, beneficiary: line.beneficiary,
            reference: line.reference_id, date: line.txn_date, userId: req.user.id,
          });
          if (v?.created) newVendors++;
          const { rows } = await db.query(
            `INSERT INTO payments
              (reference_id, amount, payment_date, beneficiary_name, account_details, bank_remarks,
               comment, network_type, payment_mode, vendor_id, invoice_status, source, recon_item_id, created_by)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,'other')::payment_mode,$10,'pending','reconciliation',$11,$12)
             RETURNING id`,
            [line.reference_id, line.debit, line.txn_date, line.beneficiary, line.account_number, line.description,
             comment, line.mode, line.mode ? line.mode.toLowerCase() : null, v?.vendor_id || null, line.id, req.user.id]
          );
          if (v?.vendor_id) {
            await postLedgerEntry(db, {
              partyType: 'vendor', partyId: v.vendor_id, direction: 'debit', amount: line.debit,
              entryDate: line.txn_date, description: comment, sourceType: 'payment', sourceId: rows[0].id, userId: req.user.id,
            });
          }
          await db.query(
            `UPDATE bank_statement_lines SET status='matched', matched_type='payment', matched_id=$1, vendor_id=$2, comment=$3, classified=true WHERE id=$4`,
            [rows[0].id, v?.vendor_id || null, comment, line.id]
          );
          payments++;
        } else if (line.credit > 0) {
          const c = await findOrCreateClient(db, { name: line.beneficiary, reference: line.reference_id, date: line.txn_date });
          if (c?.created) newClients++;
          const { rows } = await db.query(
            `INSERT INTO receipts
              (reference_id, credited_amount, credited_date, account_details, client_id, comment, source, recon_item_id, created_by)
             VALUES ($1,$2,$3,$4,$5,$6,'reconciliation',$7,$8) RETURNING id`,
            [line.reference_id, line.credit, line.txn_date, line.account_number, c?.client_id || null, comment, line.id, req.user.id]
          );
          if (c?.client_id) {
            await postLedgerEntry(db, {
              partyType: 'client', partyId: c.client_id, direction: 'credit', amount: line.credit,
              entryDate: line.txn_date, description: comment, sourceType: 'receipt', sourceId: rows[0].id, userId: req.user.id,
            });
          }
          await db.query(
            `UPDATE bank_statement_lines SET status='matched', matched_type='receipt', matched_id=$1, client_id=$2, comment=$3, classified=true WHERE id=$4`,
            [rows[0].id, c?.client_id || null, comment, line.id]
          );
          receipts++;
        }
      }

      // refresh statement counters
      await db.query(
        `UPDATE bank_statements bs SET
           matched_count=(SELECT COUNT(*) FROM bank_statement_lines WHERE statement_id=bs.id AND status='matched'),
           unmatched_count=(SELECT COUNT(*) FROM bank_statement_lines WHERE statement_id=bs.id AND status='unmatched')
         WHERE bs.id=$1`,
        [req.params.id]
      );
      return { payments, receipts, newVendors, newClients };
    });

    await audit(req, { action: 'reconcile', entity: 'bank_statements', entityId: req.params.id, changes: { import_missing: result } });
    res.json(result);
  })
);

// ── Resolve an unmatched line: classify + mandatory comment -> create record ─
router.post(
  '/lines/:id/resolve',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.comment || !String(b.comment).trim()) {
      throw new ApiError(400, 'A comment is mandatory to resolve an unmatched line');
    }

    const out = await withTransaction(async (db) => {
      const { rows: lr } = await db.query('SELECT * FROM bank_statement_lines WHERE id=$1', [req.params.id]);
      if (!lr[0]) throw new ApiError(404, 'Statement line not found');
      const line = lr[0];
      const isDebit = line.debit > 0;

      let createdId = null;
      let createdType = null;

      // Operator choice wins, else fall back to the auto-mapped vendor on the line.
      const vendorId = b.vendor_id || line.vendor_id || null;

      if (isDebit) {
        // Create an outgoing payment draft from this line (structured fields carried over)
        const { rows } = await db.query(
          `INSERT INTO payments
            (reference_id, amount, payment_date, beneficiary_name, account_details, bank_remarks,
             comment, network_type, payment_mode,
             project_id, site_id, vendor_id, category_id, invoice_status, source, recon_item_id, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,'other')::payment_mode,
                   $10,$11,$12,$13,'pending','reconciliation',$14,$15)
           RETURNING *`,
          [line.reference_id, line.debit, line.txn_date, line.beneficiary, line.account_number, line.description,
           b.comment.trim(), line.mode, line.mode ? line.mode.toLowerCase() : null,
           b.project_id || null, b.site_id || null, vendorId, b.category_id || null,
           line.id, req.user.id]
        );
        createdId = rows[0].id; createdType = 'payment';
        if (rows[0].vendor_id) {
          await postLedgerEntry(db, {
            partyType: 'vendor', partyId: rows[0].vendor_id, direction: 'debit',
            amount: rows[0].amount, entryDate: rows[0].payment_date, description: rows[0].comment,
            projectId: rows[0].project_id, siteId: rows[0].site_id,
            sourceType: 'payment', sourceId: rows[0].id, userId: req.user.id,
          });
          // Remember this beneficiary account -> vendor mapping so future
          // statements with the same account auto-map, even if the bank's
          // beneficiary name varies slightly.
          if (line.account_number) {
            await db.query(
              `INSERT INTO vendor_accounts (vendor_id, account_number, label)
               VALUES ($1,$2,'learned') ON CONFLICT (account_number) DO NOTHING`,
              [rows[0].vendor_id, String(line.account_number).trim()]
            );
          }
        }
      } else {
        // Create an incoming receipt draft
        if (!b.client_id) throw new ApiError(400, 'A client is required to resolve a credit line');
        const { rows } = await db.query(
          `INSERT INTO receipts
            (reference_id, credited_amount, credited_date, account_details, client_id,
             project_id, site_id, comment, source, recon_item_id, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'reconciliation',$9,$10) RETURNING *`,
          [line.reference_id, line.credit, line.txn_date, line.description, b.client_id,
           b.project_id || null, b.site_id || null, b.comment.trim(), line.id, req.user.id]
        );
        createdId = rows[0].id; createdType = 'receipt';
        await postLedgerEntry(db, {
          partyType: 'client', partyId: rows[0].client_id, direction: 'credit',
          amount: rows[0].credited_amount, entryDate: rows[0].credited_date, description: rows[0].comment,
          projectId: rows[0].project_id, siteId: rows[0].site_id,
          sourceType: 'receipt', sourceId: rows[0].id, userId: req.user.id,
        });
      }

      await db.query(
        `UPDATE bank_statement_lines
         SET status='matched', matched_type=$1, matched_id=$2, comment=$3, classified=true
         WHERE id=$4`,
        [createdType, createdId, b.comment.trim(), line.id]
      );

      // refresh statement counters
      await db.query(
        `UPDATE bank_statements bs SET
           matched_count=(SELECT COUNT(*) FROM bank_statement_lines WHERE statement_id=bs.id AND status='matched'),
           unmatched_count=(SELECT COUNT(*) FROM bank_statement_lines WHERE statement_id=bs.id AND status='unmatched')
         WHERE bs.id=$1`,
        [line.statement_id]
      );

      return { createdType, createdId };
    });

    await audit(req, { action: 'reconcile', entity: 'bank_statement_lines', entityId: req.params.id, changes: out });
    res.json(out);
  })
);

// Mark a duplicate line as ignored
router.post(
  '/lines/:id/ignore',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE bank_statement_lines SET status='duplicate', comment=$1, classified=true WHERE id=$2 RETURNING *`,
      [b.comment || 'Marked as duplicate', req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Line not found');
    await audit(req, { action: 'reconcile', entity: 'bank_statement_lines', entityId: req.params.id, changes: { ignored: true } });
    res.json(rows[0]);
  })
);

// Reconciliation dashboard summary
router.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status='matched')   AS matched,
        COUNT(*) FILTER (WHERE status='unmatched') AS unmatched,
        COUNT(*) FILTER (WHERE status='duplicate') AS duplicate,
        COUNT(*) FILTER (WHERE status='unmatched' AND (comment IS NULL OR classified=false)) AS pending_review,
        COUNT(*) AS total
      FROM bank_statement_lines
    `);
    res.json(rows[0]);
  })
);

export default router;
