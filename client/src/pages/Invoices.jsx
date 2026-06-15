import { useMemo, useState, useRef, useEffect } from 'react';
import { Plus, Search, Loader2, FileDown, Upload, ShieldCheck, Trash2, Truck, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, apiError, download } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, PageHeader, Loading, Table, Badge, Field, EmptyState } from '../components/ui/index.jsx';
import { inr, fmtDate } from '../lib/format.js';
import { useUnsavedGuard, useDraft, loadDraft, clearDraft } from '../context/UnsavedChangesContext.jsx';

const SELLER_STATE = '09'; // ARRAYS main office (Greater Noida, UP)
const STD_STATUS = ['draft', 'issued', 'cancelled'];
const label = (s) => String(s || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const blankItem = () => ({ description: '', hsn: '', quantity: 1, unit: 'NOS', rate: 0, gstRate: 18 });

export default function Invoices() {
  const toast = useToast();
  const { canImport } = useAuth();
  const [filters, setFilters] = useState({ search: '', status: '', type: '' });
  const qs = useMemo(() => new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString(), [filters]);
  const { data: rows, loading, refetch } = useFetch(`/invoices/unified?${qs}`, [qs]);
  const { data: clients } = useFetch('/clients');
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const { data } = await api.post('/invoices/extract', fd);
      setEditing({ invoice_number: data.extracted?.invoice_number || '', document_id: data.document_id, items: [blankItem()],
        taxable_amount: data.extracted?.taxable_amount, gst_amount: data.extracted?.gst_amount });
      toast.success('Invoice fields extracted — review & save');
    } catch (err) { toast.error(apiError(err)); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Standard commercial invoices and GST e-Invoices in one place, with e-Way Bill linkage."
        actions={<>
          <button className="btn-ghost" onClick={() => download('/reports/invoices?format=xlsx')}><FileDown size={16} /> Export</button>
          {canImport && (
            <button className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={importing}>
              {importing ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} Import
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*,application/pdf,.xlsx,.xls,.csv" className="hidden" onChange={onImport} />
          <button className="btn-primary" onClick={() => setEditing({ items: [blankItem()], status: 'issued' })}><Plus size={16} /> New Invoice</button>
        </>}
      />

      <Card className="mb-4 !p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search invoice no, customer, GSTIN…" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          </div>
          <select className="input !w-auto" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
            <option value="">All types</option>
            <option value="standard">Standard Invoice</option>
            <option value="einvoice">GST E-Invoice</option>
          </select>
          <input className="input !w-auto" placeholder="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} />
        </div>
      </Card>

      <Card className="!p-0">
        {loading ? <Loading /> : !rows?.length ? <EmptyState title="No invoices yet" hint='Click "New Invoice" to create a standard invoice, or generate a GST e-Invoice from the GST workspace.' /> : (
          <Table
            columns={[{ header: 'Invoice No' }, { header: 'Type' }, { header: 'Customer' }, { header: 'Date' }, { header: 'Amount', align: 'right' }, { header: 'Status' }, { header: 'Linked E-Way Bill' }, { header: 'Created By' }]}
            rows={rows} empty="No invoices"
            renderRow={(r) => (
              <>
                <td className="td font-semibold text-slate-800 dark:text-slate-100">
                  {r.type === 'einvoice'
                    ? <Link to="/gst/compliance" className="hover:underline">{r.invoice_number || '—'}</Link>
                    : <button className="hover:underline" onClick={() => openInvoice(r.id, setEditing, toast)}>{r.invoice_number || '—'}</button>}
                </td>
                <td className="td">{r.type === 'einvoice'
                  ? <Badge tone="green"><ShieldCheck size={11} className="mr-0.5 inline" /> GST E-Invoice</Badge>
                  : <Badge tone="blue"><FileText size={11} className="mr-0.5 inline" /> Standard</Badge>}
                </td>
                <td className="td text-sm">{r.party || '—'}<div className="text-xs text-slate-400">{r.gstin || ''}</div></td>
                <td className="td whitespace-nowrap text-sm">{fmtDate(r.date)}</td>
                <td className="td text-right font-medium">{inr(r.amount)}</td>
                <td className="td">{r.irn && r.type === 'einvoice' ? <Badge tone="green">IRN</Badge> : <Badge status={r.status} />}</td>
                <td className="td text-xs">{r.linked_ewb_no
                  ? <span className="inline-flex items-center gap-1 text-emerald-600"><Truck size={12} /> {r.linked_ewb_no}</span>
                  : <span className="text-slate-300">—</span>}</td>
                <td className="td text-sm text-slate-500">{r.created_by_name || '—'}</td>
              </>
            )}
          />
        )}
      </Card>

      {editing && <InvoiceEditor initial={editing} clients={clients} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refetch(); toast.success('Invoice saved'); }} />}
    </div>
  );
}

