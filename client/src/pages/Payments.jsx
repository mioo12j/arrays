import { useState, useRef } from 'react';
import { Plus, Search, Upload, Loader2, Sparkles, Paperclip, FileDown } from 'lucide-react';
import { api, apiError, download } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, PageHeader, Loading, Badge, Table, Field, DescList, DescRow } from '../components/ui/index.jsx';
import { inr, fmtDate, fmtDateTime, titleCase } from '../lib/format.js';
import { PRESETS, presetRange } from '../lib/dateRange.js';

const BLANK = {
  reference_id: '', amount: '', payment_date: '', beneficiary_name: '', account_details: '',
  bank_remarks: '', network_type: '', payment_mode: 'neft', comment: '',
  project_id: '', site_id: '', vendor_id: '', employee_id: '', payee_type: 'vendor',
  category_id: '', material_type: '', tags: '',
};

export default function Payments() {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', vendor_id: '', project_id: '', invoice_status: '', from: '', to: '' });
  const [preset, setPreset] = useState('');
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString();

  const applyPreset = (val) => {
    setPreset(val);
    if (val !== 'custom') { const r = presetRange(val); setFilters((f) => ({ ...f, from: r.from, to: r.to })); }
  };

  const { data: payments, loading, refetch } = useFetch(`/payments?${qs}`, [qs]);
  const { data: vendors } = useFetch('/vendors');
  const { data: employees } = useFetch('/employees');
  const { data: projects } = useFetch('/projects');
  const { data: sites } = useFetch('/sites');
  const { data: categories } = useFetch('/categories');

  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const fileRef = useRef(null);
  const attachId = useRef(null);

  const pickInvoice = (id) => { attachId.current = id; fileRef.current?.click(); };
  const onInvoiceFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !attachId.current) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post(`/payments/${attachId.current}/invoice`, fd);
      toast.success('Invoice attached');
      refetch();
    } catch (err) { toast.error(apiError(err)); }
    finally { attachId.current = null; if (fileRef.current) fileRef.current.value = ''; }
  };

  return (
    <div>
      <PageHeader
        title="Outgoing Payments"
        subtitle="Upload a payment proof — the OCR engine extracts the details. Verify, classify, and add a mandatory note."
        actions={
          <>
            <button className="btn-ghost" onClick={() => download(`/reports/payments?format=xlsx&${qs}`)}><FileDown size={16} /> Excel</button>
            <button className="btn-ghost" onClick={() => download(`/reports/payments?format=pdf&${qs}`)}><FileDown size={16} /> PDF</button>
            <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New Payment</button>
          </>
        }
      />

      <Card className="mb-4 !p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search reference, beneficiary, comment…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
          </div>
          <select className="input max-w-[180px]" value={filters.vendor_id} onChange={(e) => setFilters((f) => ({ ...f, vendor_id: e.target.value }))}>
            <option value="">All vendors</option>
            {vendors?.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <select className="input max-w-[180px]" value={filters.project_id} onChange={(e) => setFilters((f) => ({ ...f, project_id: e.target.value }))}>
            <option value="">All projects</option>
            {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="input max-w-[160px]" value={filters.invoice_status} onChange={(e) => setFilters((f) => ({ ...f, invoice_status: e.target.value }))}>
            <option value="">Any invoice status</option>
            <option value="pending">Invoice Pending</option>
            <option value="attached">Invoice Attached</option>
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
        {(filters.from || filters.to) && (
          <p className="mt-2 px-1 text-xs text-slate-400">Exports & list filtered: {filters.from || '…'} → {filters.to || '…'}</p>
        )}
      </Card>

      <Card className="!p-0">
        {loading ? (
          <Loading />
        ) : (
          <Table
            columns={[
              { header: 'Date' }, { header: 'Reference' }, { header: 'Vendor / Beneficiary' },
              { header: 'Project' }, { header: 'Category' }, { header: 'Amount', align: 'right' },
              { header: 'Invoice' }, { header: 'Remark / Comment' }, { header: '' },
            ]}
            rows={payments || []}
            empty="No payments recorded yet. Click “New Payment” to upload your first proof."
            onRowClick={(p) => setDetail(p)}
            renderRow={(p) => (
              <>
                <td className="td whitespace-nowrap">{fmtDate(p.payment_date)}</td>
                <td className="td font-mono text-xs">{p.reference_id || '—'}</td>
                <td className="td">
                  {p.vendor_name || p.employee_name || p.beneficiary_name || '—'}
                  {p.employee_name && <Badge tone="purple" className="ml-1">Employee</Badge>}
                </td>
                <td className="td">{p.project_name || '—'}{p.site_name ? ` · ${p.site_name}` : ''}</td>
                <td className="td">{p.category_name || '—'}</td>
                <td className="td text-right font-semibold text-red-600">{inr(p.amount)}</td>
                <td className="td"><Badge status={p.invoice_status} /></td>
                <td className="td max-w-[220px]">
                  {p.bank_remarks && <div className="truncate text-xs text-slate-400" title={p.bank_remarks}>📄 {p.bank_remarks}</div>}
                  <div className="truncate text-slate-600 dark:text-slate-300" title={p.comment}>{p.comment}</div>
                </td>
                <td className="td text-right">
                  {p.invoice_status === 'pending' && (
                    <button className="btn-ghost !py-1 !px-2.5 !text-xs" onClick={(e) => { e.stopPropagation(); pickInvoice(p.id); }}>
                      <Paperclip size={12} /> Attach
                    </button>
                  )}
                </td>
              </>
            )}
          />
        )}
      </Card>

      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onInvoiceFile} />

      {open && (
        <PaymentModal
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); refetch(); toast.success('Payment saved & ledger updated'); }}
          vendors={vendors} employees={employees} projects={projects} sites={sites} categories={categories}
        />
      )}

      {detail && (
        <PaymentDetail
          payment={detail}
          onClose={() => setDetail(null)}
          onAttach={(id) => { setDetail(null); pickInvoice(id); }}
        />
      )}
    </div>
  );
}

