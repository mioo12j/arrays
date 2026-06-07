import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut, ChevronDown, ShieldCheck, UserCircle2, Languages, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useBranch } from '../../context/BranchContext.jsx';
import GlobalSearch from '../gst/GlobalSearch.jsx';

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('epc_theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('epc_theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark((d) => !d)];
}

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const { lang, toggle: toggleLang } = useI18n();
  const { branches, branchId, setBranchId } = useBranch();
  const location = useLocation();
  const onGst = location.pathname.startsWith('/gst');
  const [dark, toggleDark] = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
        <Menu size={20} />
      </button>

      <div className="hidden flex-1 items-center sm:flex">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        {onGst && branches.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900" data-no-i18n>
            <Building size={15} className="text-slate-400" />
            <select className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none dark:text-slate-200" value={branchId} onChange={(e) => setBranchId(e.target.value)} title="Active branch / GSTIN">
              <option value="all">All branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.code} — {b.name}</option>)}
            </select>
          </div>
        )}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Switch language"
          data-no-i18n
        >
          <Languages size={18} />
          <span>{lang === 'hi' ? 'हिं' : 'EN'}</span>
        </button>
        <button
          onClick={toggleDark}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Toggle theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
              <p className="flex items-center gap-1 text-[11px] capitalize text-slate-400">
                {user?.role === 'admin' && <ShieldCheck size={11} />} {user?.role}
              </p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {menuOpen && (
            <div className="animate-fade-in absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <UserCircle2 size={16} /> {user?.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
