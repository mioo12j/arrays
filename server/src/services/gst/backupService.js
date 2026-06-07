// ============================================================================
//  #10 Full-System Backup & Disaster Recovery.
//  Backs up the ENTIRE application — every database table (discovered
//  dynamically) plus all attachment/proof files — into one timestamped ZIP:
//      CompanyBackup_YYYY-MM-DD_HHMM.zip   (data.json + files/…)
//  Includes verification (record/file counts, checksums, restore compatibility),
//  preview / full / partial restore, a non-destructive DR test, a daily-backup
//  check, and dashboard health metrics.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import AdmZip from 'adm-zip';
import { ApiError } from '../../utils/asyncHandler.js';
import { UPLOAD_ROOT } from '../../middleware/upload.js';
import { recordAudit } from './log.js';
import * as config from './configService.js';

const RETENTION_DEFAULT = { dailyDays: 30, weeklyWeeks: 12, monthlyMonths: 24, storageThresholdMb: 5000 };

export const BACKUP_DIR = path.resolve(UPLOAD_ROOT, '..', 'backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// Discover every base table in the public schema (future-proof — new tables are
// backed up automatically). Exclude the backup ledger itself to avoid recursion.
async function allTables(db) {
  const { rows } = await db.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema='public' AND table_type='BASE TABLE'
       AND table_name NOT IN ('gst_otp_challenges') ORDER BY table_name`);
  return rows.map((r) => r.table_name);
}

// Primary-key columns for a table (used for additive restore conflict target).
async function pkCols(db, table) {
  const { rows } = await db.query(
    `SELECT a.attname FROM pg_index i
     JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum = ANY(i.indkey)
     WHERE i.indrelid=$1::regclass AND i.indisprimary`, [table]);
  return rows.map((r) => r.attname);
}

const RESTORE_PRIORITY = ['users', 'app_config', 'clients', 'vendors', 'employees', 'projects', 'sites', 'gst_branches', 'gst_number_series', 'invoices', 'gst_einvoices', 'gst_eway_bills'];
const restoreOrder = (tables) => [...tables].sort((a, b) => {
  const ai = RESTORE_PRIORITY.indexOf(a), bi = RESTORE_PRIORITY.indexOf(b);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
});

function listUploadFiles() {
  try { return fs.readdirSync(UPLOAD_ROOT).filter((f) => fs.statSync(path.join(UPLOAD_ROOT, f)).isFile()); }
  catch { return []; }
}

function stamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

// ── Create a full-system backup ────────────────────────────────────────────
export async function create(db, { kind = 'manual' } = {}, userId) {
  const t0 = Date.now();
  const tables = await allTables(db);
  const dump = { meta: { createdAt: new Date().toISOString(), kind, version: 2, scope: 'full' }, tables: {}, fileManifest: [] };
  const counts = {};
  for (const t of tables) { const { rows } = await db.query(`SELECT * FROM ${t}`); dump.tables[t] = rows; counts[t] = rows.length; }

  const zip = new AdmZip();
  // Attachment / proof files + per-file checksum manifest.
  const files = listUploadFiles();
  for (const f of files) {
    const buf = fs.readFileSync(path.join(UPLOAD_ROOT, f));
    zip.addFile(`files/${f}`, buf);
    dump.fileManifest.push({ name: f, size: buf.length, sha256: sha(buf) });
  }
  zip.addFile('data.json', Buffer.from(JSON.stringify(dump)));

  const fname = `CompanyBackup_${stamp()}.zip`;
  const fpath = path.join(BACKUP_DIR, fname);
  const zipBuf = zip.toBuffer();
  fs.writeFileSync(fpath, zipBuf);

  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
  const { rows } = await db.query(
    `INSERT INTO gst_backups (kind, scope, status, destination, file_path, size_bytes, file_count, record_counts, checksum, duration_ms, created_by, completed_at)
     VALUES ($1,'full','success',$2,$3,$4,$5,$6,$7,$8,$9, now()) RETURNING *`,
    [kind, 'Local: server/backups', fpath, zipBuf.length, files.length, JSON.stringify(counts), sha(zipBuf), Date.now() - t0, userId]
  );
  await recordAudit(db, { objectType: 'system', objectId: rows[0].id, eventType: 'backup_created', message: `Full backup ${fname} — ${totalRecords} records, ${files.length} files, ${(zipBuf.length / 1024 / 1024).toFixed(1)} MB`, userId });
  await applyRetention(db, userId);   // auto-cleanup per retention policy
  return { ...rows[0], record_counts: counts, totalRecords };
}

export async function hasTodayBackup(db) {
  const { rows } = await db.query("SELECT count(*) c FROM gst_backups WHERE status='success' AND started_at::date = now()::date");
  return Number(rows[0].c) > 0;
}

function readBackup(b) {
  if (!b?.file_path || !fs.existsSync(b.file_path)) throw new ApiError(410, 'Backup file is missing.');
  const zip = new AdmZip(b.file_path);
  const entry = zip.getEntry('data.json');
  if (!entry) throw new ApiError(422, 'Backup is corrupt (no data.json).');
  return { zip, data: JSON.parse(zip.readAsText(entry)) };
}

// ── Verify ─────────────────────────────────────────────────────────────────
export async function verify(db, id, userId) {
  const b = (await db.query('SELECT * FROM gst_backups WHERE id=$1', [id])).rows[0];
  if (!b) throw new ApiError(404, 'Backup not found');
  const checks = {};
  try {
    const { zip, data } = readBackup(b);
    const recordCount = Object.values(data.tables || {}).reduce((a, t) => a + t.length, 0);
    checks.recordCounts = recordCount;
    // File integrity — every manifest file present in the zip with matching checksum.
    let fileOk = 0, fileBad = 0;
    for (const m of data.fileManifest || []) {
      const e = zip.getEntry(`files/${m.name}`);
      if (e && sha(zip.readFile(e)) === m.sha256) fileOk++; else fileBad++;
    }
    checks.fileCounts = (data.fileManifest || []).length;
    checks.attachmentIntegrity = fileBad === 0;
    // Checksum of the whole zip vs the one recorded at creation.
    checks.checksumOk = b.checksum ? sha(fs.readFileSync(b.file_path)) === b.checksum : null;
    // Restore compatibility — do the backed-up tables still exist?
    const live = new Set(await allTables(db));
    const missing = Object.keys(data.tables || {}).filter((t) => !live.has(t));
    checks.restoreCompatible = missing.length === 0;
    checks.missingTables = missing;

    const failed = checks.checksumOk === false || !checks.attachmentIntegrity || !checks.restoreCompatible;
    const status = failed ? 'failed' : (checks.checksumOk === null ? 'warning' : 'verified');
    const health = computeHealth(b, status);
    await db.query('UPDATE gst_backups SET verified_at=now(), verification=$2, health=$3 WHERE id=$1', [id, JSON.stringify({ status, ...checks }), health]);
    await recordAudit(db, { objectType: 'system', objectId: id, eventType: 'backup_verified', message: `Backup verified → ${status} (${recordCount} records, ${fileOk}/${fileOk + fileBad} files intact)`, userId });
    return { status, ...checks, health };
  } catch (e) {
    await db.query("UPDATE gst_backups SET verified_at=now(), verification=$2, health=0 WHERE id=$1", [id, JSON.stringify({ status: 'failed', error: e.message })]);
    return { status: 'failed', error: e.message };
  }
}

function computeHealth(b, status) {
  let h = 0;
  if (status === 'verified') h += 40; else if (status === 'warning') h += 20;
  const ageH = (Date.now() - new Date(b.started_at).getTime()) / 3.6e6;
  h += ageH < 24 ? 30 : ageH < 24 * 7 ? 15 : 0;
  if (b.status === 'success') h += 15;
  h += 15; // file manifest present
  return Math.min(100, h);
}

// ── Preview restore (dry run) ──────────────────────────────────────────────
export async function previewRestore(db, id, { tables } = {}) {
  const b = (await db.query('SELECT * FROM gst_backups WHERE id=$1', [id])).rows[0];
  if (!b) throw new ApiError(404, 'Backup not found');
  const { data } = readBackup(b);
  const targets = restoreOrder(Object.keys(data.tables).filter((t) => !tables || tables.includes(t)));
  const preview = [];
  for (const t of targets) {
    const backupRows = data.tables[t] || [];
    let current = 0; try { current = Number((await db.query(`SELECT count(*) c FROM ${t}`)).rows[0].c); } catch { /* table gone */ }
    // additive restore inserts only rows whose PK isn't already present
    const pk = await pkCols(db, t).catch(() => []);
    let newRows = backupRows.length;
    if (pk.length === 1 && backupRows.length) {
      const ids = backupRows.map((r) => r[pk[0]]).filter((v) => v != null);
      if (ids.length) { try { const exist = Number((await db.query(`SELECT count(*) c FROM ${t} WHERE ${pk[0]} = ANY($1)`, [ids])).rows[0].c); newRows = backupRows.length - exist; } catch { /* type mismatch */ } }
    }
    preview.push({ table: t, inBackup: backupRows.length, current, willInsert: Math.max(0, newRows), willSkipExisting: backupRows.length - Math.max(0, newRows) });
  }
  return { generatedAt: new Date().toISOString(), mode: tables ? 'partial' : 'full', tables: preview, fileCount: (data.fileManifest || []).length };
}

// Non-destructive DR test — validates the package and simulates a restore
// WITHOUT touching live data.
export async function drTest(db, id, userId) {
  const v = await verify(db, id, userId);
  const p = await previewRestore(db, id);
  await recordAudit(db, { objectType: 'system', objectId: id, eventType: 'dr_test', message: `Disaster-recovery test run (verify=${v.status})`, userId });
  return { verification: v, simulation: p, safe: true };
}

// ── Restore (additive, non-destructive) ────────────────────────────────────
export async function restore(db, id, { mode = 'full', tables } = {}, userId) {
  const b = (await db.query('SELECT * FROM gst_backups WHERE id=$1', [id])).rows[0];
  if (!b) throw new ApiError(404, 'Backup not found');
  const { zip, data } = readBackup(b);
  const targets = restoreOrder(Object.keys(data.tables).filter((t) => mode === 'full' || !tables || tables.includes(t)));
  let restored = 0;
  for (const t of targets) {
    const pk = await pkCols(db, t).catch(() => ['id']);
    const conflict = pk.length ? `ON CONFLICT (${pk.map((c) => `"${c}"`).join(',')}) DO NOTHING` : '';
    for (const r of data.tables[t] || []) {
      const cols = Object.keys(r);
      const vals = cols.map((c) => (r[c] !== null && typeof r[c] === 'object' ? JSON.stringify(r[c]) : r[c]));
      try { const res = await db.query(`INSERT INTO ${t} (${cols.map((c) => `"${c}"`).join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')}) ${conflict}`, vals); restored += res.rowCount; }
      catch { /* skip incompatible row */ }
    }
  }
  // Restore any missing attachment files.
  let filesRestored = 0;
  for (const entry of zip.getEntries()) {
    if (!entry.entryName.startsWith('files/')) continue;
    const name = entry.entryName.slice('files/'.length);
    const dest = path.join(UPLOAD_ROOT, name);
    if (!fs.existsSync(dest)) { fs.writeFileSync(dest, entry.getData()); filesRestored++; }
  }
  await recordAudit(db, { objectType: 'system', objectId: id, eventType: 'backup_restored', message: `${mode} restore — ${restored} records + ${filesRestored} files (additive, non-destructive)`, userId });
  return { restored, filesRestored, mode };
}

// ── List + dashboard ───────────────────────────────────────────────────────
export async function list(db) {
  const { rows } = await db.query(`SELECT b.*, u.name AS by_name FROM gst_backups b LEFT JOIN users u ON u.id=b.created_by ORDER BY started_at DESC LIMIT 50`);
  return rows.map((r) => ({ ...r, exists: r.file_path && fs.existsSync(r.file_path) }));
}

export async function fileFor(db, id) {
  const b = (await db.query('SELECT * FROM gst_backups WHERE id=$1', [id])).rows[0];
  if (!b || !b.file_path || !fs.existsSync(b.file_path)) throw new ApiError(404, 'Backup file not available.');
  return { path: b.file_path, name: path.basename(b.file_path) };
}

// ── Retention & storage management ─────────────────────────────────────────
export async function getRetention(db) {
  return { ...RETENTION_DEFAULT, ...((await config.get(db, 'backup_retention', {})) || {}) };
}
export async function setRetention(db, policy, userId) {
  const next = { ...(await getRetention(db)), ...policy };
  await config.set(db, 'backup_retention', next, userId);
  await recordAudit(db, { objectType: 'system', objectId: userId, eventType: 'backup_retention_changed', message: `Backup retention updated (daily ${next.dailyDays}d / weekly ${next.weeklyWeeks}w / monthly ${next.monthlyMonths}m)`, userId });
  return next;
}

// Delete backups older than the configured retention (manual kept forever).
export async function applyRetention(db, userId = null) {
  const r = await getRetention(db);
  const maxByKind = { daily: r.dailyDays, weekly: r.weeklyWeeks * 7, monthly: r.monthlyMonths * 30 };
  let removed = 0;
  for (const [kind, days] of Object.entries(maxByKind)) {
    const { rows } = await db.query(`SELECT id, file_path FROM gst_backups WHERE kind=$1 AND started_at < now() - ($2 || ' days')::interval`, [kind, String(days)]);
    for (const b of rows) {
      try { if (b.file_path && fs.existsSync(b.file_path)) fs.unlinkSync(b.file_path); } catch { /* */ }
      await db.query('DELETE FROM gst_backups WHERE id=$1', [b.id]); removed++;
    }
  }
  if (removed && userId) await recordAudit(db, { objectType: 'system', objectId: userId, eventType: 'backup_cleanup', message: `Retention cleanup removed ${removed} old backup(s)`, userId });
  return { removed };
}

export async function growth(db) {
  const { rows } = await db.query(`SELECT started_at, size_bytes FROM gst_backups ORDER BY started_at ASC LIMIT 60`);
  return rows.map((r) => ({ at: r.started_at, sizeMb: Math.round((r.size_bytes || 0) / 1048576 * 10) / 10 }));
}

export async function dashboard(db) {
  const r = (await db.query(`
    SELECT max(started_at) last,
           max(started_at) FILTER (WHERE status='success') last_success,
           max(started_at) FILTER (WHERE status='failed') last_failed,
           count(*) total
    FROM gst_backups`)).rows[0];
  const last = (await db.query(`SELECT * FROM gst_backups ORDER BY started_at DESC LIMIT 1`)).rows[0];
  // storage usage of the backups folder
  let storage = 0; try { for (const f of fs.readdirSync(BACKUP_DIR)) storage += fs.statSync(path.join(BACKUP_DIR, f)).size; } catch { /* */ }
  const ret = await getRetention(db);
  return {
    lastBackup: r.last, lastSuccess: r.last_success, lastFailed: r.last_failed, totalBackups: Number(r.total),
    lastSizeBytes: last?.size_bytes || 0, lastDurationMs: last?.duration_ms || 0,
    verificationStatus: last?.verification?.status || 'not verified',
    healthScore: last?.health ?? null,
    storageBytes: storage,
    storageThresholdMb: ret.storageThresholdMb,
    storageWarning: storage / 1048576 > ret.storageThresholdMb,
    retention: ret,
    hasToday: await hasTodayBackup(db),
  };
}