async function openInvoice(id, setEditing, toast) {
  try {
    const { data } = await api.get(`/invoices/${id}`);
    setEditing({
      id, invoice_number: data.invoice_number, status: data.status, issue_date: data.issue_date?.slice(0, 10) || '',
      due_date: data.due_date?.slice(0, 10) || '', client_id: data.client_id || '', customer_name: data.customer_name || '',
      customer_gstin: data.customer_gstin || '', place_of_supply: data.place_of_supply || '',
      billing_address: data.billing_address || '', shipping_address: data.shipping_address || '', notes: data.notes || '',
      linked_ewb_no: data.linked_ewb_no, linked_ewb_status: data.linked_ewb_status,
      items: (data.items?.length ? data.items : [blankItem()]).map((it) => ({
        description: it.description || '', hsn: it.hsn || '', quantity: Number(it.quantity) || 1, unit: it.unit || 'NOS',
        rate: Number(it.rate) || 0, gstRate: Number(it.gst_rate) || 0,
      })),
    });
  } catch (e) { toast.error(apiError(e)); }
}

function InvoiceEditor({ initial, clients, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!initial.id;
  const [f, setF] = useState(() => ({
    invoice_number: initial.invoice_number || '', status: initial.status || 'issued',
    issue_date: initial.issue_date || new Date().toISOString().slice(0, 10), due_date: initial.due_date || '',
    client_id: initial.client_id || '', customer_name: initial.customer_name || '', customer_gstin: initial.customer_gstin || '',
    place_of_supply: initial.place_of_supply || '', billing_address: initial.billing_address || '', shipping_address: initial.shipping_address || '',
    notes: initial.notes || '', document_id: initial.document_id || null,
    items: (initial.items?.length ? initial.items : [blankItem()]).map((it) => ({ ...blankItem(), ...it })),
  }));
  const [busy, setBusy] = useState(false);
  // §6/§13 — unsaved-changes guard + crash-safe draft auto-save
  const draftKey = `invoice-${initial.id || 'new'}`;
  const baselineRef = useRef(JSON.stringify(f));
  const dirty = JSON.stringify(f) !== baselineRef.current;
  useUnsavedGuard(dirty);
  useDraft(draftKey, f, dirty);
  useEffect(() => {
    if (initial.id) return;
    const d = loadDraft(draftKey);
    if (d && window.confirm('Restore your unsaved invoice draft from earlier?')) setF(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const close = () => { if (dirty && !window.confirm('Discard unsaved changes? Your draft is saved and can be restored later.')) return; onClose(); };
  const setItem = (i, k, v) => setF((x) => ({ ...x, items: x.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) }));
  const addItem = () => setF((x) => ({ ...x, items: [...x.items, blankItem()] }));
  const delItem = (i) => setF((x) => ({ ...x, items: x.items.filter((_, j) => j !== i) }));
  const onClient = (e) => { const id = e.target.value; const c = clients?.find((x) => x.id === id); setF((x) => ({ ...x, client_id: id, customer_name: c?.name || x.customer_name, customer_gstin: c?.gstin || x.customer_gstin, place_of_supply: (c?.gstin || '').slice(0, 2) || x.place_of_supply })); };

  const totals = useMemo(() => {
    const inter = f.place_of_supply && f.place_of_supply !== SELLER_STATE;
    let taxable = 0, tax = 0;
    f.items.forEach((it) => { const base = Number(it.quantity || 0) * Number(it.rate || 0); taxable += base; tax += base * Number(it.gstRate || 0) / 100; });
    return { inter, taxable, tax, cgst: inter ? 0 : tax / 2, sgst: inter ? 0 : tax / 2, igst: inter ? tax : 0, total: taxable + tax };
  }, [f.items, f.place_of_supply]);

  const save = async () => {
    if (!f.invoice_number.trim()) return toast.error('Invoice number is required');
    if (!f.items.some((it) => it.description && Number(it.quantity) > 0)) return toast.error('Add at least one item');
    setBusy(true);
    try {
      const body = { ...f, client_id: f.client_id || null, issue_date: f.issue_date || null, due_date: f.due_date || null };
      if (isEdit) await api.patch(`/invoices/${initial.id}`, body); else await api.post('/invoices', body);
      clearDraft(draftKey);
      onSaved();
    } catch (e) { toast.error(apiError(e)); } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={close} size="xl" title={isEdit ? `Edit Invoice ${initial.invoice_number || ''}` : 'New Standard Invoice'}
      footer={<><button className="btn-ghost" onClick={close}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={busy}>{busy ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />} {isEdit ? 'Save' : 'Create Invoice'}</button></>}>
      <div className="space-y-4">
        {initial.linked_ewb_no && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-900/20">
            <Truck size={14} className="text-emerald-600" /> Linked E-Way Bill <b>{initial.linked_ewb_no}</b> {initial.linked_ewb_status && <Badge tone="green">{initial.linked_ewb_status}</Badge>}
            <Link to="/gst/compliance" className="ml-auto text-emerald-600 hover:underline">Open <ArrowRight size={12} className="inline" /></Link>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Invoice Number" required><input className="input" value={f.invoice_number} onChange={(e) => setF((x) => ({ ...x, invoice_number: e.target.value }))} placeholder="INV/26-27/001" /></Field>
          <Field label="Status"><select className="input" value={f.status} onChange={(e) => setF((x) => ({ ...x, status: e.target.value }))}>{STD_STATUS.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></Field>
          <Field label="Invoice Date"><input type="date" className="input" value={f.issue_date} onChange={(e) => setF((x) => ({ ...x, issue_date: e.target.value }))} /></Field>
          <Field label="Due Date"><input type="date" className="input" value={f.due_date} onChange={(e) => setF((x) => ({ ...x, due_date: e.target.value }))} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Customer (existing)"><select className="input" value={f.client_id} onChange={onClient}><option value="">— free text —</option>{clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Customer Name"><input className="input" value={f.customer_name} onChange={(e) => setF((x) => ({ ...x, customer_name: e.target.value }))} /></Field>
          <Field label="Customer GSTIN"><input className="input" value={f.customer_gstin} onChange={(e) => setF((x) => ({ ...x, customer_gstin: e.target.value.toUpperCase(), place_of_supply: e.target.value.slice(0, 2) || x.place_of_supply }))} /></Field>
          <Field label="Place of Supply (state code)"><input className="input" value={f.place_of_supply} onChange={(e) => setF((x) => ({ ...x, place_of_supply: e.target.value }))} placeholder="09" /></Field>
          <Field label="Billing Address"><input className="input" value={f.billing_address} onChange={(e) => setF((x) => ({ ...x, billing_address: e.target.value }))} /></Field>
          <Field label="Shipping Address"><input className="input" value={f.shipping_address} onChange={(e) => setF((x) => ({ ...x, shipping_address: e.target.value }))} /></Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Items</h4><button className="btn-ghost !py-1 !text-xs" onClick={addItem}><Plus size={13} /> Add item</button></div>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-800/50"><tr>
                <th className="px-2 py-1.5 text-left">Description</th><th className="px-2 py-1.5 text-left">HSN/SAC</th><th className="px-2 py-1.5 text-right">Qty</th><th className="px-2 py-1.5 text-left">Unit</th><th className="px-2 py-1.5 text-right">Rate</th><th className="px-2 py-1.5 text-right">GST%</th><th className="px-2 py-1.5 text-right">Taxable</th><th></th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {f.items.map((it, i) => (
                  <tr key={i}>
                    <td className="px-1 py-1"><input className="input !py-1 !text-sm min-w-[160px]" value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} placeholder="Item / service" /></td>
                    <td className="px-1 py-1"><input className="input !py-1 !text-sm w-20" value={it.hsn} onChange={(e) => setItem(i, 'hsn', e.target.value)} /></td>
                    <td className="px-1 py-1"><input type="number" className="input !py-1 !text-sm w-16 text-right" value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} /></td>
                    <td className="px-1 py-1"><input className="input !py-1 !text-sm w-16" value={it.unit} onChange={(e) => setItem(i, 'unit', e.target.value)} /></td>
                    <td className="px-1 py-1"><input type="number" className="input !py-1 !text-sm w-24 text-right" value={it.rate} onChange={(e) => setItem(i, 'rate', e.target.value)} /></td>
                    <td className="px-1 py-1"><input type="number" className="input !py-1 !text-sm w-14 text-right" value={it.gstRate} onChange={(e) => setItem(i, 'gstRate', e.target.value)} /></td>
                    <td className="px-2 py-1 text-right text-slate-500">{inr(Number(it.quantity || 0) * Number(it.rate || 0))}</td>
                    <td className="px-1 py-1">{f.items.length > 1 && <button className="text-slate-400 hover:text-red-500" onClick={() => delItem(i)}><Trash2 size={14} /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex flex-wrap justify-end gap-5 text-sm">
            <span className="text-slate-500">Taxable <b className="text-slate-800 dark:text-slate-100">{inr(totals.taxable)}</b></span>
            {totals.inter
              ? <span className="text-slate-500">IGST <b>{inr(totals.igst)}</b></span>
              : <span className="text-slate-500">CGST <b>{inr(totals.cgst)}</b> · SGST <b>{inr(totals.sgst)}</b></span>}
            <span className="text-slate-500">Total <b className="text-brand-700 dark:text-brand-300">{inr(totals.total)}</b></span>
          </div>
        </div>

        <Field label="Notes"><textarea className="input min-h-[50px]" value={f.notes} onChange={(e) => setF((x) => ({ ...x, notes: e.target.value }))} /></Field>
      </div>
    </Modal>
  );
}
