import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Loader2, CheckCircle2, AlertCircle, Copy, ChevronRight } from 'lucide-react';
import { api, apiError } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, PageHeader, Loading, Table, Badge, Field } from '../components/ui/index.jsx';
import { fmtDate, fmtDateTime } from '../lib/format.js';

export default function Reconciliation() {
  const toast = useToast();
  const { data: statements, loading, refetch } = useFetch('/reconciliation/statements');
  const { data: summary, refetch: refetchSummary } = useFetch('/reconciliation/summary');
  const [open, setOpen] = useState(false);

  const s = summary || {};
  const cards = [
    { label: 'Matched', value: s.matched || 0, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Unmatched', value: s.unmatched || 0, icon: AlertCircle, tone: 'text-red-600 bg-red-50' },
    { label: 'Duplicates', value: s.duplicate || 0, icon: Copy, tone: 'text-purple-600 bg-purple-50' },
    { label: 'Pending Review', value: s.pending_review || 0, icon: AlertCircle, tone: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div>
      <PageHeader
        title="Bank Statement Reconciliation"
        subtitle="Upload a monthly statement — the system auto-matches transactions and flags what needs review."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Upload size={16} /> Upload Statement</button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">{c.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
              </div>
              <div className={`rounded-xl p-2.5 ${c.tone}`}><c.icon size={20} /></div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="!p-0">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800"><h3 className="font-semibold text-slate-800 dark:text-slate-100">Uploaded Statements</h3></div>
        {loading ? <Loading /> : (
          <Table
            columns={[
              { header: 'Statement' }, { header: 'Uploaded' }, { header: 'Lines' }, { header: 'Matched' },
              { header: 'Unmatched' }, { header: 'Review' }, { header: '' },
            ]}
            rows={statements || []}
            empty="No statements uploaded yet."
            onRowClick={(st) => (window.location.href = `/reconciliation/${st.id}`)}
            renderRow={(st) => (
              <>
                <td className="td font-medium text-slate-800 dark:text-slate-100">{st.label}</td>
                <td className="td text-slate-500">{fmtDateTime(st.created_at)}</td>
                <td className="td">{st.total_lines}</td>
                <td className="td"><Badge tone="green">{st.matched_count}</Badge></td>
                <td className="td">{st.unmatched_count > 0 ? <Badge tone="red">{st.unmatched_count}</Badge> : '0'}</td>
                <td className="td">{st.pending_review > 0 ? <Badge tone="amber">{st.pending_review}</Badge> : '—'}</td>
                <td className="td text-right"><ChevronRight size={16} className="text-slate-300" /></td>
              </>
            )}
          />
        )}
      </Card>

      {open && <UploadModal onClose={() => setOpen(false)} onDone={() => { setOpen(false); refetch(); refetchSummary(); }} />}
    </div>
  );
}

function UploadModal({ onClose, onDone }) {
  const toast = useToast();
  const [form, setForm] = useState({ label: '', bank_name: '', account_number: '', period_start: '', period_end: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const upload = async () => {
    if (!file) return toast.error('Choose a statement file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      const { data } = await api.post('/reconciliation/statements', fd);
      const st = data.statement;
      toast.success(`Parsed ${st.total_lines} lines — ${st.matched_count} matched, ${st.unmatched_count} to review`);
      onDone();
    } catch (err) { toast.error(apiError(err)); } finally { setUploading(false); }
  };

  return (
    <Modal open onClose={onClose} title="Upload Bank Statement"
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={upload} disabled={uploading}>{uploading ? <Loader2 className="animate-spin" size={16} /> : 'Upload & Reconcile'}</button>
      </>}>
      <p className="mb-4 text-sm text-slate-500">Supported: PDF, Excel (.xlsx) or CSV bank statements. The system reads debits & credits and matches them against your recorded payments and receipts.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Label"><input className="input" value={form.label} onChange={set('label')} placeholder="HDFC — April 2026" /></Field>
        <Field label="Bank Name"><input className="input" value={form.bank_name} onChange={set('bank_name')} /></Field>
        <Field label="Account Number"><input className="input" value={form.account_number} onChange={set('account_number')} /></Field>
        <div />
        <Field label="Period Start"><input className="input" type="date" value={form.period_start} onChange={set('period_start')} /></Field>
        <Field label="Period End"><input className="input" type="date" value={form.period_end} onChange={set('period_end')} /></Field>
      </div>
      <div className="mt-4">
        <Field label="Statement File" required>
          <input className="input !py-2" type="file" accept=".pdf,.xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </Field>
      </div>
    </Modal>
  );
}
