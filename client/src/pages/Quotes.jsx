import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calculator } from 'lucide-react';
import { useFetch } from '../lib/useFetch.js';
import { Card, PageHeader, Loading, Table, Badge, EmptyState } from '../components/ui/index.jsx';
import { inr, fmtDate, titleCase } from '../lib/format.js';

const TYPE_LABEL = { rooftop: 'Rooftop', ground_mount: 'Ground Mount', industrial: 'Industrial', commercial: 'Commercial' };

export default function Quotes() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', status: '' });
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString();
  const { data: quotes, loading } = useFetch(`/quotes?${qs}`, [qs]);

  return (
    <div>
      <PageHeader
        title="Quotes & Estimation"
        subtitle="Prepare solar project quotations with full cost, margin and GST breakdown."
        actions={<button className="btn-primary" onClick={() => navigate('/quotes/new')}><Plus size={16} /> New Quotation</button>}
      />

      <Card className="mb-4 !p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search quote number or client…" value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          </div>
          <select className="input max-w-[180px]" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">Any status</option>
            {['draft', 'sent', 'approved', 'rejected', 'revised', 'converted', 'expired'].map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
          </select>
        </div>
      </Card>

      <Card className="!p-0">
        {loading ? <Loading /> : !quotes?.length ? (
          <EmptyState title="No quotations yet" hint="Create your first solar project quotation with the estimation calculator." />
        ) : (
          <Table
            columns={[
              { header: 'Quote #' }, { header: 'Client' }, { header: 'Type' }, { header: 'Size' },
              { header: 'Cost', align: 'right' }, { header: 'Margin', align: 'right' }, { header: 'Total', align: 'right' },
              { header: '₹/W' }, { header: 'Valid' }, { header: 'Status' },
            ]}
            rows={quotes}
            onRowClick={(q) => navigate(`/quotes/${q.id}`)}
            renderRow={(q) => (
              <>
                <td className="td font-semibold text-slate-800 dark:text-slate-100">{q.quote_number}{q.version > 1 ? ` · R${q.version}` : ''}</td>
                <td className="td">{q.client_full_name || q.client_name || '—'}</td>
                <td className="td">{TYPE_LABEL[q.project_type] || q.project_type}</td>
                <td className="td">{q.capacity_kw} kW</td>
                <td className="td text-right text-slate-500">{inr(q.cost_amount, { compact: true })}</td>
                <td className="td text-right text-emerald-600">{inr(q.margin_amount, { compact: true })}</td>
                <td className="td text-right font-semibold">{inr(q.total_amount, { compact: true })}</td>
                <td className="td">{q.per_watt ? `₹${q.per_watt}` : '—'}</td>
                <td className="td whitespace-nowrap">{fmtDate(q.valid_until)}</td>
                <td className="td"><Badge status={q.status} /></td>
              </>
            )}
          />
        )}
      </Card>
    </div>
  );
}
