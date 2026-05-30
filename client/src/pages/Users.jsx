import { useState } from 'react';
import { Plus, Loader2, ShieldCheck, User } from 'lucide-react';
import { api, apiError } from '../api/client.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../components/ui/Toast.jsx';
import Modal from '../components/ui/Modal.jsx';
import { PageHeader, Card, Loading, Table, Badge, Field } from '../components/ui/index.jsx';
import { fmtDateTime } from '../lib/format.js';

export default function Users() {
  const toast = useToast();
  const { data: users, loading, refetch } = useFetch('/users');
  const [open, setOpen] = useState(false);

  const toggleActive = async (u) => {
    try {
      await api.patch(`/users/${u.id}`, { is_active: !u.is_active });
      refetch();
      toast.success(`User ${u.is_active ? 'disabled' : 'enabled'}`);
    } catch (err) { toast.error(apiError(err)); }
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage Admin and Operator accounts."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New User</button>} />

      <Card className="!p-0">
        {loading ? <Loading /> : (
          <Table
            columns={[{ header: 'Name' }, { header: 'Email' }, { header: 'Role' }, { header: 'Status' }, { header: 'Last Login' }, { header: '' }]}
            rows={users || []}
            empty="No users."
            renderRow={(u) => (
              <>
                <td className="td font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  {u.role === 'admin' ? <ShieldCheck size={15} className="text-brand-500" /> : <User size={15} className="text-slate-400" />}
                  {u.name}
                </td>
                <td className="td">{u.email}</td>
                <td className="td"><Badge tone={u.role === 'admin' ? 'blue' : 'slate'}>{u.role}</Badge></td>
                <td className="td"><Badge tone={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Disabled'}</Badge></td>
                <td className="td text-slate-500">{u.last_login_at ? fmtDateTime(u.last_login_at) : 'Never'}</td>
                <td className="td text-right">
                  <button className="btn-ghost !py-1 !px-2.5 !text-xs" onClick={() => toggleActive(u)}>
                    {u.is_active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </>
            )}
          />
        )}
      </Card>

      {open && <UserModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); refetch(); toast.success('User created'); }} />}
    </div>
  );
}

function UserModal({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operator' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('All fields are required');
    setSaving(true);
    try {
      await api.post('/users', form);
      onSaved();
    } catch (err) { toast.error(apiError(err)); } finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="New User"
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : 'Create User'}</button>
      </>}>
      <div className="space-y-4">
        <Field label="Full Name" required><input className="input" value={form.name} onChange={set('name')} /></Field>
        <Field label="Email" required><input className="input" type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Password" required hint="Minimum 6 characters"><input className="input" type="password" value={form.password} onChange={set('password')} /></Field>
        <Field label="Role" required>
          <select className="input" value={form.role} onChange={set('role')}>
            <option value="operator">Operator</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}
