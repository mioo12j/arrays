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

// All work rates are ₹ PER WATT (₹/W). e.g. ₹4/W on a 25 kWp system = ₹4 × 25,000.
const RATE_FIELDS = [
  ['panel_wattage', 'Panel Wattage (Wp)'],
  ['inverter_rate', 'Inverter (₹/W)'],
  ['structure_rate', 'Structure (₹/W)'],
  ['bos_rate', 'Cabling + Earthing + BOS (₹/W)'],
  ['civil_rate', 'Civil (₹/W)'],
  ['labour_rate', 'Installation & Commissioning (₹/W)'],
  ['gst_pct', 'GST (%)'],
  ['tariff_per_kwh', 'Grid Tariff (₹/unit)'],
  ['generation_per_kw_year', 'Annual Yield (kWh/kW/yr)'],
  ['subsidy_amount', 'Subsidy override (₹)'],
];

const blankForm = {
  client_id: '', client_name: '', project_name: '', site_name: '',
  project_type: 'residential', capacity_kw: '5',
  location: '', valid_until: '', notes: '', terms: '', exclusions: '',
  branch_id: '',
};

export default function QuoteBuilder() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const { data: clients } = useFetch('/clients');
  const { data: branches } = useFetch('/gst/branches');

  const [form, setForm] = useState(blankForm);
  const [rates, setRates] = useState({});
  const [calc, setCalc] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [pinputs, setPinputs] = useState({});
  const [docMenu, setDocMenu] = useState(false);
  const [useCustom, setUseCustom] = useState(false);
  const [customItems, setCustomItems] = useState([]);
  const [showTerms, setShowTerms] = useState(false);
  const debounceRef = useRef(null);
  const docMenuRef = useRef(null);

  // close the documents menu on outside click
  useEffect(() => {
    if (!docMenu) return;
    const onClick = (e) => { if (docMenuRef.current && !docMenuRef.current.contains(e.target)) setDocMenu(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [docMenu]);

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
        branch_id: data.branch_id || '',
      });
      setRates({
        ...(data.inputs || {}),
        panel_rate_basis: data.proposal_inputs?.panel_rate_basis || 'module',
        transport_included: data.proposal_inputs?.transport_included !== false,
      });
      setPinputs(data.proposal_inputs || {});
      setUseCustom(!!data.proposal_inputs?._custom_boq);
      setCustomItems((data.line_items || []).map((li) => ({
        description: li.item, qty: li.qty, unit: li.unit, rate: li.rate, note: li.note,
      })));
    }).catch((e) => toast.error(apiError(e))).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Live calculation (debounced)
  const recalc = useCallback((f, r, ci) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.post('/quotes/calculate', {
          ...r, capacity_kw: Number(f.capacity_kw || 0), project_type: f.project_type,
          custom_items: ci && ci.length ? ci : undefined,
        });
        setCalc(data);
      } catch { /* ignore transient */ }
    }, 300);
  }, []);

  useEffect(() => { recalc(form, rates, useCustom ? customItems : null); },
    [form.capacity_kw, form.project_type, rates, useCustom, customItems, recalc]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setRate = (k) => (e) => setRates((r) => ({ ...r, [k]: e.target.value === '' ? undefined : Number(e.target.value) }));
  const setPI = (k) => (e) => setPinputs((p) => ({ ...p, [k]: e.target.value === '' ? undefined : e.target.value }));

  // repeatable-row helpers for structured proposal_inputs (schedule, terms…)
  const piArr = (k) => (Array.isArray(pinputs[k]) ? pinputs[k] : []);
  const addRow = (k, blank) => setPinputs((p) => ({ ...p, [k]: [...(Array.isArray(p[k]) ? p[k] : []), blank] }));
  const updRow = (k, i, f, v) => setPinputs((p) => ({ ...p, [k]: (p[k] || []).map((r, j) => (j === i ? { ...r, [f]: v } : r)) }));
  const delRow = (k, i) => setPinputs((p) => ({ ...p, [k]: (p[k] || []).filter((_, j) => j !== i) }));

  const payload = () => ({
    ...rates,
    client_id: form.client_id || null,
    client_name: form.client_name || clients?.find((c) => c.id === form.client_id)?.name || null,
    project_name: form.project_name, site_name: form.site_name,
    project_type: form.project_type, capacity_kw: Number(form.capacity_kw || 0),
    location: form.location, valid_until: form.valid_until || null,
    notes: form.notes, terms: form.terms, exclusions: form.exclusions,
    branch_id: form.branch_id || null,
    custom_items: useCustom && customItems.length ? customItems : undefined,
    proposal_inputs: {
      ...pinputs, project_type: form.project_type, capacity_kw: Number(form.capacity_kw || 0),
      _custom_boq: useCustom,
      panel_rate_basis: rates.panel_rate_basis || 'module',
      transport_included: rates.transport_included !== false,
    },
  });

  // ---- custom BOQ line-item helpers ----
  const BOQ_UNITS = ['Nos', 'Set', 'Lot', 'Wp', 'kWp', 'RM', 'Mtr', 'Sqm', 'LS'];
  const updItem = (i, k, v) => setCustomItems((arr) => arr.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const addItem = () => setCustomItems((arr) => [...arr, { description: '', qty: 1, unit: 'Lot', rate: 0 }]);
  const delItem = (i) => setCustomItems((arr) => arr.filter((_, j) => j !== i));
  const toggleCustom = () => setUseCustom((on) => {
    if (!on && customItems.length === 0 && c.line_items) {
      setCustomItems(c.line_items.map((li) => ({ description: li.item, qty: li.qty, unit: li.unit, rate: li.rate, note: li.note })));
    }
    return !on;
  });
  const loadDefaults = () => {
    if (c.line_items) setCustomItems(c.line_items.map((li) => ({ description: li.item, qty: li.qty, unit: li.unit, rate: li.rate, note: li.note })));
  };

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
              <div className="relative" ref={docMenuRef}>
                <button className="btn-ghost" onClick={() => setDocMenu((v) => !v)}>
                  <FileDown size={16} /> Documents <ChevronDown size={14} />
                </button>
                {docMenu && (
                  <div className="absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    {[
                      { label: 'Complete Package', sub: 'Proposal + Quotation + BOQ + Scope', path: `/quotes/${id}/document.pdf`, star: true },
                      { label: 'Proposal (Brochure)', sub: 'Premium sales document', path: `/quotes/${id}/proposal.pdf` },
                      { label: 'Commercial Quotation', sub: 'Priced offer & terms', path: `/quotes/${id}/quotation.pdf` },
                      { label: 'Bill of Quantities', sub: 'Component-level breakdown', path: `/quotes/${id}/boq.pdf` },
                      { label: 'Scope of Work', sub: 'Our scope vs client scope', path: `/quotes/${id}/scope.pdf` },
                      { label: 'Proposal + Quotation', sub: 'Sales + pricing', path: `/quotes/${id}/document.pdf?parts=proposal,quotation` },
                      { label: 'Quotation + BOQ + Scope', sub: 'Full commercial set', path: `/quotes/${id}/document.pdf?parts=quotation,boq,scope` },
                      { label: 'Technical Quote (legacy)', sub: 'Original annexure PDF', path: `/quotes/${id}/pdf` },
                    ].map((d) => (
                      <button
                        key={d.label}
                        onClick={() => { setDocMenu(false); download(d.path); }}
                        className={`flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 ${d.star ? 'bg-brand-50/60 dark:bg-brand-900/20' : ''}`}
                      >
                        <span className={`text-sm font-semibold ${d.star ? 'text-brand-700 dark:text-brand-300' : 'text-slate-800 dark:text-slate-100'}`}>{d.label}</span>
                        <span className="text-xs text-slate-500">{d.sub}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Office &amp; Billing GST</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Select Office">
                  <select className="input" value={form.branch_id} onChange={(e) => setForm((f) => ({ ...f, branch_id: e.target.value }))}>
                    <option value="">— Select Office —</option>
                    {branches?.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} — {b.gstin}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Billing GSTIN">
                  <input className="input bg-slate-50 dark:bg-slate-800/60 cursor-default" readOnly value={branches?.find((b) => b.id === form.branch_id)?.gstin || ''} placeholder="Auto-filled from office" />
                </Field>
              </div>
              <p className="mt-1 text-xs text-slate-400">The selected office's GST and address appear on the quotation PDF header.</p>
            </div>
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
            <button className="flex w-full items-center justify-between font-semibold text-slate-800 dark:text-slate-100" onClick={() => setShowProposal((s) => !s)}>
              <span>Proposal Details <span className="ml-1 text-xs font-normal text-slate-400">— customises the proposal PDF</span></span>
              <ChevronDown size={18} className={`transition ${showProposal ? 'rotate-180' : ''}`} />
            </button>
            {showProposal && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label="Installation">
                  <select className="input" value={pinputs.install_type || ''} onChange={setPI('install_type')}>
                    <option value="">—</option><option>Rooftop</option><option>Ground-Mount</option><option>Solar Carport</option>
                  </select>
                </Field>
                <Field label="Grid Type">
                  <select className="input" value={pinputs.grid_type || ''} onChange={setPI('grid_type')}>
                    <option value="">—</option><option>On-Grid</option><option>Off-Grid</option><option>Hybrid</option>
                  </select>
                </Field>
                <Field label="Sector">
                  <select className="input" value={pinputs.sector || ''} onChange={setPI('sector')}>
                    <option value="">—</option><option>Private</option><option>Government</option><option>PSU</option>
                  </select>
                </Field>
                <Field label="Battery Backup">
                  <select className="input" value={pinputs.battery || ''} onChange={setPI('battery')}>
                    <option value="">—</option><option>No</option><option>Yes</option>
                  </select>
                </Field>
                <Field label="Net Metering">
                  <select className="input" value={pinputs.net_metering || ''} onChange={setPI('net_metering')}>
                    <option value="">—</option><option>Yes</option><option>No</option>
                  </select>
                </Field>
                <Field label="Monitoring">
                  <select className="input" value={pinputs.monitoring || ''} onChange={setPI('monitoring')}>
                    <option value="">—</option><option>Yes</option><option>No</option>
                  </select>
                </Field>
                <Field label="State"><input className="input" value={pinputs.state || ''} onChange={setPI('state')} /></Field>
                <Field label="DISCOM"><input className="input" value={pinputs.discom || ''} onChange={setPI('discom')} placeholder="e.g. WBSEDCL" /></Field>
                <Field label="Monthly Bill (₹)"><input className="input" type="number" value={pinputs.monthly_bill || ''} onChange={setPI('monthly_bill')} /></Field>
                <Field label="Structure Type"><input className="input" value={pinputs.structure_type || ''} onChange={setPI('structure_type')} placeholder="e.g. GI, elevated" /></Field>
                <Field label="Module Brand"><input className="input" value={pinputs.module_brand || ''} onChange={setPI('module_brand')} /></Field>
                <Field label="Inverter Brand"><input className="input" value={pinputs.inverter_brand || ''} onChange={setPI('inverter_brand')} /></Field>
                <Field label="Warranty"><input className="input" value={pinputs.warranty || ''} onChange={setPI('warranty')} placeholder="e.g. 25 yr modules" /></Field>
                <Field label="AMC / O&M"><input className="input" value={pinputs.amc || ''} onChange={setPI('amc')} placeholder="e.g. 5 yr" /></Field>
                <Field label="Timeline"><input className="input" value={pinputs.timeline || ''} onChange={setPI('timeline')} placeholder="e.g. 6–8 weeks" /></Field>
                <Field label="Subsidy"><input className="input" value={pinputs.subsidy || ''} onChange={setPI('subsidy')} placeholder="e.g. PM Surya Ghar" /></Field>
                <div className="col-span-2">
                  <Field label="Client Address (up to 5 lines)">
                    <textarea className="input min-h-[64px]" rows={3} value={pinputs.client_address || ''} onChange={setPI('client_address')} placeholder="One line per address line" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Special Requirements">
                    <textarea className="input min-h-[48px]" rows={2} value={pinputs.special_requirements || ''} onChange={setPI('special_requirements')} />
                  </Field>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <button className="flex w-full items-center justify-between font-semibold text-slate-800 dark:text-slate-100" onClick={() => setShowRates((s) => !s)}>
              <span>Rate Assumptions</span>
              <ChevronDown size={18} className={`transition ${showRates ? 'rotate-180' : ''}`} />
            </button>
            {showRates && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Panel Rate Basis">
                    <select className="input" value={rates.panel_rate_basis || 'module'} onChange={(e) => setRates((r) => ({ ...r, panel_rate_basis: e.target.value }))}>
                      <option value="module">Per module (₹/panel)</option>
                      <option value="watt">Per watt (₹/W)</option>
                    </select>
                  </Field>
                  {rates.panel_rate_basis === 'watt'
                    ? <Field label="Panel Rate (₹/W)"><input className="input" type="number" value={rates.panel_rate_per_watt ?? ''} onChange={setRate('panel_rate_per_watt')} placeholder="22" /></Field>
                    : <Field label="Panel Rate (₹/module)"><input className="input" type="number" value={rates.panel_rate ?? ''} onChange={setRate('panel_rate')} placeholder="11990" /></Field>}
                  <Field label="Extra Modules (%)"><input className="input" type="number" value={rates.extra_module_pct ?? ''} onChange={setRate('extra_module_pct')} placeholder="0" /></Field>
                  <Field label="Transportation">
                    <select className="input" value={rates.transport_included === false ? 'no' : 'yes'} onChange={(e) => setRates((r) => ({ ...r, transport_included: e.target.value === 'yes' }))}>
                      <option value="yes">Included in price</option>
                      <option value="no">Charged extra</option>
                    </select>
                  </Field>
                  {rates.transport_included === false && (
                    <Field label="Transport (₹/W)"><input className="input" type="number" value={rates.transport_rate ?? ''} onChange={setRate('transport_rate')} placeholder="0.5" /></Field>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {RATE_FIELDS.map(([k, label]) => (
                    <Field key={k} label={label}>
                      <input className="input" type="number" value={rates[k] ?? (c.inputs ? c.inputs[k] : '')} onChange={setRate(k)} placeholder={c.inputs ? String(c.inputs[k]) : ''} />
                    </Field>
                  ))}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">All work rates are ₹ <b>per watt</b> — e.g. ₹4/W on 25 kWp = ₹1,00,000. Modules bill per Nos; other work as a lump (Set/Lot). No hidden margin — your rates are the client price.</p>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Bill of Quantities</h3>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={useCustom} onChange={toggleCustom} /> Custom items
              </label>
            </div>
            {!useCustom ? (
              <p className="mt-2 text-xs text-slate-400">Auto-generated from the rates and system size. Enable <b>Custom items</b> to set your own description, quantity, unit and rate per line.</p>
            ) : (
              <div className="mt-3 space-y-2">
                <div className="flex gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <span className="flex-[5]">Description</span><span className="flex-[1.4] text-right">Qty</span>
                  <span className="flex-[1.6]">Unit</span><span className="flex-[2] text-right">Rate ₹</span><span className="w-4" />
                </div>
                {customItems.map((it, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input className="input flex-[5] !py-1.5 text-xs" placeholder="Item description" value={it.description || ''} onChange={(e) => updItem(i, 'description', e.target.value)} />
                    <input className="input flex-[1.4] !py-1.5 text-right text-xs" type="number" value={it.qty ?? ''} onChange={(e) => updItem(i, 'qty', e.target.value)} />
                    <select className="input flex-[1.6] !py-1.5 text-xs" value={it.unit || 'Lot'} onChange={(e) => updItem(i, 'unit', e.target.value)}>
                      {BOQ_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <input className="input flex-[2] !py-1.5 text-right text-xs" type="number" value={it.rate ?? ''} onChange={(e) => updItem(i, 'rate', e.target.value)} />
                    <button type="button" onClick={() => delItem(i)} className="px-1 text-slate-400 hover:text-red-500" title="Remove">×</button>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={addItem} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">+ Add item</button>
                  <button type="button" onClick={loadDefaults} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Load standard items</button>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Unit <b>Wp</b> = ₹ per watt (rate × system watts, e.g. ₹42 → 25 kWp = ₹10.5 L). <b>Lot / Set / Nos</b> = amount is Qty × Rate. Amounts are client-facing (include your margin); GST is added on top.
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Proposal Text</h3>
            <div className="space-y-3">
              <Field label="Technical Scope / Notes"><textarea className="input min-h-[60px]" value={form.notes} onChange={set('notes')} /></Field>
            </div>
          </Card>

          <Card>
            <button className="flex w-full items-center justify-between font-semibold text-slate-800 dark:text-slate-100" onClick={() => setShowTerms((s) => !s)}>
              <span>Commercial Terms & Company</span>
              <ChevronDown size={18} className={`transition ${showTerms ? 'rotate-180' : ''}`} />
            </button>
            {showTerms && (
              <div className="mt-4 space-y-5">
                <Field label="Commercial Offer description (blank = standard)">
                  <input className="input" value={pinputs.commercial_scope || ''} onChange={setPI('commercial_scope')} placeholder="Design, Engineering, Supply, Installation, Testing & Commissioning of …" />
                </Field>

                {/* Payment schedule */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Payment Schedule</span>
                    <button type="button" onClick={() => addRow('payment_schedule', { pct: '', stage: '', against: '' })} className="text-xs font-medium text-brand-600 hover:underline">+ Add milestone</button>
                  </div>
                  {piArr('payment_schedule').length === 0 && <p className="text-xs text-slate-400">Blank = standard 30% adv · 60% material readiness · 5% installation · 5% commissioning.</p>}
                  <div className="space-y-2">
                    {piArr('payment_schedule').map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <input className="input w-16 !py-1.5 text-xs" value={r.pct || ''} onChange={(e) => updRow('payment_schedule', i, 'pct', e.target.value)} placeholder="30%" />
                        <input className="input flex-[2] !py-1.5 text-xs" value={r.stage || ''} onChange={(e) => updRow('payment_schedule', i, 'stage', e.target.value)} placeholder="Stage" />
                        <input className="input flex-[3] !py-1.5 text-xs" value={r.against || ''} onChange={(e) => updRow('payment_schedule', i, 'against', e.target.value)} placeholder="Against / note" />
                        <button type="button" onClick={() => delRow('payment_schedule', i)} className="px-1 text-slate-400 hover:text-red-500">×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms & Conditions (title + body) */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Terms &amp; Conditions</span>
                    <button type="button" onClick={() => addRow('terms', { title: '', body: '' })} className="text-xs font-medium text-brand-600 hover:underline">+ Add term</button>
                  </div>
                  {piArr('terms').length === 0 && <p className="text-xs text-slate-400">Blank = standard PI-based terms. Add your own as Title + description.</p>}
                  <div className="space-y-2">
                    {piArr('terms').map((r, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <input className="input flex-1 !py-1.5 text-xs font-medium" value={r.title || ''} onChange={(e) => updRow('terms', i, 'title', e.target.value)} placeholder="Title (e.g. Payment)" />
                          <button type="button" onClick={() => delRow('terms', i)} className="px-1 text-slate-400 hover:text-red-500">×</button>
                        </div>
                        <textarea className="input mt-1.5 min-h-[44px] text-xs" value={r.body || ''} onChange={(e) => updRow('terms', i, 'body', e.target.value)} placeholder="Description — e.g. All payments strictly against Proforma Invoice; tax invoice after payment received." />
                      </div>
                    ))}
                  </div>
                </div>

                <Field label="Exclusions (one per line, blank = standard)">
                  <textarea className="input min-h-[50px] text-xs" value={pinputs.exclusions || ''} onChange={setPI('exclusions')} placeholder={'Anything not expressly listed under our scope is client scope, at actuals.\nDISCOM deposits & statutory fees at actuals.'} />
                </Field>
                <Field label="Scope of Supply & Services (one per line, blank = standard)">
                  <textarea className="input min-h-[60px] text-xs" value={pinputs.scope_supply || ''} onChange={setPI('scope_supply')} placeholder={'545 Wp Solar PV Modules – 46 Nos.\nSuitable String Inverter\nModule Mounting Structure…'} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Our Scope of Work (one per line)"><textarea className="input min-h-[60px] text-xs" value={pinputs.scope_ours || ''} onChange={setPI('scope_ours')} /></Field>
                  <Field label="Client Scope (one per line)"><textarea className="input min-h-[60px] text-xs" value={pinputs.scope_client || ''} onChange={setPI('scope_client')} /></Field>
                </div>

                {/* Company & bank details */}
                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Company &amp; Bank Details (last page)</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="GSTIN"><input className="input text-xs" value={pinputs.company_gstin || ''} onChange={setPI('company_gstin')} /></Field>
                    <Field label="PAN"><input className="input text-xs" value={pinputs.company_pan || ''} onChange={setPI('company_pan')} /></Field>
                    <Field label="Registered Address"><input className="input text-xs" value={pinputs.company_address || ''} onChange={setPI('company_address')} /></Field>
                    <Field label="Delay-payment interest"><input className="input text-xs" value={pinputs.delay_interest || ''} onChange={setPI('delay_interest')} placeholder="18% per annum" /></Field>
                    <Field label="Bank Name"><input className="input text-xs" value={pinputs.bank_name || ''} onChange={setPI('bank_name')} /></Field>
                    <Field label="Bank Branch"><input className="input text-xs" value={pinputs.bank_branch || ''} onChange={setPI('bank_branch')} /></Field>
                    <Field label="Account Name"><input className="input text-xs" value={pinputs.bank_account_name || ''} onChange={setPI('bank_account_name')} /></Field>
                    <Field label="Account No."><input className="input text-xs" value={pinputs.bank_account_no || ''} onChange={setPI('bank_account_no')} /></Field>
                    <Field label="IFSC"><input className="input text-xs" value={pinputs.bank_ifsc || ''} onChange={setPI('bank_ifsc')} /></Field>
                  </div>
                </div>
              </div>
            )}
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
              ].filter(([l, v]) => Number(v) > 0 || ['Subtotal', 'Taxable Value', 'GST'].includes(l)).map(([l, v]) => (
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
