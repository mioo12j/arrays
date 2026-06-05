import { useState, useRef } from 'react';
import { Plus, Search, Loader2, ChevronRight, Upload } from 'lucide-react';
import { api, apiError } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, PageHeader, Loading, Table, Badge, Field } from '../components/ui/index.jsx';
import { inr } from '../lib/format.js';

export default function Vendors() {
  const toast = useToast();
  const { canImport } = useAuth();
  const { data: vendors, loading, refetch } = useFetch('/vendors');
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);
  const filtered = (vendors || []).filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/vendors/import', fd);
      toast.success(`Imported ${data.imported} vendors (${data.accounts_linked} accounts linked)`);
      refetch();
    } catch (err) { toast.error(apiError(err)); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  return (
    <div>
      <PageHeader
        title="Vendor Master"
        subtitle="Vendor-wise ledgers, beneficiary accounts and auto-mapping intelligence."
        actions={<>
          {canImport && (
            <button className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={importing}>
              {importing ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} Import List
            </button>
          )}
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onImport} />
          <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New Vendor</button>
        </>}
      />

      <Card className="mb-4 !p-3">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search vendors…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card className="!p-0">
        {loading ? <Loading /> : (
          <Table
            columns={[
              { header: 'Vendor' }, { header: 'Category' }, { header: 'GSTIN' },
              { header: 'Total Paid', align: 'right' }, { header: 'Outstanding', align: 'right' },
              { header: 'Pending Inv.' }, { header: '' },
            ]}
            rows={filtered}
            empty="No vendors yet."
            onRowClick={(v) => (window.location.href = `/vendors/${v.id}`)}
            renderRow={(v) => (
              <>
                <td className="td font-semibold text-slate-800 dark:text-slate-100">{v.name}</td>
                <td className="td">{v.category || '—'}</td>
                <td className="td font-mono text-xs">{v.gstin || '—'}</td>
                <td className="td text-right">{inr(v.total_paid)}</td>
                <td className="td text-right font-semibold text-amber-600">{inr(v.balance)}</td>
                <td className="td">{v.pending_invoices > 0 ? <Badge tone="amber">{v.pending_invoices}</Badge> : '—'}</td>
                <td className="td text-right"><ChevronRight size={16} className="text-slate-300" /></td>
              </>
            )}
          />
        )}
      </Card>

      {open && <VendorModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); refetch(); toast.success('Vendor created'); }} />}
    </div>
  );
}

function VendorModal({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', category: '', material_type: '', tags: '', gstin: '', contact_name: '', phone: '', email: '', address: '', bank_account: '', ifsc: '', opening_balance: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim()) return toast.error('Vendor name is required');
    setSaving(true);
    try {
      await api.post('/vendors', {
        ...form,
        opening_balance: Number(form.opening_balance || 0),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      onSaved();
    } catch (err) { toast.error(apiError(err)); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="New Vendor"
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : 'Create Vendor'}</button>
      </>}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Vendor Name" required><input className="input" value={form.name} onChange={set('name')} /></Field>
        <Field label="Category"><input className="input" value={form.category} onChange={set('category')} placeholder="Steel, Transport…" /></Field>
        <Field label="Material Type"><input className="input" value={form.material_type} onChange={set('material_type')} placeholder="Panels, cables…" /></Field>
        <Field label="Tags" hint="Comma separated"><input className="input" value={form.tags} onChange={set('tags')} placeholder="labour, recurring" /></Field>
        <Field label="GSTIN"><input className="input" value={form.gstin} onChange={set('gstin')} /></Field>
        <Field label="Contact Person"><input className="input" value={form.contact_name} onChange={set('contact_name')} /></Field>
        <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} /></Field>
        <Field label="Email"><input className="input" value={form.email} onChange={set('email')} /></Field>
        <Field label="Bank Account" hint="Used for auto-mapping bank transactions"><input className="input" value={form.bank_account} onChange={set('bank_account')} /></Field>
        <Field label="IFSC"><input className="input" value={form.ifsc} onChange={set('ifsc')} /></Field>
        <Field label="Opening Balance" hint="Amount you currently owe this vendor"><input className="input" type="number" step="0.01" value={form.opening_balance} onChange={set('opening_balance')} /></Field>
      </div>
      <div className="mt-4"><Field label="Address"><textarea className="input min-h-[60px]" value={form.address} onChange={set('address')} /></Field></div>
    </Modal>
  );
}
