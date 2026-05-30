import {
  LayoutDashboard, FolderKanban, ArrowUpRight, ArrowDownLeft, FileText,
  Building2, Users, Banknote, ScrollText, BarChart3, ShieldCheck, UserCog,
  Calculator, Info, UserRound, DatabaseZap,
} from 'lucide-react';

// `adminOnly` hides the item from operators.
export const NAV = [
  { section: 'Overview', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  ]},
  { section: 'Operations', items: [
    { to: '/payments', label: 'Outgoing Payments', icon: ArrowUpRight },
    { to: '/receipts', label: 'Incoming Receipts', icon: ArrowDownLeft },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/reconciliation', label: 'Bank Reconciliation', icon: Banknote },
  ]},
  { section: 'Ledgers', items: [
    { to: '/vendors', label: 'Vendor Master', icon: Building2 },
    { to: '/employees', label: 'Employees', icon: UserRound },
    { to: '/clients', label: 'Clients', icon: Users },
  ]},
  { section: 'Sales & Delivery', items: [
    { to: '/quotes', label: 'Quotes & Estimation', icon: Calculator },
    { to: '/projects', label: 'Projects & Sites', icon: FolderKanban },
  ]},
  { section: 'Intelligence', items: [
    { to: '/reports', label: 'Reports & Exports', icon: BarChart3 },
    { to: '/audit', label: 'Audit Log', icon: ScrollText, adminOnly: true },
    { to: '/users', label: 'User Management', icon: UserCog, adminOnly: true },
    { to: '/system', label: 'Data Management', icon: DatabaseZap, editorOnly: true },
  ]},
  { section: 'Company', items: [
    { to: '/about', label: 'About', icon: Info },
  ]},
];

export { ShieldCheck };