// Read-only detail view for a single payment — every field that was recorded.
function PaymentDetail({ payment: p, onClose, onAttach }) {
  return (
    <Modal open onClose={onClose} title="Payment Details" size="lg"
      footer={<button className="btn-ghost" onClick={onClose}>Close</button>}>
      <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Amount Paid</p>
          <p className="text-2xl font-bold text-red-600">{inr(p.amount)}</p>
        </div>
        <Badge status={p.invoice_status} />
      </div>

      <DescList>
        <DescRow label="Date">{fmtDate(p.payment_date)}</DescRow>
        <DescRow label="Reference / UTR" mono>{p.reference_id}</DescRow>
        <DescRow label="Paid To">
          {p.vendor_name || p.employee_name || p.beneficiary_name || '—'}
          {p.employee_name && <Badge tone="purple" className="ml-1">Employee</Badge>}
        </DescRow>
        <DescRow label="Beneficiary (on proof)">{p.beneficiary_name}</DescRow>
        <DescRow label="Account Details" mono>{p.account_details}</DescRow>
        <DescRow label="Payment Mode">{p.payment_mode ? p.payment_mode.toUpperCase() : null}</DescRow>
        <DescRow label="Network Type">{p.network_type}</DescRow>
        <DescRow label="Category">{p.category_name}</DescRow>
        <DescRow label="Project / Site">
          {p.project_name ? `${p.project_name}${p.site_name ? ` · ${p.site_name}` : ''}` : null}
        </DescRow>
        <DescRow label="Material Type">{p.material_type}</DescRow>
        <DescRow label="Tags">{p.tags?.length ? p.tags.join(', ') : null}</DescRow>
        <DescRow label="Recorded On">{fmtDateTime(p.created_at)}</DescRow>
        <DescRow label="Bank Remark (auto-extracted)" wide>{p.bank_remarks}</DescRow>
        <DescRow label="Comment (entered by operator)" wide>{p.comment}</DescRow>
      </DescList>

      {p.invoice_status === 'pending' && onAttach && (
        <button className="btn-ghost mt-5" onClick={() => onAttach(p.id)}>
          <Paperclip size={14} /> Attach Invoice
        </button>
      )}
    </Modal>
  );
}

