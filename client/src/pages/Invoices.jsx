import { useState, useRef } from 'react';
import { Plus, Search, Loader2, FileDown, Upload } from 'lucide-react';
import { api, apiError, download } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, PageHeader, Loading, Table, Badge, Field } from '../components/ui/index.jsx';
import { inr, fmtDate } from '../lib/format.js';

const STATUSES = ['draft', 'raised', 'sent', 'partially_paid', 'paid', 'overdue', 'closed'];

export default function Invoices() {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', status: '', type: '' });
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString();
  const { data: invoices, loading, refetch } = useFetch(`/invoices?${qs}`, [qs]);
  const { data: clients } = useFetch('/clients');
  const { data: projects } = useFetch('/projects');
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/invoices/extract', fd);
      setPrefill({ ...data.extracted, document_id: data.document_id });
      setOpen(true);
      toast.success('Invoice fields extracted — review & save');
    } catch (err) { toast.error(apiError(err)); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Proforma & GST tax invoices with settlement tracking."
        actions={<>
          <button className="btn-ghost" onClick={() => download('/reports/invoices?format=xlsx')}><FileDown size={16} /> Export</button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} Import
          </button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf,.xlsx,.xls,.csv" className="hidden" onChange={onImport} />
          <button className="btn-primary" onClick={() => { setPrefill(null); setOpen(true); }}><Plus size={16} /> New Invoice</button>
        </>}
      />

      <Card className="mb-4 !p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search invoice number…" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          </div>
          <select className="input max-w-[160px]" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">Any status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="input max-w-[140px]" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
            <option value="">Any type</option>
            <option value="tax">Tax Invoice</option>
            <option value="proforma">Proforma</option>
          </select>
        </div>
      </Card>

      <Card className="!p-0">
        {loading ? <Loading /> : (
          <Table
            columns={[
              { header: 'Invoice #' }, { header: 'Type' }, { header: 'Client' }, { header: 'Project' },
              { header: 'Due' }, { header: 'Total', align: 'right' }, { header: 'Balance', align: 'right' }, { header: 'Status' },
            ]}
            rows={invoices || []}
            empty="No invoices yet."
            renderRow={(i) => (
              <>
                <td className="td font-semibold text-slate-800 dark:text-slate-100">{i.invoice_number}</td>
                <td className="td capitalize">{i.type}</td>
                <td className="td">{i.client_name || '—'}</td>
                <td className="td">{i.project_name || '—'}</td>
                <td className="td whitespace-nowrap">{fmtDate(i.due_date)}</td>
                <td className="td text-right">{inr(i.total_amount)}</td>
                <td className="td text-right font-semibold text-amber-600">{inr(i.balance_due)}</td>
                <td className="td"><Badge status={i.status} /></td>
              </>
            )}
          />
        )}
      </Card>

      {open && <InvoiceModal clients={clients} projects={projects} prefill={prefill} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); refetch(); toast.success('Invoice created'); }} />}
    </div>
  );
}

function InvoiceModal({ onClose, onSaved, clients, projects, prefill }) {
  const toast = useToast();
  const [form, setForm] = useState({
    invoice_number: prefill?.invoice_number || '', type: 'tax', status: 'raised', client_id: '', project_id: '',
    issue_date: prefill?.issue_date || '', due_date: '',
    taxable_amount: prefill?.taxable_amount ?? '', gst_amount: prefill?.gst_amount ?? '', notes: '',
  });
  const documentId = prefill?.document_id || null;
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const total = Number(form.taxable_amount || 0) + Number(form.gst_amount || 0);

  const save = async () => {
    if (!form.invoice_number.trim()) return toast.error('Invoice number is required');
    setSaving(true);
    try {
      await api.post('/invoices', {
        ...form,
        client_id: form.client_id || null, project_id: form.project_id || null,
        issue_date: form.issue_date || null, due_date: form.due_date || null,
        taxable_amount: Number(form.taxable_amount || 0), gst_amount: Number(form.gst_amount || 0),
        total_amount: total, document_id: documentId,
      });
      onSaved();
    } catch (err) { toast.error(apiError(err)); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="New Invoice" size="lg"
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : 'Create Invoice'}</button>
      </>}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Invoice Number" required><input className="input" value={form.invoice_number} onChange={set('invoice_number')} placeholder="INV-2026-001" /></Field>
        <Field label="Type">
          <select className="input" value={form.type} onChange={set('type')}>
            <option value="tax">GST Tax Invoice</option>
            <option value="proforma">Proforma Invoice</option>
          </select>
        </Field>
        <Field label="Client">
          <select className="input" value={form.client_id} onChange={set('client_id')}>
            <option value="">Select client</option>
            {clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Project">
          <select className="input" value={form.project_id} onChange={set('project_id')}>
            <option value="">Select project</option>
            {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className="input" value={form.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </Field>
        <Field label="Issue Date"><input className="input" type="date" value={form.issue_date} onChange={set('issue_date')} /></Field>
        <Field label="Due Date"><input className="input" type="date" value={form.due_date} onChange={set('due_date')} /></Field>
        <Field label="Taxable Amount"><input className="input" type="number" step="0.01" value={form.taxable_amount} onChange={set('taxable_amount')} /></Field>
        <Field label="GST Amount"><input className="input" type="number" step="0.01" value={form.gst_amount} onChange={set('gst_amount')} /></Field>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
        <span className="text-sm font-medium text-slate-500">Total Invoice Value</span>
        <span className="text-lg font-bold text-slate-900 dark:text-white">{inr(total)}</span>
      </div>
      <div className="mt-4"><Field label="Notes"><textarea className="input min-h-[60px]" value={form.notes} onChange={set('notes')} /></Field></div>
    </Modal>
  );
}
