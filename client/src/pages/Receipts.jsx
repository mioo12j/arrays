import { useState } from 'react';
import { Plus, Search, Upload, Loader2, Sparkles, Paperclip, FileDown } from 'lucide-react';
import { api, apiError, download } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, PageHeader, Loading, Table, Field } from '../components/ui/index.jsx';
import { inr, fmtDate } from '../lib/format.js';
import { PRESETS, presetRange } from '../lib/dateRange.js';

const BLANK = {
  reference_id: '', credited_amount: '', credited_date: '', account_details: '',
  client_id: '', invoice_id: '', project_id: '', deduction_amount: '', deduction_reason: '',
  tds_amount: '', retention_amount: '', comment: '',
};

export default function Receipts() {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', client_id: '', project_id: '', from: '', to: '' });
  const [preset, setPreset] = useState('');
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString();

  const applyPreset = (val) => {
    setPreset(val);
    if (val !== 'custom') { const r = presetRange(val); setFilters((f) => ({ ...f, from: r.from, to: r.to })); }
  };

  const { data: receipts, loading, refetch } = useFetch(`/receipts?${qs}`, [qs]);
  const { data: clients } = useFetch('/clients');
  const { data: projects } = useFetch('/projects');
  const { data: invoices } = useFetch('/invoices');
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Incoming Receipts"
        subtitle="Record client payments. The client ledger and receivables update automatically."
        actions={
          <>
            <button className="btn-ghost" onClick={() => download(`/reports/receipts?format=xlsx&${qs}`)}><FileDown size={16} /> Excel</button>
            <button className="btn-ghost" onClick={() => download(`/reports/receipts?format=pdf&${qs}`)}><FileDown size={16} /> PDF</button>
            <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New Receipt</button>
          </>
        }
      />

      <Card className="mb-4 !p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search reference or comment…" value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          </div>
          <select className="input max-w-[180px]" value={filters.client_id} onChange={(e) => setFilters((f) => ({ ...f, client_id: e.target.value }))}>
            <option value="">All clients</option>
            {clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input max-w-[180px]" value={filters.project_id} onChange={(e) => setFilters((f) => ({ ...f, project_id: e.target.value }))}>
            <option value="">All projects</option>
            {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="input max-w-[200px]" value={preset} onChange={(e) => applyPreset(e.target.value)}>
            {PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {preset === 'custom' && (
            <>
              <input className="input max-w-[150px]" type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} title="From" />
              <input className="input max-w-[150px]" type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} title="To" />
            </>
          )}
        </div>
      </Card>

      <Card className="!p-0">
        {loading ? <Loading /> : (
          <Table
            columns={[
              { header: 'Date' }, { header: 'Reference' }, { header: 'Client' }, { header: 'Invoice' },
              { header: 'TDS' }, { header: 'Retention' }, { header: 'Credited', align: 'right' },
            ]}
            rows={receipts || []}
            empty="No receipts yet."
            renderRow={(r) => (
              <>
                <td className="td whitespace-nowrap">{fmtDate(r.credited_date)}</td>
                <td className="td font-mono text-xs">{r.reference_id || '—'}</td>
                <td className="td">{r.client_name || '—'}</td>
                <td className="td">{r.invoice_number || '—'}</td>
                <td className="td">{inr(r.tds_amount, { compact: true })}</td>
                <td className="td">{inr(r.retention_amount, { compact: true })}</td>
                <td className="td text-right font-semibold text-emerald-600">{inr(r.credited_amount)}</td>
              </>
            )}
          />
        )}
      </Card>

      {open && (
        <ReceiptModal
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); refetch(); toast.success('Receipt saved & client ledger updated'); }}
          clients={clients} projects={projects} invoices={invoices}
        />
      )}
    </div>
  );
}

