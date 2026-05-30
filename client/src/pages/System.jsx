import { useState } from 'react';
import { DatabaseZap, Trash2, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { api, apiError } from '../api/client.js';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Card, PageHeader } from '../components/ui/index.jsx';

export default function System() {
  const toast = useToast();
  const [busy, setBusy] = useState('');
  const [confirm, setConfirm] = useState(null); // 'demo' | 'clear'
  const [typed, setTyped] = useState('');

  const run = async (kind) => {
    setBusy(kind);
    try {
      if (kind === 'demo') {
        const { data } = await api.post('/system/seed-demo');
        toast.success(`Demo data loaded — ${data.clients} clients, ${data.vendors} vendors, ${data.payments} payments, ${data.receipts} receipts…`);
      } else {
        await api.post('/system/clear-data');
        toast.success('All operational data cleared. The portal is now empty.');
      }
    } catch (e) { toast.error(apiError(e)); }
    finally { setBusy(''); setConfirm(null); setTyped(''); }
  };

  return (
    <div>
      <PageHeader
        title="Data Management"
        subtitle="Super-admin tools to load a demo dataset for showcasing, or wipe everything to go live."
      />

      <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/10">
        <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          These actions affect the <strong>entire portal</strong> and cannot be undone. User accounts are always preserved.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Load demo */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-900/30"><Sparkles size={22} /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">Load Demo Data</h3>
              <p className="mt-1 text-sm text-slate-500">
                Replaces current data with a realistic showcase: clients, vendors, employees, projects,
                invoices, payments, receipts and a quotation — so every feature has live data to demo.
              </p>
              <button className="btn-primary mt-4" onClick={() => setConfirm('demo')} disabled={!!busy}>
                {busy === 'demo' ? <Loader2 className="animate-spin" size={16} /> : <DatabaseZap size={16} />} Load Demo Data
              </button>
            </div>
          </div>
        </Card>

        {/* Clear all */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-50 p-3 text-red-600 dark:bg-red-900/30"><Trash2 size={22} /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">Clear All Data</h3>
              <p className="mt-1 text-sm text-slate-500">
                Permanently wipes every payment, receipt, invoice, ledger entry, vendor, client, employee,
                project, statement and quote. Use this when you're ready to go live with real data.
              </p>
              <button className="btn-danger mt-4" onClick={() => setConfirm('clear')} disabled={!!busy}>
                {busy === 'clear' ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />} Clear All Data
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation modal */}
      <Modal
        open={!!confirm}
        onClose={() => { setConfirm(null); setTyped(''); }}
        title={confirm === 'demo' ? 'Load demo data?' : 'Clear all data?'}
        size="sm"
        footer={
          <>
            <button className="btn-ghost" onClick={() => { setConfirm(null); setTyped(''); }}>Cancel</button>
            {confirm === 'demo' ? (
              <button className="btn-primary" onClick={() => run('demo')} disabled={busy === 'demo'}>
                {busy === 'demo' ? <Loader2 className="animate-spin" size={16} /> : 'Load Demo Data'}
              </button>
            ) : (
              <button className="btn-danger" onClick={() => run('clear')} disabled={typed !== 'CLEAR' || busy === 'clear'}>
                {busy === 'clear' ? <Loader2 className="animate-spin" size={16} /> : 'Permanently Clear'}
              </button>
            )}
          </>
        }
      >
        {confirm === 'demo' ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This will <strong>replace all current data</strong> with the demo dataset. User accounts stay intact. Continue?
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This permanently deletes <strong>all operational data</strong> in the portal. This cannot be undone.
            </p>
            <p className="text-sm text-slate-500">Type <strong>CLEAR</strong> to confirm:</p>
            <input className="input" value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} placeholder="CLEAR" />
          </div>
        )}
      </Modal>
    </div>
  );
}
