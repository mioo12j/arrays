import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, FileDown, CheckCircle2, GitBranch, FolderPlus, ChevronDown } from 'lucide-react';
import { api, apiError, download } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../components/ui/Toast.jsx';
import { Card, Loading, Badge, Field } from '../components/ui/index.jsx';
import { inr } from '../lib/format.js';

const PROJECT_TYPES = [
  { v: 'residential', l: 'Residential' },
  { v: 'rooftop', l: 'Rooftop Solar' },
  { v: 'commercial', l: 'Commercial' },
  { v: 'industrial', l: 'Industrial' },
  { v: 'institutional', l: 'Institutional' },
  { v: 'government', l: 'Government' },
  { v: 'ground_mount', l: 'Ground Mount' },
  { v: 'utility', l: 'Utility-Scale' },
];

const RATE_FIELDS = [
  ['panel_wattage', 'Panel Wattage (Wp)'],
  ['panel_rate', 'Panel Rate (₹/module)'],
  ['inverter_rate_per_kw', 'Inverter (₹/kW)'],
  ['structure_rate_per_kw', 'Structure (₹/kW)'],
  ['cable_rate_per_kw', 'Cabling (₹/kW)'],
  ['earthing_rate_per_kw', 'Earthing (₹/kW)'],
  ['bos_rate_per_kw', 'Balance of System (₹/kW)'],
  ['civil_rate_per_kw', 'Civil (₹/kW)'],
  ['labour_rate_per_kw', 'Labour (₹/kW)'],
  ['transport_rate_per_kw', 'Transport (₹/kW)'],
  ['contingency_pct', 'Contingency (%)'],
  ['margin_pct', 'Margin (%)'],
  ['gst_pct', 'GST (%)'],
  ['tariff_per_kwh', 'Grid Tariff (₹/kWh)'],
  ['generation_per_kw_year', 'Generation (kWh/kW/yr)'],
  ['subsidy_amount', 'Subsidy override (₹)'],
];

const blankForm = {
  client_id: '', client_name: '', project_name: '', site_name: '',
  project_type: 'residential', capacity_kw: '5',
  location: '', valid_until: '', notes: '', terms: '', exclusions: '',
};

