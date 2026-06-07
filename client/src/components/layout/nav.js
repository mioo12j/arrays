import {
  LayoutDashboard, FolderKanban, ArrowUpRight, ArrowDownLeft, FileText,
  Building2, Users, Banknote, ScrollText, BarChart3, ShieldCheck, UserCog,
  Calculator, Info, UserRound, DatabaseZap, HelpCircle, FileCheck2, Truck, ReceiptText,
  GitCompareArrows, Bell, Activity, HeartPulse, Building2 as BranchIcon, Hash,
  CalendarClock, DatabaseBackup, UploadCloud, Stethoscope, ClipboardCheck, Settings, Palette, Rss,
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
  { section: 'GST Compliance', items: [
    { to: '/gst', label: 'GST Dashboard', icon: FileCheck2, end: true },
    { to: '/gst/compliance', label: 'e-Invoice & E-Way Bill', icon: ReceiptText },
    { to: '/gst/reconciliation', label: 'Reconciliation', icon: GitCompareArrows },
    { to: '/gst/notifications', label: 'Alerts', icon: Bell },
    { to: '/gst/feed', label: 'Activity Feed', icon: Rss },
    { to: '/gst/activity', label: 'Activity Log', icon: Activity },
    { to: '/gst/health', label: 'API Health', icon: HeartPulse, adminOnly: true },
    { to: '/gst/branches', label: 'Branches & GSTINs', icon: BranchIcon, adminOnly: true },
    { to: '/gst/number-series', label: 'Number Series', icon: Hash, adminOnly: true },
    { to: '/gst/schedules', label: 'Scheduled Reports', icon: CalendarClock },
    { to: '/gst/import', label: 'Import Wizard', icon: UploadCloud, adminOnly: true },
    { to: '/gst/backup', label: 'Backup & Recovery', icon: DatabaseBackup, adminOnly: true },
    { to: '/gst/diagnostics', label: 'Diagnostics', icon: Stethoscope, adminOnly: true },
    { to: '/gst/readiness', label: 'Production Readiness', icon: ClipboardCheck, adminOnly: true },
    { to: '/gst/system', label: 'System Control', icon: Settings, adminOnly: true },
    { to: '/gst/branding', label: 'Branding', icon: Palette, adminOnly: true },
    { to: '/gst/reports', label: 'Compliance Reports', icon: BarChart3 },
  ]},
  { section: 'Intelligence', items: [
    { to: '/reports', label: 'Reports & Exports', icon: BarChart3 },
    { to: '/audit', label: 'Audit Log', icon: ScrollText, adminOnly: true },
    { to: '/users', label: 'User Management', icon: UserCog, adminOnly: true },
    { to: '/system', label: 'Data Management', icon: DatabaseZap },
  ]},
  { section: 'Company', items: [
    { to: '/help', label: 'Help & Guide', icon: HelpCircle },
    { to: '/about', label: 'About', icon: Info },
  ]},
];

export { ShieldCheck };