function PaymentModal({ onClose, onSaved, vendors, employees, projects, sites, categories }) {
  const toast = useToast();
  const { canImport } = useAuth();
  const [form, setForm] = useState(BLANK);
  const [documentId, setDocumentId] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ocrPreview, setOcrPreview] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const siteOptions = sites?.filter((s) => !form.project_id || s.project_id === form.project_id) || [];

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/payments/extract', fd);
      setDocumentId(data.document_id);
      setOcrPreview(data.ocr_preview || '');
      const ex = data.extracted || {};
      setForm((f) => ({
        ...f,
        reference_id: ex.reference_id || f.reference_id,
        amount: ex.amount ?? f.amount,
        payment_date: ex.payment_date || f.payment_date,
        beneficiary_name: ex.beneficiary_name || f.beneficiary_name,
        account_details: ex.account_details || f.account_details,
        bank_remarks: ex.bank_remarks || f.bank_remarks,
        network_type: ex.network_type || f.network_type,
        payment_mode: ex.payment_mode || f.payment_mode,
        vendor_id: data.suggested_vendor?.vendor_id || f.vendor_id,
      }));
      if (data.suggested_vendor) {
        toast.success(`Matched vendor: ${data.suggested_vendor.vendor_name} (${data.suggested_vendor.confidence}%)`);
      } else {
        toast.success('Details extracted — review & classify below');
      }
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setExtracting(false);
    }
  };

  const save = async () => {
    if (!form.comment.trim()) return toast.error('The additional comment is mandatory');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await api.post('/payments', {
        ...form,
        amount: Number(form.amount),
        proof_document_id: documentId,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        project_id: form.project_id || null, site_id: form.site_id || null,
        vendor_id: form.payee_type === 'vendor' ? (form.vendor_id || null) : null,
        employee_id: form.payee_type === 'employee' ? (form.employee_id || null) : null,
        category_id: form.category_id || null,
        payment_date: form.payment_date || null,
      });
      onSaved();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="New Outgoing Payment"
      size="lg"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Payment'}
          </button>
        </>
      }
    >
      {/* Step 1 — upload & OCR (operator-only; OCR is disabled for the admin) */}
      {canImport && (
      <div className="mb-5 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-4 dark:border-brand-900 dark:bg-brand-900/10">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-brand-100 p-2 text-brand-600 dark:bg-brand-900/40">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Auto-extract from proof</p>
            <p className="text-xs text-slate-500">Upload a screenshot or PDF — fields fill in automatically.</p>
          </div>
          <label className="btn-primary cursor-pointer">
            {extracting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            {extracting ? 'Reading…' : 'Upload Proof'}
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={onFile} disabled={extracting} />
          </label>
        </div>
        {documentId && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Paperclip size={12} /> Proof attached & processed
          </p>
        )}
      </div>
      )}

      {/* Step 2 — verify extracted fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Amount" required>
          <input className="input" type="number" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" />
        </Field>
        <Field label="Payment Date">
          <input className="input" type="date" value={form.payment_date || ''} onChange={set('payment_date')} />
        </Field>
        <Field label="Reference / UTR">
          <input className="input" value={form.reference_id} onChange={set('reference_id')} />
        </Field>
        <Field label="Beneficiary">
          <input className="input" value={form.beneficiary_name} onChange={set('beneficiary_name')} />
        </Field>
        <Field label="Payment Mode">
          <select className="input" value={form.payment_mode} onChange={set('payment_mode')}>
            {['neft', 'rtgs', 'imps', 'upi', 'net_banking', 'cheque', 'cash', 'other'].map((m) => (
              <option key={m} value={m}>{m.toUpperCase()}</option>
            ))}
          </select>
        </Field>
        <Field label="Account Details">
          <input className="input" value={form.account_details} onChange={set('account_details')} />
        </Field>
        <Field label="Bank Remark (auto-extracted)" hint="Pulled from the proof; editable">
          <input className="input" value={form.bank_remarks} onChange={set('bank_remarks')} placeholder="Remark / narration from the screenshot" />
        </Field>
      </div>

      {/* Step 3 — classification */}
      <h4 className="mb-3 mt-6 text-sm font-semibold text-slate-700 dark:text-slate-200">Classification</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Payee Type">
          <div className="flex gap-2">
            {['vendor', 'employee'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, payee_type: t }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${form.payee_type === t ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
        {form.payee_type === 'vendor' ? (
          <Field label="Vendor">
            <select className="input" value={form.vendor_id} onChange={set('vendor_id')}>
              <option value="">Select vendor</option>
              {vendors?.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
        ) : (
          <Field label="Employee">
            <select className="input" value={form.employee_id} onChange={set('employee_id')}>
              <option value="">Select employee</option>
              {employees?.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="Category">
          <select className="input" value={form.category_id} onChange={set('category_id')}>
            <option value="">Select category</option>
            {categories?.filter((c) => c.kind === 'expense').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Project">
          <select className="input" value={form.project_id} onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value, site_id: '' }))}>
            <option value="">Select project</option>
            {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Site">
          <select className="input" value={form.site_id} onChange={set('site_id')} disabled={!form.project_id}>
            <option value="">Select site</option>
            {siteOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Material Type">
          <input className="input" value={form.material_type} onChange={set('material_type')} placeholder="e.g. 2 ton steel" />
        </Field>
        <Field label="Tags" hint="Comma separated">
          <input className="input" value={form.tags} onChange={set('tags')} placeholder="advance, urgent" />
        </Field>
      </div>

      {/* Mandatory comment */}
      <div className="mt-5">
        <Field label="Additional Comment" required hint="Business meaning lives here — required before saving.">
          <textarea
            className="input min-h-[80px]"
            value={form.comment}
            onChange={set('comment')}
            placeholder="e.g. Advance paid for 2 ton steel — Samsung Site Phase 4"
          />
        </Field>
      </div>

      {ocrPreview && (
        <details className="mt-4 text-xs text-slate-400">
          <summary className="cursor-pointer font-medium">View raw OCR text</summary>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 dark:bg-slate-800">{ocrPreview}</pre>
        </details>
      )}
    </Modal>
  );
}
