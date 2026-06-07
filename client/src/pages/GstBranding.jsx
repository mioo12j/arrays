import { useState, useEffect, useRef } from 'react';
import { Palette, Upload, FileText, Truck, Loader2, Image } from 'lucide-react';
import { api, apiError } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../components/ui/Toast.jsx';
import { Card, PageHeader, Field } from '../components/ui/index.jsx';

export default function GstBranding() {
  const toast = useToast();
  const { data: branches } = useFetch('/gst/branches');
  const [branchId, setBranchId] = useState('');     // '' = company-level
  const { data: current, refetch } = useFetch(`/gst/branding${branchId ? `?branch_id=${branchId}` : ''}`, [branchId]);
  const [f, setF] = useState({});
  const [saving, setSaving] = useState(false);
  const logoRef = useRef(null); const sigRef = useRef(null); const stampRef = useRef(null);

  useEffect(() => { if (current) setF({ headerText: current.headerText || '', footerText: current.footerText || '', terms: current.terms || '', disclaimer: current.disclaimer || '', watermark: current.watermark || '', contactInfo: current.contactInfo || '', emailSignature: current.emailSignature || '', _assets: { logoFile: current.logoFile, signatureFile: current.signatureFile, stampFile: current.stampFile } }); }, [current]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const save = async () => {
    setSaving(true);
    try { await api.post('/gst/branding', { ...f, branchId: branchId || undefined }); toast.success('Branding saved'); refetch(); }
    catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };
  const uploadAsset = async (slot, file) => {
    if (!file) return;
    try { const fd = new FormData(); fd.append('file', file); fd.append('slot', slot); if (branchId) fd.append('branchId', branchId); await api.post('/gst/branding/asset', fd); toast.success(`${slot} uploaded`); refetch(); }
    catch (e) { toast.error(apiError(e)); }
  };
  const previewPdf = async (type) => {
    try {
      const { data } = await api.get(`/gst/branding/preview?type=${type}${branchId ? `&branch_id=${branchId}` : ''}`, { responseType: 'blob' });
      window.open(URL.createObjectURL(data), '_blank');
    } catch (e) { toast.error(apiError(e)); }
  };

  return (
    <div>
      <PageHeader title="Branding Manager" subtitle="Logos, signatures, stamps, headers, footers, terms and disclaimers — flow automatically into PDFs."
        actions={<>
          <button className="btn-ghost" onClick={() => previewPdf('einvoice')}><FileText size={16} /> Preview Invoice</button>
          <button className="btn-ghost" onClick={() => previewPdf('ewb')}><Truck size={16} /> Preview EWB</button>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : <Palette size={16} />} Save</button>
        </>} />

      <Card className="mb-4 !p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Apply to:</span>
          <select className="input max-w-[260px]" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">Company (all branches)</option>
            {(branches || []).map((b) => <option key={b.id} value={b.id}>{b.code} — {b.name}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[['logo', logoRef, 'logoFile'], ['signature', sigRef, 'signatureFile'], ['stamp', stampRef, 'stampFile']].map(([slot, ref, key]) => (
          <Card key={slot} className="!p-4 text-center">
            <p className="mb-2 text-sm font-semibold capitalize text-slate-700 dark:text-slate-200">{slot}</p>
            <div className="mb-2 flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
              {f._assets?.[key] ? <img src={`/uploads/${f._assets[key]}`} alt={slot} className="max-h-20" /> : <Image size={28} className="text-slate-300" />}
            </div>
            <button className="btn-ghost !text-sm" onClick={() => ref.current?.click()}><Upload size={14} /> Upload {slot}</button>
            <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => uploadAsset(slot, e.target.files?.[0])} />
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="PDF Header Text"><input className="input" value={f.headerText || ''} onChange={set('headerText')} /></Field>
          <Field label="Contact Info (header)"><input className="input" value={f.contactInfo || ''} onChange={set('contactInfo')} /></Field>
          <Field label="Watermark (faint, diagonal)"><input className="input" value={f.watermark || ''} onChange={set('watermark')} placeholder="e.g. ORIGINAL" /></Field>
          <Field label="PDF Footer Text"><input className="input" value={f.footerText || ''} onChange={set('footerText')} /></Field>
          <Field label="Terms & Conditions"><textarea className="input min-h-[70px]" value={f.terms || ''} onChange={set('terms')} /></Field>
          <Field label="Legal Disclaimer"><textarea className="input min-h-[70px]" value={f.disclaimer || ''} onChange={set('disclaimer')} /></Field>
          <Field label="Email Signature"><textarea className="input min-h-[70px]" value={f.emailSignature || ''} onChange={set('emailSignature')} /></Field>
        </div>
      </Card>
    </div>
  );
}