export default function QuoteBuilder() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const { data: clients } = useFetch('/clients');

  const [form, setForm] = useState(blankForm);
  const [rates, setRates] = useState({});
  const [calc, setCalc] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const debounceRef = useRef(null);

  // Load existing quote
  useEffect(() => {
    if (isNew) return;
    api.get(`/quotes/${id}`).then(({ data }) => {
      setQuote(data);
      setForm({
        client_id: data.client_id || '', client_name: data.client_name || '',
        project_name: data.project_name || '', site_name: data.site_name || '',
        project_type: data.project_type || 'rooftop', capacity_kw: String(data.capacity_kw || ''),
        location: data.location || '', valid_until: data.valid_until ? data.valid_until.slice(0, 10) : '',
        notes: data.notes || '', terms: data.terms || '', exclusions: data.exclusions || '',
      });
      setRates(data.inputs || {});
    }).catch((e) => toast.error(apiError(e))).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Live calculation (debounced)
  const recalc = useCallback((f, r) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.post('/quotes/calculate', {
          ...r, capacity_kw: Number(f.capacity_kw || 0), project_type: f.project_type,
        });
        setCalc(data);
      } catch { /* ignore transient */ }
    }, 300);
  }, []);

  useEffect(() => { recalc(form, rates); }, [form.capacity_kw, form.project_type, rates, recalc]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setRate = (k) => (e) => setRates((r) => ({ ...r, [k]: e.target.value === '' ? undefined : Number(e.target.value) }));

  const payload = () => ({
    ...rates,
    client_id: form.client_id || null,
    client_name: form.client_name || clients?.find((c) => c.id === form.client_id)?.name || null,
    project_name: form.project_name, site_name: form.site_name,
    project_type: form.project_type, capacity_kw: Number(form.capacity_kw || 0),
    location: form.location, valid_until: form.valid_until || null,
    notes: form.notes, terms: form.terms, exclusions: form.exclusions,
  });

  const save = async () => {
    if (!form.capacity_kw || Number(form.capacity_kw) <= 0) return toast.error('Enter a valid system size');
    setSaving(true);
    try {
      if (isNew) {
        const { data } = await api.post('/quotes', payload());
        toast.success(`Quotation ${data.quote_number} created`);
        navigate(`/quotes/${data.id}`);
      } else {
        const { data } = await api.patch(`/quotes/${id}`, payload());
        setQuote(data);
        toast.success('Quotation updated');
      }
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  const doAction = async (verb, label) => {
    try {
      const { data } = await api.post(`/quotes/${id}/${verb}`);
      toast.success(label);
      if (verb === 'convert') navigate(`/projects/${data.project.id}`);
      else if (verb === 'revise') navigate(`/quotes/${data.id}`);
      else setQuote(data);
    } catch (e) { toast.error(apiError(e)); }
  };

  if (loading) return <Loading />;
  const c = calc || {};

  return (
    <div>
      <button onClick={() => navigate('/quotes')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back to quotes
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isNew ? 'New Quotation' : quote?.quote_number}{quote?.version > 1 ? ` · Rev ${quote.version}` : ''}
          </h1>
          {quote && <div className="mt-1"><Badge status={quote.status} /></div>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} {isNew ? 'Create' : 'Save'}
          </button>
          {!isNew && (
            <>
              <button className="btn-ghost" onClick={() => download(`/quotes/${id}/pdf`)}><FileDown size={16} /> PDF</button>
              {quote?.status !== 'approved' && quote?.status !== 'converted' && (
                <button className="btn-ghost" onClick={() => doAction('approve', 'Quote approved')}><CheckCircle2 size={16} /> Approve</button>
              )}
              <button className="btn-ghost" onClick={() => doAction('revise', 'New revision created')}><GitBranch size={16} /> Revise</button>
              {quote?.status !== 'converted' && (
                <button className="btn-ghost" onClick={() => doAction('convert', 'Converted to project')}><FolderPlus size={16} /> Convert</button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Inputs */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Project Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Client">
                <select className="input" value={form.client_id} onChange={set('client_id')}>
                  <option value="">Select / free text</option>
                  {clients?.map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                </select>
              </Field>
              <Field label="Client Name (if not listed)"><input className="input" value={form.client_name} onChange={set('client_name')} /></Field>
              <Field label="Project Name"><input className="input" value={form.project_name} onChange={set('project_name')} /></Field>
              <Field label="Site Name"><input className="input" value={form.site_name} onChange={set('site_name')} /></Field>
              <Field label="Project Type">
                <select className="input" value={form.project_type} onChange={set('project_type')}>
                  {PROJECT_TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </Field>
              <Field label="System Size (kW)" required><input className="input" type="number" value={form.capacity_kw} onChange={set('capacity_kw')} /></Field>
              <Field label="Location"><input className="input" value={form.location} onChange={set('location')} /></Field>
              <Field label="Valid Until"><input className="input" type="date" value={form.valid_until} onChange={set('valid_until')} /></Field>
            </div>
          </Card>

          <Card>
            <button className="flex w-full items-center justify-between font-semibold text-slate-800 dark:text-slate-100" onClick={() => setShowRates((s) => !s)}>
              <span>Rate Assumptions</span>
              <ChevronDown size={18} className={`transition ${showRates ? 'rotate-180' : ''}`} />
            </button>
            {showRates && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {RATE_FIELDS.map(([k, label]) => (
                  <Field key={k} label={label}>
                    <input className="input" type="number" value={rates[k] ?? (c.inputs ? c.inputs[k] : '')} onChange={setRate(k)} placeholder={c.inputs ? String(c.inputs[k]) : ''} />
                  </Field>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Proposal Text</h3>
            <div className="space-y-3">
              <Field label="Technical Scope / Notes"><textarea className="input min-h-[60px]" value={form.notes} onChange={set('notes')} /></Field>
              <Field label="Commercial Terms (blank = standard)"><textarea className="input min-h-[50px]" value={form.terms} onChange={set('terms')} /></Field>
              <Field label="Exclusions (blank = standard)"><textarea className="input min-h-[50px]" value={form.exclusions} onChange={set('exclusions')} /></Field>
            </div>
          </Card>
        </div>

        {/* Live estimate */}
        <div className="lg:col-span-3">
          <Card className="!p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Live Estimate</h3>
              <span className="text-sm text-slate-400">{c.panel_count || 0} modules · {c.capacity_kw || 0} kW</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="th">Item</th><th className="th text-right">Qty</th>
                    <th className="th text-right">Rate</th><th className="th text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(c.line_items || []).map((li) => (
                    <tr key={li.item}>
                      <td className="td"><div className="font-medium text-slate-700 dark:text-slate-200">{li.item}</div><div className="text-xs text-slate-400">{li.note}</div></td>
                      <td className="td text-right">{li.qty} {li.unit}</td>
                      <td className="td text-right">{inr(li.rate)}</td>
                      <td className="td text-right font-medium">{inr(li.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-1.5 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
              {[
                ['Subtotal', c.subtotal], ['Contingency', c.contingency_amount],
                ['Margin', c.margin_amount], ['Taxable Value', c.taxable_amount], ['GST', c.gst_amount],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-slate-500">{l}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{inr(v)}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-white">
                <span className="font-semibold">Grand Total</span>
                <div className="text-right">
                  <div className="text-lg font-bold">{inr(c.total_amount)}</div>
                  <div className="text-xs text-brand-100">{c.per_watt ? `₹${c.per_watt}/W` : ''}</div>
                </div>
              </div>
              {Number(c.subsidy_amount) > 0 && (
                <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                  <div>
                    <div className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">Net after subsidy</div>
                    <div className="text-xs text-emerald-600">Subsidy {inr(c.subsidy_amount)}</div>
                  </div>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{inr(c.net_cost)}</span>
                </div>
              )}
            </div>
          </Card>

          {Number(c.annual_savings) > 0 && (
            <Card className="mt-4">
              <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Return on Investment</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Annual Savings', inr(c.annual_savings)],
                  ['Payback', `${c.payback_years} yrs`],
                  ['25-yr Savings', inr(c.lifetime_savings)],
                  ['Net Investment', inr(c.net_cost || c.total_amount)],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <div className="text-[11px] font-semibold uppercase text-slate-400">{l}</div>
                    <div className="mt-1 text-base font-bold text-brand-600 dark:text-brand-300">{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
