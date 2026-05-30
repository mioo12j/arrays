import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, FileDown, MapPin } from 'lucide-react';
import { api, apiError, download } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, Loading, Badge, Table, Field } from '../components/ui/index.jsx';
import { inr, fmtDate } from '../lib/format.js';

export default function ProjectDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { data: project, loading, refetch } = useFetch(`/projects/${id}`);
  const [open, setOpen] = useState(false);

  if (loading) return <Loading />;
  if (!project) return null;

  const margin = Number(project.gross_margin || 0);

  return (
    <div>
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back to projects
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
            <Badge status={project.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{project.client_full_name || project.client_name || 'No client'}{project.location ? ` · ${project.location}` : ''}{project.capacity_kw ? ` · ${project.capacity_kw} kW` : ''}</p>
        </div>
        <button className="btn-ghost" onClick={() => download('/reports/projects?format=xlsx')}><FileDown size={16} /> Profitability Report</button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card><p className="text-xs font-semibold uppercase text-slate-400">Contract</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{inr(project.contract_value, { compact: true })}</p></Card>
        <Card><p className="text-xs font-semibold uppercase text-slate-400">Budget</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{inr(project.budget, { compact: true })}</p></Card>
        <Card><p className="text-xs font-semibold uppercase text-slate-400">Spent</p><p className="mt-1 text-xl font-bold text-red-600">{inr(project.total_spent, { compact: true })}</p></Card>
        <Card><p className="text-xs font-semibold uppercase text-slate-400">Received</p><p className="mt-1 text-xl font-bold text-emerald-600">{inr(project.total_received, { compact: true })}</p></Card>
        <Card><p className="text-xs font-semibold uppercase text-slate-400">Gross Margin</p><p className={`mt-1 text-xl font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{inr(margin, { compact: true })}</p></Card>
      </div>

      <Card className="!p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Sites</h3>
          <button className="btn-primary !py-1.5 !text-xs" onClick={() => setOpen(true)}><Plus size={14} /> Add Site</button>
        </div>
        <Table
          columns={[{ header: 'Site' }, { header: 'Location' }, { header: 'Budget', align: 'right' }, { header: 'Spent', align: 'right' }, { header: 'Status' }]}
          rows={project.sites || []}
          empty="No sites added yet."
          renderRow={(s) => (
            <>
              <td className="td font-medium text-slate-800 dark:text-slate-100">{s.name}</td>
              <td className="td">{s.latitude && s.longitude ? <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-slate-400" />{s.location || `${s.latitude}, ${s.longitude}`}</span> : s.location || '—'}</td>
              <td className="td text-right">{inr(s.budget)}</td>
              <td className="td text-right font-semibold text-red-600">{inr(s.site_spent)}</td>
              <td className="td"><Badge status={s.status} /></td>
            </>
          )}
        />
      </Card>

      {open && <SiteModal projectId={id} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); refetch(); toast.success('Site added'); }} />}
    </div>
  );
}

function SiteModal({ projectId, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', code: '', location: '', latitude: '', longitude: '', budget: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim()) return toast.error('Site name is required');
    setSaving(true);
    try {
      await api.post(`/projects/${projectId}/sites`, {
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        budget: Number(form.budget || 0),
      });
      onSaved();
    } catch (err) { toast.error(apiError(err)); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="Add Site"
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : 'Add Site'}</button>
      </>}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Site Name" required><input className="input" value={form.name} onChange={set('name')} /></Field>
        <Field label="Site Code"><input className="input" value={form.code} onChange={set('code')} /></Field>
        <Field label="Location"><input className="input" value={form.location} onChange={set('location')} /></Field>
        <Field label="Budget"><input className="input" type="number" step="0.01" value={form.budget} onChange={set('budget')} /></Field>
        <Field label="Latitude"><input className="input" value={form.latitude} onChange={set('latitude')} /></Field>
        <Field label="Longitude"><input className="input" value={form.longitude} onChange={set('longitude')} /></Field>
      </div>
    </Modal>
  );
}