function ReceiptModal({ onClose, onSaved, clients, projects, invoices }) {
  const toast = useToast();
  const [form, setForm] = useState(BLANK);
  const [documentId, setDocumentId] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const clientInvoices = invoices?.filter((i) => !form.client_id || i.client_id === form.client_id) || [];

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/receipts/extract', fd);
      setDocumentId(data.document_id);
      const ex = data.extracted || {};
      setForm((f) => ({
        ...f,
        reference_id: ex.reference_id || f.reference_id,
        credited_amount: ex.credited_amount ?? f.credited_amount,
        credited_date: ex.credited_date || f.credited_date,
        account_details: ex.account_details || f.account_details,
      }));
      toast.success('Details extracted — complete the rest below');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setExtracting(false);
    }
  };

  const save = async () => {
    if (!form.client_id) return toast.error('Select a client');
    if (!form.credited_amount || Number(form.credited_amount) <= 0) return toast.error('Enter a valid credited amount');
    setSaving(true);
    try {
      await api.post('/receipts', {
        ...form,
        credited_amount: Number(form.credited_amount),
        deduction_amount: Number(form.deduction_amount || 0),
        tds_amount: Number(form.tds_amount || 0),
        retention_amount: Number(form.retention_amount || 0),
        proof_document_id: documentId,
        invoice_id: form.invoice_id || null, project_id: form.project_id || null,
        credited_date: form.credited_date || null,
      });
      onSaved();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="New Incoming Receipt" size="lg"
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Receipt'}
        </button>
      </>}>
      <div className="mb-5 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-900/10">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/40"><Sparkles size={18} /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Auto-extract from credit proof</p>
            <p className="text-xs text-slate-500">Upload the bank credit screenshot or PDF.</p>
          </div>
          <label className="btn-primary cursor-pointer">
            {extracting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            {extracting ? 'Reading…' : 'Upload Proof'}
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={onFile} disabled={extracting} />
          </label>
        </div>
        {documentId && <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600"><Paperclip size={12} /> Proof attached & processed</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Credited Amount" required>
          <input className="input" type="number" step="0.01" value={form.credited_amount} onChange={set('credited_amount')} />
        </Field>
        <Field label="Credited Date">
          <input className="input" type="date" value={form.credited_date || ''} onChange={set('credited_date')} />
        </Field>
        <Field label="Reference Number">
          <input className="input" value={form.reference_id} onChange={set('reference_id')} />
        </Field>
        <Field label="Account Details">
          <input className="input" value={form.account_details} onChange={set('account_details')} />
        </Field>
        <Field label="Client" required>
          <select className="input" value={form.client_id} onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value, invoice_id: '' }))}>
            <option value="">Select client</option>
            {clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Linked Invoice">
          <select className="input" value={form.invoice_id} onChange={set('invoice_id')}>
            <option value="">None</option>
            {clientInvoices.map((i) => <option key={i.id} value={i.id}>{i.invoice_number} ({inr(i.total_amount, { compact: true })})</option>)}
          </select>
        </Field>
        <Field label="Project">
          <select className="input" value={form.project_id} onChange={set('project_id')}>
            <option value="">Select project</option>
            {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="TDS Amount">
          <input className="input" type="number" step="0.01" value={form.tds_amount} onChange={set('tds_amount')} />
        </Field>
        <Field label="Retention Amount">
          <input className="input" type="number" step="0.01" value={form.retention_amount} onChange={set('retention_amount')} />
        </Field>
        <Field label="Other Deduction">
          <input className="input" type="number" step="0.01" value={form.deduction_amount} onChange={set('deduction_amount')} />
        </Field>
        <Field label="Deduction Reason">
          <input className="input" value={form.deduction_reason} onChange={set('deduction_reason')} />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Comment / Notes">
          <textarea className="input min-h-[70px]" value={form.comment} onChange={set('comment')} placeholder="e.g. Milestone 2 payment received from Tata Power Solar" />
        </Field>
      </div>
    </Modal>
  );
}
