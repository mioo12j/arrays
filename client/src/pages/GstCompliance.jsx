import { useState, useMemo } from 'react';
import {
  Plus, Search, FileText, Truck, Loader2, Download, FileJson, ShieldCheck,
  CheckCircle2, XCircle, Ban, Copy, Archive, Trash2, RefreshCw, Link2, AlertTriangle,
} from 'lucide-react';
import { api, apiError } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useBranch } from '../context/BranchContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, PageHeader, Loading, Badge, Table, Field, DescList, DescRow } from '../components/ui/index.jsx';
import {
  einvStatus, ewbStatus, inr, dmy, dmyt, gstDownload, blankItem, recalcInvoice,
} from '../lib/gst.js';
import Attachments from '../components/gst/Attachments.jsx';
import OtpModal from '../components/gst/OtpModal.jsx';
import VersionHistory from '../components/gst/VersionHistory.jsx';
import Discussion from '../components/gst/Discussion.jsx';
import SavedViews from '../components/gst/SavedViews.jsx';
import { CheckCircle, XOctagon } from 'lucide-react';

function DrawerSection({ title, children }) {
  return <div className="mt-6"><h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>{children}</div>;
}

const companyFallback = { gstin: '10AARCA4610L1ZT', name: 'ARRAYS INGENIERIA PRIVATE LIMITED', shortName: 'INGENIERIA', address: 'VILL: HARPUR, KALUAHI, MADHUBANI-847229, BIHAR', email: 'arraysingenieria@gmail.com' };

const EINV_STATUSES = ['draft', 'validated', 'irn_generated', 'printed', 'cancelled', 'needs_review', 'error'];
const EWB_STATUSES = ['draft', 'validated', 'part_a', 'generated', 'cancelled', 'rejected', 'closed', 'needs_review', 'error'];

