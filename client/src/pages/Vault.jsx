import { useState } from 'react';
import { Plus, Search, Loader2, FileDown, FileText, AlertTriangle, Clock } from 'lucide-react';
import { api, apiError, download } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, PageHeader, Loading, Table, Badge, Field, EmptyState } from '../components/ui/index.jsx';
import { fmtDate } from '../lib/format.js';

const EXPIRY_TONE = { expired: 'red', expiring: 'amber', valid: 'green', none: 'slate' };
const EXPIRY_LABEL = { expired: 'Expired', expiring: 'Expiring soon', valid: 'Valid', none: 'No expiry' };

export default function Vault() {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', category: '' });
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString();
  const { data: docs, loading, refetch } = useFetch(`/vault?${qs}`, [qs]);
  const { data: categories } = useFetch('/vault/categories');
  const { data: expiring } = useFetch('/vault/expiring?days=60');
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Document Vault"
        subtitle="Centralized, secure repository for company documents with expiry tracking and versioning."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Add Document</button>}
      />

      {expiring?.length > 0 && (
        <Card className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{expiring.length} document(s) expired or expiring within 60 days</p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                {expiring.slice(0, 5).map((e) => `${e.title} (${fmtDate(e.expiry_date)})`).join(' · ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-4 !p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search documents…" value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          </div>
          <select className="input max-w-[220px]" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
            <option value="">All categories</option>
            {categories?.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </Card>

      <Card className="!p-0">
        {loading ? <Loading /> : !docs?.length ? (
          <EmptyState title="No documents stored yet" hint="Upload PAN, GST, ISO certificates, agreements and more." />
        ) : (
          <Table
            columns={[
              { header: 'Document' }, { header: 'Category' }, { header: 'Ref No.' }, { header: 'Version' },
              { header: 'Expiry' }, { header: 'Status' }, { header: '' },
            ]}
            rows={docs}
            renderRow={(d) => (
              <>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-100">{d.title}</div>
                      {d.tags?.length > 0 && <div className="text-xs text-slate-400">{d.tags.join(', ')}</div>}
                    </div>
                  </div>
                </td>
                <td className="td"><Badge tone="blue">{d.category}</Badge></td>
                <td className="td font-mono text-xs">{d.reference_no || '—'}</td>
                <td className="td">v{d.version}</td>
                <td className="td whitespace-nowrap">{fmtDate(d.expiry_date)}</td>
                <td className="td"><Badge tone={EXPIRY_TONE[d.expiry_status]}>{EXPIRY_LABEL[d.expiry_status]}</Badge></td>
                <td className="td text-right">
                  {d.document_id && (
                    <button className="btn-ghost !py-1 !px-2.5 !text-xs" onClick={() => download(`/documents/${d.document_id}/file`)}>
                      <FileDown size={12} /> Download
                    </button>
                  )}
                </td>
              </>
            )}
          />
        )}
      </Card>

      {open && <VaultModal categories={categories} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); refetch(); toast.success('Document stored'); }} />}
    </div>
  );
}

function VaultModal({ onClose, onSaved, categories }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', category: '', reference_no: '', description: '', tags: '', issue_date: '', expiry_date: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!file) return toast.error('Choose a file');
    if (!form.title) return toast.error('Title is required');
    if (!form.category) return toast.error('Category is required');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      await api.post('/vault', fd);
      onSaved();
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="Add Document to Vault"
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : 'Upload'}</button>
      </>}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title" required><input className="input" value={form.title} onChange={set('title')} /></Field>
        <Field label="Category" required>
          <select className="input" value={form.category} onChange={set('category')}>
            <option value="">Select category</option>
            {categories?.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Reference Number"><input className="input" value={form.reference_no} onChange={set('reference_no')} /></Field>
        <Field label="Tags" hint="Comma separated"><input className="input" value={form.tags} onChange={set('tags')} /></Field>
        <Field label="Issue Date"><input className="input" type="date" value={form.issue_date} onChange={set('issue_date')} /></Field>
        <Field label="Expiry Date"><input className="input" type="date" value={form.expiry_date} onChange={set('expiry_date')} /></Field>
      </div>
      <div className="mt-4">
        <Field label="Description"><textarea className="input min-h-[60px]" value={form.description} onChange={set('description')} /></Field>
      </div>
      <div className="mt-4">
        <Field label="File" required>
          <input className="input !py-2" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </Field>
      </div>
    </Modal>
  );
}