export default function GstCompliance() {
  const { data: perms } = useFetch('/gst/me/permissions');
  const can = (p) => !!perms?.permissions?.includes(p);
  const mode = perms?.mode || 'simulation';
  const { data: master } = useFetch('/gst/master');

  return (
    <div>
      <PageHeader
        title="GST Compliance Workspace"
        subtitle="e-Invoices and E-Way Bills are managed as separate compliance objects, side by side."
        actions={<span className={`rounded-full px-3 py-1 text-xs font-semibold ${mode === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{mode === 'live' ? '● LIVE' : '● Simulation'}</span>}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <EInvoicePanel can={can} master={master} />
        <EwbPanel can={can} master={master} />
      </div>
    </div>
  );
}

/* ════════════════════════════ e-INVOICE PANEL ════════════════════════════ */
function EInvoicePanel({ can, master }) {
  const toast = useToast();
  const { branchQS } = useBranch();
  const [filters, setFilters] = useState({ search: '', status: '' });
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString() + (branchQS ? `&${branchQS}` : '');
  const { data: rows, loading, refetch } = useFetch(`/gst/einvoices?${qs}`, [qs]);
  const [form, setForm] = useState(null);   // create/edit
  const [detailId, setDetailId] = useState(null);

  return (
    <Card className="!p-0">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100"><FileText size={18} className="text-brand-600" /> e-Invoices</h3>
        {can('gst.create') && <button className="btn-primary !py-1.5 !text-sm" onClick={() => setForm({})}><Plus size={15} /> New e-Invoice</button>}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-2 dark:border-slate-800">
        <div className="relative min-w-[180px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !py-1.5 pl-8 text-sm" placeholder="Doc no, GSTIN, customer, IRN…" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
        </div>
        <select className="input !py-1.5 max-w-[150px] text-sm" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">Any status</option>
          {EINV_STATUSES.map((s) => <option key={s} value={s}>{einvStatus(s)[1]}</option>)}
        </select>
      </div>
      <SavedViews objectType="einvoice" filters={filters} onApply={(vf) => setFilters({ search: '', status: '', ...vf })} />
      {loading ? <Loading /> : (
        <Table
          columns={[{ header: 'Doc No' }, { header: 'Customer' }, { header: 'Value', align: 'right' }, { header: 'IRN' }, { header: 'Status' }]}
          rows={rows || []}
          empty="No e-invoices yet. Click “New e-Invoice”."
          onRowClick={(r) => setDetailId(r.id)}
          renderRow={(r) => {
            const [tone, label] = einvStatus(r.status);
            return (
              <>
                <td className="td font-semibold text-slate-800 dark:text-slate-100">{r.docNo || '—'}{r.branchCode && <span className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800">{r.branchCode}</span>}<div className="text-xs font-normal text-slate-400">{dmy(r.docDate)}</div></td>
                <td className="td">{r.buyerName || '—'}<div className="font-mono text-xs text-slate-400">{r.buyerGstin || ''}</div></td>
                <td className="td text-right font-semibold">{inr(r.totalInvVal)}</td>
                <td className="td">{r.irn ? <span className="text-emerald-600" title={r.irn}><ShieldCheck size={14} className="inline" /> {String(r.irn).slice(0, 8)}…</span> : <span className="text-slate-300">—</span>}</td>
                <td className="td"><Badge tone={tone}>{label}</Badge></td>
              </>
            );
          }}
        />
      )}
      {form && <EInvoiceForm master={master} initial={form.id ? form : null} onClose={() => setForm(null)} onSaved={() => { setForm(null); refetch(); }} />}
      {detailId && <EInvoiceDetail id={detailId} can={can} master={master} onClose={() => setDetailId(null)} onChanged={refetch} onEdit={(rec) => { setDetailId(null); setForm(rec); }} />}
    </Card>
  );
}

function EInvoiceForm({ initial, master, onClose, onSaved }) {
  const toast = useToast();
  const { data: companyData } = useFetch('/company');
  const co = companyData || companyFallback;
  const sellerDefault = {
    gstin: co.gstin || '', legalName: co.name || '', tradeName: co.shortName || '', addr1: co.address || '',
    location: 'Madhubani', pincode: '847229', stateCode: String(co.gstin || '10').slice(0, 2), phone: '', email: co.email || '',
  };
  const [form, setForm] = useState(() => initial ? structuredClone(initial) : {
    supplyType: 'B2B', docType: 'INV', docNo: '', docDate: new Date().toISOString().slice(0, 10),
    seller: sellerDefault, buyer: { gstin: '', legalName: '', pos: '', addr1: '', location: '', pincode: '', stateCode: '' },
    items: [blankItem()], val: {},
  });
  const [saving, setSaving] = useState(false);
  const [gv, setGv] = useState(null);
  const computed = useMemo(() => recalcInvoice(form), [form]);
  const validateGstin = async () => {
    try { const { data } = await api.post('/gst/validate-gstin', { gstin: form.buyer.gstin, name: form.buyer.legalName, pincode: form.buyer.pincode, stateCode: form.buyer.stateCode }); setGv(data); }
    catch (e) { toast.error(apiError(e)); }
  };
  const set = (path) => (e) => {
    const v = e.target.value;
    setForm((f) => {
      const n = structuredClone(f);
      const ks = path.split('.'); let o = n;
      for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
      o[ks[ks.length - 1]] = v;
      return n;
    });
  };
  const setItem = (i, k, v) => setForm((f) => { const n = structuredClone(f); n.items[i][k] = v; return n; });
  const opts = (cat) => (master?.[cat] || []);

  const save = async (override) => {
    setSaving(true);
    try {
      const payload = recalcInvoice(form);
      if (override) { payload.overrideDuplicate = true; payload.overrideReason = override; }
      if (initial?.id) { await api.patch(`/gst/einvoices/${initial.id}`, payload); toast.success('Draft updated'); }
      else { await api.post('/gst/einvoices', payload); toast.success('e-Invoice draft created'); }
      onSaved();
    } catch (e) {
      if (e?.response?.status === 409 && /already exists/i.test(apiError(e))) {
        const reason = window.prompt('A duplicate document number was detected. Type a reason to override (audited), or Cancel:');
        if (reason) { setSaving(false); return save(reason); }
      } else { toast.error(apiError(e)); }
    } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title={initial?.id ? 'Edit e-Invoice Draft' : 'New e-Invoice'} size="xl"
      footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Draft'}</button></>}>
      <Section title="Document (DocDtls / TranDtls)">
        <Field label="Supply Type"><select className="input" value={form.supplyType} onChange={set('supplyType')}>{opts('einv_supply_type').map((o) => <option key={o.code} value={o.code}>{o.code} — {o.name}</option>)}</select></Field>
        <Field label="Document Type"><select className="input" value={form.docType} onChange={set('docType')}>{opts('einv_doc_type').map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}</select></Field>
        <Field label="Document No"><input className="input" value={form.docNo} onChange={set('docNo')} placeholder="ARR/2026/001" /></Field>
        <Field label="Document Date"><input className="input" type="date" value={form.docDate} onChange={set('docDate')} /></Field>
      </Section>

      <Section title="Seller (SellerDtls)">
        <Field label="GSTIN"><input className="input" value={form.seller.gstin} onChange={set('seller.gstin')} /></Field>
        <Field label="Legal Name"><input className="input" value={form.seller.legalName} onChange={set('seller.legalName')} /></Field>
        <Field label="Address"><input className="input" value={form.seller.addr1} onChange={set('seller.addr1')} /></Field>
        <Field label="Location"><input className="input" value={form.seller.location} onChange={set('seller.location')} /></Field>
        <Field label="Pincode"><input className="input" value={form.seller.pincode} onChange={set('seller.pincode')} /></Field>
        <Field label="State Code"><input className="input" value={form.seller.stateCode} onChange={set('seller.stateCode')} /></Field>
      </Section>

      <Section title="Buyer (BuyerDtls)">
        <Field label="GSTIN">
          <div className="flex gap-2">
            <input className="input" value={form.buyer.gstin} onChange={(e) => { set('buyer.gstin')(e); setGv(null); }} placeholder="29AAAAA0000A1Z5" />
            <button type="button" className="btn-ghost !px-2.5" onClick={validateGstin} title="Validate GSTIN">Check</button>
          </div>
          {gv && <p className={`mt-1 flex items-center gap-1 text-xs ${gv.result === 'valid' ? 'text-emerald-600' : gv.result === 'warning' ? 'text-amber-600' : 'text-red-600'}`}>{gv.result === 'valid' ? <><CheckCircle size={12} /> Valid GSTIN — {gv.stateName}</> : <><XOctagon size={12} /> {gv.issues[0] || gv.result}</>}</p>}
        </Field>
        <Field label="Legal Name"><input className="input" value={form.buyer.legalName} onChange={set('buyer.legalName')} /></Field>
        <Field label="Place of Supply (state code)"><input className="input" value={form.buyer.pos} onChange={set('buyer.pos')} placeholder="29" /></Field>
        <Field label="Address"><input className="input" value={form.buyer.addr1} onChange={set('buyer.addr1')} /></Field>
        <Field label="Location"><input className="input" value={form.buyer.location} onChange={set('buyer.location')} /></Field>
        <Field label="Pincode"><input className="input" value={form.buyer.pincode} onChange={set('buyer.pincode')} /></Field>
        <Field label="State Code"><input className="input" value={form.buyer.stateCode} onChange={set('buyer.stateCode')} /></Field>
      </Section>

      <h4 className="mb-2 mt-5 text-sm font-semibold text-slate-700 dark:text-slate-200">Items (ItemList)</h4>
      <div className="space-y-2">
        {form.items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
            <input className="input col-span-3 !py-1.5 text-sm" placeholder="Description" value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} />
            <input className="input col-span-2 !py-1.5 text-sm" placeholder="HSN" value={it.hsn} onChange={(e) => setItem(i, 'hsn', e.target.value)} />
            <input className="input col-span-1 !py-1.5 text-sm" type="number" placeholder="Qty" value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
            <input className="input col-span-1 !py-1.5 text-sm" placeholder="Unit" value={it.unit} onChange={(e) => setItem(i, 'unit', e.target.value)} />
            <input className="input col-span-2 !py-1.5 text-sm" type="number" placeholder="Rate" value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', e.target.value)} />
            <select className="input col-span-2 !py-1.5 text-sm" value={it.gstRate} onChange={(e) => setItem(i, 'gstRate', e.target.value)}>{[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}% GST</option>)}</select>
            <button className="col-span-1 text-red-500 hover:text-red-700" onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))} title="Remove"><Trash2 size={15} /></button>
          </div>
        ))}
        <button className="btn-ghost !py-1.5 !text-sm" onClick={() => setForm((f) => ({ ...f, items: [...f.items, blankItem()] }))}><Plus size={14} /> Add item</button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800 sm:grid-cols-4">
        <div><p className="text-xs text-slate-400">Assessable</p><p className="font-semibold">{inr(computed.val.assessableValue)}</p></div>
        <div><p className="text-xs text-slate-400">CGST+SGST</p><p className="font-semibold">{inr((computed.val.cgstValue || 0) + (computed.val.sgstValue || 0))}</p></div>
        <div><p className="text-xs text-slate-400">IGST</p><p className="font-semibold">{inr(computed.val.igstValue)}</p></div>
        <div><p className="text-xs text-slate-400">Total Invoice Value</p><p className="font-bold text-brand-600">{inr(computed.val.totalInvoiceValue)}</p></div>
      </div>
    </Modal>
  );
}

function EInvoiceDetail({ id, can, master, onClose, onChanged, onEdit }) {
  const toast = useToast();
  const { data: rec, loading, refetch } = useFetch(`/gst/einvoices/${id}`, [id]);
  const [busy, setBusy] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [otp, setOtp] = useState(false);
  const act = async (label, fn) => {
    setBusy(label);
    try { await fn(); toast.success(`${label} done`); refetch(); onChanged?.(); }
    catch (e) { toast.error(apiError(e)); } finally { setBusy(''); }
  };
  // OTP-gated cancel: first call returns 428 → show 2FA → retry with the token.
  const doCancel = async (otpToken) => {
    setBusy('Cancel');
    try {
      await api.post(`/gst/einvoices/${id}/cancel`, { reasonCode: cancelReason, remark: 'Cancelled via workspace', otpToken });
      toast.success('IRN cancelled'); setOtp(false); refetch(); onChanged?.();
    } catch (e) {
      if (e?.response?.status === 428) setOtp(true);
      else toast.error(apiError(e));
    } finally { setBusy(''); }
  };
  if (loading || !rec) return <Modal open onClose={onClose} title="e-Invoice"><Loading /></Modal>;
  const [tone, label] = einvStatus(rec.status);
  const editable = ['draft', 'validated', 'needs_review', 'error'].includes(rec.status);
  const errs = (rec.validationErrors || []).filter((i) => i.severity === 'error');

  return (
    <Modal open onClose={onClose} title={`e-Invoice ${rec.docNo || ''}`} size="lg"
      footer={<button className="btn-ghost" onClick={onClose}>Close</button>}>
      <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
        <div><p className="text-xs uppercase text-slate-400">Total Invoice Value</p><p className="text-2xl font-bold text-brand-600">{inr(rec.totalInvVal)}</p></div>
        <Badge tone={tone}>{label}</Badge>
      </div>

      {rec.irn && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs dark:border-emerald-900/40 dark:bg-emerald-900/10">
          <p className="font-mono break-all text-emerald-800 dark:text-emerald-300"><ShieldCheck size={13} className="inline" /> IRN {rec.irn}</p>
          <p className="mt-1 text-emerald-700">Ack No {rec.ackNo} • {dmyt(rec.ackDate)}</p>
        </div>
      )}

      {errs.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/10">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-red-700"><AlertTriangle size={14} /> {errs.length} validation error(s)</p>
          <ul className="space-y-0.5 text-xs text-red-600">{errs.slice(0, 8).map((e, i) => <li key={i}>• {e.message}</li>)}</ul>
        </div>
      )}

      <DescList>
        <DescRow label="Supply / Doc Type">{rec.supplyType} / {rec.docType}</DescRow>
        <DescRow label="Document Date">{dmy(rec.docDate)}</DescRow>
        <DescRow label="Seller">{rec.seller?.legalName}<div className="font-mono text-xs text-slate-400">{rec.seller?.gstin}</div></DescRow>
        <DescRow label="Buyer">{rec.buyer?.legalName}<div className="font-mono text-xs text-slate-400">{rec.buyer?.gstin}</div></DescRow>
        <DescRow label="Items">{rec.items?.length}</DescRow>
        <DescRow label="Created by">{rec.createdByName}</DescRow>
      </DescList>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2">
        {editable && can('gst.edit') && <button className="btn-ghost !text-sm" onClick={() => onEdit(rec)}>Edit</button>}
        {editable && can('gst.validate') && <button className="btn-ghost !text-sm" disabled={!!busy} onClick={() => act('Validate', () => api.post(`/gst/einvoices/${id}/validate`))}><CheckCircle2 size={14} /> Validate</button>}
        {!rec.irn && can('gst.submit') && <button className="btn-primary !text-sm" disabled={!!busy} onClick={() => act('Submit', () => api.post(`/gst/einvoices/${id}/submit`))}>{busy === 'Submit' ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />} Submit → IRN</button>}
        {rec.irn && can('gst.download') && <button className="btn-ghost !text-sm" onClick={() => gstDownload(`/gst/einvoices/${id}/pdf`)}><Download size={14} /> PDF</button>}
        {rec.irn && can('gst.download') && <button className="btn-ghost !text-sm" onClick={() => gstDownload(`/gst/einvoices/${id}/json`)}><FileJson size={14} /> Signed JSON</button>}
        {can('gst.create') && <button className="btn-ghost !text-sm" disabled={!!busy} onClick={() => act('Duplicate', () => api.post(`/gst/einvoices/${id}/duplicate`))}><Copy size={14} /> Duplicate</button>}
        {rec.irn && !rec.isCancelled && can('gst.cancel') && (
          <div className="flex w-full items-center gap-2 rounded-lg bg-red-50 p-2 dark:bg-red-900/10">
            <select className="input !py-1.5 max-w-[150px] text-sm" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
              <option value="">Cancel reason…</option>
              {(master?.einv_cancel_reason || []).map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
            </select>
            <button className="btn-danger !py-1.5 !text-sm" disabled={!cancelReason || !!busy} onClick={() => doCancel()}><Ban size={14} /> Cancel IRN</button>
          </div>
        )}
        {editable && can('gst.archive') && <button className="btn-ghost !text-sm" disabled={!!busy} onClick={() => act('Archive', () => api.post(`/gst/einvoices/${id}/archive`, { archived: true }))}><Archive size={14} /> Archive</button>}
      </div>

      <Attachments objectType="einvoice" objectId={id} canUpload={can('gst.create')} canDelete={can('gst.edit')} />
      <DrawerSection title="Discussion"><Discussion objectType="einvoice" objectId={id} /></DrawerSection>
      <DrawerSection title="Version History"><VersionHistory objectType="einvoice" objectId={id} canRestore={can('gst.edit')} locked={!!rec.irn} restorePath={`/gst/einvoices/${id}/restore-version`} onRestored={refetch} /></DrawerSection>
      <Timeline timeline={rec.timeline} apiLogs={rec.apiLogs} />
      {otp && <OtpModal action="cancel_einvoice" objectType="einvoice" objectId={id} reason={`Cancel ${rec.docNo} (reason ${cancelReason})`} onVerified={(token) => { setOtp(false); doCancel(token); }} onClose={() => setOtp(false)} />}
    </Modal>
  );
}

/* ════════════════════════════ e-WAY BILL PANEL ═══════════════════════════ */
function EwbPanel({ can, master }) {
  const { branchQS } = useBranch();
  const [filters, setFilters] = useState({ search: '', status: '' });
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString() + (branchQS ? `&${branchQS}` : '');
  const { data: rows, loading, refetch } = useFetch(`/gst/ewbs?${qs}`, [qs]);
  const [form, setForm] = useState(null);
  const [detailId, setDetailId] = useState(null);

  return (
    <Card className="!p-0">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100"><Truck size={18} className="text-purple-600" /> E-Way Bills</h3>
        {can('gst.create') && <button className="btn-primary !py-1.5 !text-sm" onClick={() => setForm({})}><Plus size={15} /> New E-Way Bill</button>}
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-2 dark:border-slate-800">
        <div className="relative min-w-[180px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !py-1.5 pl-8 text-sm" placeholder="EWB no, doc no, GSTIN, vehicle, transporter…" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
        </div>
        <select className="input !py-1.5 max-w-[150px] text-sm" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">Any status</option>
          {EWB_STATUSES.map((s) => <option key={s} value={s}>{ewbStatus(s)[1]}</option>)}
        </select>
      </div>
      <SavedViews objectType="ewb" filters={filters} onApply={(vf) => setFilters({ search: '', status: '', ...vf })} />
      {loading ? <Loading /> : (
        <Table
          columns={[{ header: 'EWB / Doc' }, { header: 'To / Vehicle' }, { header: 'Valid Upto' }, { header: 'Status' }]}
          rows={rows || []}
          empty="No e-way bills yet."
          onRowClick={(r) => setDetailId(r.id)}
          renderRow={(r) => {
            const [tone, label] = ewbStatus(r.status);
            return (
              <>
                <td className="td font-semibold text-slate-800 dark:text-slate-100">{r.ewbNo || r.docNo || '—'}{r.branchCode && <span className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800">{r.branchCode}</span>}<div className="text-xs font-normal text-slate-400">{dmy(r.docDate)}</div></td>
                <td className="td">{r.toTradeName || r.toGstin || '—'}<div className="font-mono text-xs text-slate-400">{r.vehicleNo || ''}</div></td>
                <td className="td text-xs">{r.validUpto ? dmyt(r.validUpto) : '—'}</td>
                <td className="td"><Badge tone={tone}>{label}</Badge></td>
              </>
            );
          }}
        />
      )}
      {form && <EwbForm master={master} onClose={() => setForm(null)} onSaved={() => { setForm(null); refetch(); }} />}
      {detailId && <EwbDetail id={detailId} can={can} master={master} onClose={() => setDetailId(null)} onChanged={refetch} />}
    </Card>
  );
}

function EwbForm({ master, onClose, onSaved }) {
  const toast = useToast();
  const { data: companyData } = useFetch('/company');
  const co = companyData || companyFallback;
  const [form, setForm] = useState({
    supplyType: 'O', subSupplyType: '1', docType: 'INV', docNo: '', docDate: new Date().toISOString().slice(0, 10),
    transactionType: 1,
    fromGstin: co.gstin || '', fromTradeName: co.shortName || co.name || '', fromPlace: 'Madhubani', fromPincode: '847229', fromStateCode: String(co.gstin || '10').slice(0, 2),
    toGstin: '', toTradeName: '', toPlace: '', toPincode: '', toStateCode: '',
    totInvValue: '', totalTaxable: '', transDistance: '', transMode: '1', vehicleNo: '', vehicleType: 'R', transporterName: '', transporterId: '',
    items: [{ description: '', hsn: '', quantity: 1, unit: 'NOS', taxableAmount: 0, igstRate: 18 }],
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setItem = (i, k, v) => setForm((f) => { const n = structuredClone(f); n.items[i][k] = v; return n; });
  const opts = (cat) => (master?.[cat] || []);
  const isRoad = String(form.transMode) === '1';

  const save = async () => {
    setSaving(true);
    try {
      const taxable = form.items.reduce((s, it) => s + Number(it.taxableAmount || 0), 0);
      await api.post('/gst/ewbs', { ...form, totalTaxable: taxable, totInvValue: form.totInvValue || taxable });
      toast.success('E-Way Bill draft created'); onSaved();
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="New E-Way Bill" size="xl"
      footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Draft'}</button></>}>
      <Section title="Part A — Supply & Document">
        <Field label="Supply Type"><select className="input" value={form.supplyType} onChange={set('supplyType')}>{opts('ewb_supply_type').map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}</select></Field>
        <Field label="Sub-Supply Type"><select className="input" value={form.subSupplyType} onChange={set('subSupplyType')}>{opts('ewb_sub_supply_type').map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}</select></Field>
        <Field label="Doc Type"><select className="input" value={form.docType} onChange={set('docType')}>{opts('ewb_doc_type').map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}</select></Field>
        <Field label="Doc No"><input className="input" value={form.docNo} onChange={set('docNo')} /></Field>
        <Field label="Doc Date"><input className="input" type="date" value={form.docDate} onChange={set('docDate')} /></Field>
        <Field label="Transaction Type"><select className="input" value={form.transactionType} onChange={set('transactionType')}>{opts('ewb_txn_type').map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}</select></Field>
      </Section>
      <Section title="From (Dispatch)">
        <Field label="GSTIN"><input className="input" value={form.fromGstin} onChange={set('fromGstin')} /></Field>
        <Field label="Trade Name"><input className="input" value={form.fromTradeName} onChange={set('fromTradeName')} /></Field>
        <Field label="Place"><input className="input" value={form.fromPlace} onChange={set('fromPlace')} /></Field>
        <Field label="Pincode"><input className="input" value={form.fromPincode} onChange={set('fromPincode')} /></Field>
        <Field label="State Code"><input className="input" value={form.fromStateCode} onChange={set('fromStateCode')} /></Field>
      </Section>
      <Section title="To (Ship To)">
        <Field label="GSTIN"><input className="input" value={form.toGstin} onChange={set('toGstin')} /></Field>
        <Field label="Trade Name"><input className="input" value={form.toTradeName} onChange={set('toTradeName')} /></Field>
        <Field label="Place"><input className="input" value={form.toPlace} onChange={set('toPlace')} /></Field>
        <Field label="Pincode"><input className="input" value={form.toPincode} onChange={set('toPincode')} /></Field>
        <Field label="State Code"><input className="input" value={form.toStateCode} onChange={set('toStateCode')} /></Field>
      </Section>
      <Section title="Part B — Transport (optional now; can add later)">
        <Field label="Distance (km)"><input className="input" type="number" value={form.transDistance} onChange={set('transDistance')} /></Field>
        <Field label="Mode"><select className="input" value={form.transMode} onChange={set('transMode')}>{opts('trans_mode').map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}</select></Field>
        {isRoad ? <>
          <Field label="Vehicle No"><input className="input" value={form.vehicleNo} onChange={set('vehicleNo')} placeholder="MH12AB1234" /></Field>
          <Field label="Vehicle Type"><select className="input" value={form.vehicleType} onChange={set('vehicleType')}>{opts('vehicle_type').map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}</select></Field>
        </> : <>
          <Field label="Transport Doc No"><input className="input" value={form.transDocNo || ''} onChange={set('transDocNo')} /></Field>
          <Field label="Transport Doc Date"><input className="input" type="date" value={form.transDocDate || ''} onChange={set('transDocDate')} /></Field>
        </>}
        <Field label="Transporter Name"><input className="input" value={form.transporterName} onChange={set('transporterName')} /></Field>
      </Section>
      <h4 className="mb-2 mt-5 text-sm font-semibold text-slate-700 dark:text-slate-200">Items</h4>
      <div className="space-y-2">
        {form.items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
            <input className="input col-span-4 !py-1.5 text-sm" placeholder="Product" value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} />
            <input className="input col-span-2 !py-1.5 text-sm" placeholder="HSN" value={it.hsn} onChange={(e) => setItem(i, 'hsn', e.target.value)} />
            <input className="input col-span-2 !py-1.5 text-sm" type="number" placeholder="Qty" value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
            <input className="input col-span-3 !py-1.5 text-sm" type="number" placeholder="Taxable" value={it.taxableAmount} onChange={(e) => setItem(i, 'taxableAmount', e.target.value)} />
            <button className="col-span-1 text-red-500" onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}><Trash2 size={15} /></button>
          </div>
        ))}
        <button className="btn-ghost !py-1.5 !text-sm" onClick={() => setForm((f) => ({ ...f, items: [...f.items, { description: '', hsn: '', quantity: 1, unit: 'NOS', taxableAmount: 0, igstRate: 18 }] }))}><Plus size={14} /> Add item</button>
      </div>
    </Modal>
  );
}

function EwbDetail({ id, can, master, onClose, onChanged }) {
  const toast = useToast();
  const { data: rec, loading, refetch } = useFetch(`/gst/ewbs/${id}`, [id]);
  const [busy, setBusy] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [otp, setOtp] = useState(false);
  const act = async (label, fn) => { setBusy(label); try { await fn(); toast.success(`${label} done`); refetch(); onChanged?.(); } catch (e) { toast.error(apiError(e)); } finally { setBusy(''); } };
  const doCancel = async (otpToken) => {
    setBusy('Cancel');
    try { await api.post(`/gst/ewbs/${id}/cancel`, { reasonCode: cancelReason, remark: 'Cancelled via workspace', otpToken }); toast.success('EWB cancelled'); setOtp(false); refetch(); onChanged?.(); }
    catch (e) { if (e?.response?.status === 428) setOtp(true); else toast.error(apiError(e)); } finally { setBusy(''); }
  };
  if (loading || !rec) return <Modal open onClose={onClose} title="e-Way Bill"><Loading /></Modal>;
  const [tone, label] = ewbStatus(rec.status);
  const errs = (rec.validationErrors || []).filter((i) => i.severity === 'error');

  return (
    <Modal open onClose={onClose} title={`e-Way Bill ${rec.ewbNo || rec.docNo || ''}`} size="lg" footer={<button className="btn-ghost" onClick={onClose}>Close</button>}>
      <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
        <div>
          {rec.ewbNo ? <><p className="text-xs uppercase text-slate-400">EWB Number</p><p className="text-xl font-bold text-slate-900 dark:text-white">{rec.ewbNo}</p></> : <p className="text-sm text-slate-500">Not generated yet</p>}
          {rec.validUpto && <p className="mt-1 text-xs text-slate-500">Valid upto {dmyt(rec.validUpto)}</p>}
        </div>
        <Badge tone={tone}>{label}</Badge>
      </div>

      {errs.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/10">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-red-700"><AlertTriangle size={14} /> {errs.length} validation error(s)</p>
          <ul className="space-y-0.5 text-xs text-red-600">{errs.slice(0, 8).map((e, i) => <li key={i}>• {e.message}</li>)}</ul>
        </div>
      )}

      <DescList>
        <DescRow label="From">{rec.fromTradeName}<div className="font-mono text-xs text-slate-400">{rec.fromGstin}</div></DescRow>
        <DescRow label="To">{rec.toTradeName}<div className="font-mono text-xs text-slate-400">{rec.toGstin}</div></DescRow>
        <DescRow label="Doc">{rec.docType} {rec.docNo} ({dmy(rec.docDate)})</DescRow>
        <DescRow label="Distance">{rec.transDistance} km</DescRow>
        <DescRow label="Transport">{({ 1: 'Road', 2: 'Rail', 3: 'Air', 4: 'Ship' })[rec.transMode] || '—'} {rec.vehicleNo ? `• ${rec.vehicleNo}` : ''}</DescRow>
        <DescRow label="Part B">{rec.partBReady ? 'Complete' : 'Pending'}</DescRow>
        {rec.sourceEinvoiceId && <DescRow label="Linked"><span className="inline-flex items-center gap-1 text-brand-600"><Link2 size={12} /> from e-invoice</span></DescRow>}
      </DescList>

      <div className="mt-5 flex flex-wrap gap-2">
        {can('gst.validate') && !rec.ewbNo && <button className="btn-ghost !text-sm" disabled={!!busy} onClick={() => act('Validate', () => api.post(`/gst/ewbs/${id}/validate`))}><CheckCircle2 size={14} /> Validate</button>}
        {!rec.ewbNo && can('gst.submit') && <button className="btn-primary !text-sm" disabled={!!busy} onClick={() => act('Generate', () => api.post(`/gst/ewbs/${id}/generate`))}>{busy === 'Generate' ? <Loader2 className="animate-spin" size={14} /> : <Truck size={14} />} Generate EWB</button>}
        {rec.ewbNo && !rec.partBReady && can('gst.submit') && <button className="btn-ghost !text-sm" disabled={!!busy} onClick={() => act('Part B', () => api.post(`/gst/ewbs/${id}/update-partb`, { transMode: rec.transMode || '1', vehicleNo: rec.vehicleNo, vehicleType: rec.vehicleType || 'R' }))}>Update Part B</button>}
        {rec.ewbNo && !rec.isCancelled && can('gst.submit') && <button className="btn-ghost !text-sm" disabled={!!busy} onClick={() => act('Extend', () => api.post(`/gst/ewbs/${id}/extend`, {}))}><RefreshCw size={14} /> Extend</button>}
        {rec.ewbNo && can('gst.download') && <button className="btn-ghost !text-sm" onClick={() => gstDownload(`/gst/ewbs/${id}/pdf`)}><Download size={14} /> PDF</button>}
        {rec.ewbNo && !rec.isCancelled && !rec.isClosed && can('gst.submit') && <button className="btn-ghost !text-sm" disabled={!!busy} onClick={() => act('Close', () => api.post(`/gst/ewbs/${id}/close`))}>Close</button>}
        {rec.ewbNo && !rec.isCancelled && can('gst.cancel') && (
          <div className="flex w-full items-center gap-2 rounded-lg bg-red-50 p-2 dark:bg-red-900/10">
            <select className="input !py-1.5 max-w-[150px] text-sm" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
              <option value="">Cancel reason…</option>
              {(master?.ewb_cancel_reason || []).map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
            </select>
            <button className="btn-danger !py-1.5 !text-sm" disabled={!cancelReason || !!busy} onClick={() => doCancel()}><Ban size={14} /> Cancel EWB</button>
          </div>
        )}
      </div>

      <Attachments objectType="ewb" objectId={id} canUpload={can('gst.create')} canDelete={can('gst.edit')} />
      <DrawerSection title="Discussion"><Discussion objectType="ewb" objectId={id} /></DrawerSection>
      <DrawerSection title="Version History"><VersionHistory objectType="ewb" objectId={id} canRestore={can('gst.edit')} locked={!!rec.ewbNo} restorePath={`/gst/ewbs/${id}/restore-version`} onRestored={refetch} /></DrawerSection>
      <Timeline timeline={rec.timeline} apiLogs={rec.apiLogs} />
      {otp && <OtpModal action="cancel_ewb" objectType="ewb" objectId={id} reason={`Cancel EWB ${rec.ewbNo} (reason ${cancelReason})`} onVerified={(token) => { setOtp(false); doCancel(token); }} onClose={() => setOtp(false)} />}
    </Modal>
  );
}

/* ════════════════════════════ shared bits ════════════════════════════════ */
function Section({ title, children }) {
  return (
    <>
      <h4 className="mb-2 mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </>
  );
}

function Timeline({ timeline = [], apiLogs = [] }) {
  if (!timeline.length && !apiLogs.length) return null;
  return (
    <div className="mt-6">
      <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Audit Timeline</h4>
      <ol className="relative space-y-3 border-l border-slate-200 pl-4 dark:border-slate-700">
        {timeline.map((t) => (
          <li key={t.id} className="relative">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.event_type?.replace(/_/g, ' ')}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{t.message}</p>
            <p className="text-xs text-slate-400">{dmyt(t.created_at)} {t.user_name ? `• ${t.user_name}` : ''}</p>
          </li>
        ))}
      </ol>
      {apiLogs.length > 0 && (
        <details className="mt-3 text-xs text-slate-400">
          <summary className="cursor-pointer font-medium">API log ({apiLogs.length})</summary>
          <ul className="mt-1 space-y-1">
            {apiLogs.map((l) => <li key={l.id}>{dmyt(l.created_at)} — <b>{l.action}</b> → {l.response_status} {l.error_code ? `(${l.error_code})` : ''}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}
