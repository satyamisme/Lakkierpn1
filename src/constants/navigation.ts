import { 
  Shield, 
  LayoutDashboard, 
  ShoppingCart, 
  Wrench, 
  Package, 
  ShieldCheck, 
  Users, 
  PlusCircle,
  Lock,
  Globe,
  Zap,
  Sparkles,
  BarChart3,
  Database,
  Smartphone,
  CreditCard,
  Receipt,
  History,
  Settings,
  Bell,
  Truck,
  Layers,
  FileText,
  ClipboardCheck,
  Activity,
  UserCheck,
  Mail,
  MessageSquare,
  MapPin,
  RefreshCw,
  Scale,
  Camera,
  Languages,
  ArrowLeftRight
} from 'lucide-react';

export interface AtomicPage {
  id: string;
  label: string;
  featureIds: string[];
  description: string;
  path: string;
}

export interface NavCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
  pages: AtomicPage[];
}

export const ATOMIC_NAVIGATION: NavCategory[] = [
  {
    id: 'auth-user',
    label: 'Auth & Staff',
    icon: Lock,
    color: 'text-blue-500',
    pages: [
      { id: 'p1', label: 'My Profile', featureIds: [], description: 'Manage your security and settings', path: 'auth/profile' },
      { id: 'p2', label: 'Staff Directory', featureIds: ['195'], description: 'Manage personnel and hiring', path: 'staff' },
      { id: 'p3', label: 'Role Management', featureIds: ['195'], description: 'Granular permission matrix', path: 'auth/roles' },
      { id: 'p4', label: '2FA Setup', featureIds: ['303'], description: 'TOTP enrollment, backup codes', path: 'auth/2fa' },
      { id: 'p5', label: 'IP Whitelist', featureIds: ['186'], description: 'Restrict roles to IP ranges', path: 'auth/ip-whitelist' },
      { id: 'p6', label: 'Geofence Config', featureIds: ['187'], description: 'Store GPS radius restrictions', path: 'auth/geofence' },
      { id: 'p7', label: 'Password Policy', featureIds: ['189'], description: 'Expiry, complexity rules', path: 'auth/password-policy' },
      { id: 'p8', label: 'Bulk User Invite', featureIds: ['233'], description: 'Onboard multiple staff', path: 'auth/bulk-invite' },
    ]
  },
  {
    id: 'executive',
    label: 'Executive',
    icon: BarChart3,
    color: 'text-indigo-500',
    pages: [
      { id: 'p9', label: 'Revenue & Profit', featureIds: ['192', '293'], description: 'P&L, executive summary email', path: 'exec/revenue' },
      { id: 'p10', label: 'Store Comparison', featureIds: ['203'], description: 'Benchmark stores', path: 'exec/comparison' },
      { id: 'p11', label: 'Anomaly Detection', featureIds: ['244', '296'], description: 'Suspicious patterns, funnel analytics', path: 'exec/anomalies' },
      { id: 'p12', label: 'Product Affinity', featureIds: ['294', '297'], description: '“Bought together”, lost sales report', path: 'exec/affinity' },
      { id: 'p13', label: 'Read-Replica Routing', featureIds: ['342'], description: 'Cockpit query routing', path: 'exec/routing' },
      { id: 'p14', label: 'Request Coalescing', featureIds: ['343'], description: 'Batch identical API requests', path: 'exec/coalescing' },
    ]
  },
  {
    id: 'pos',
    label: 'POS Terminal',
    icon: ShoppingCart,
    color: 'text-green-500',
    pages: [
      { id: 'p15', label: 'Sale Terminal', featureIds: ['1', '3', '4', '2', '9', '5', '6', '7', '8'], description: 'Main transaction matrix with scanner, IMEI, and bundling logic', path: 'pos/grid' },
      { id: 'p20', label: 'Client 360', featureIds: ['10', '52', '53', '54', '55', '56', '58', '59'], description: 'Master customer directory and loyalty profiles', path: 'pos/customers' },
      { id: 'p26', label: 'Returns Hub', featureIds: ['17', '18', '21'], description: 'Process exchanges and item returns', path: 'pos/returns' },
      { id: 'p25', label: 'Sale Records', featureIds: ['15', '16', '48', '220'], description: 'History, re-prints, and daily reports', path: 'pos/receipts' },
      { id: 'p24', label: 'Gifts & Loyalty', featureIds: ['14', '23'], description: 'Card activation and point management', path: 'pos/loyalty' },
      { id: 'p27', label: 'Instalment Plan', featureIds: ['19', '22'], description: 'Layaway and credit plans', path: 'pos/layaway' },
      { id: 'p21', label: 'Terminal Setup', featureIds: ['11', '26', '185'], description: 'Managerial config for VAT and rounding', path: 'pos/tax' },
      { id: 'p28', label: 'Network Matrix', featureIds: ['31', '32', '33'], description: 'Edge sync monitor and offline queue', path: 'pos/sync' },
    ]
  },
  {
    id: 'repairs',
    label: 'Repair Hub',
    icon: Wrench,
    color: 'text-orange-500',
    pages: [
      { id: 'p29', label: 'Repair Center', featureIds: ['61', '64', '65', '66', '67', '68'], description: 'Unified repair pipeline, intake, and diagnostics hub', path: 'repairs' },
      { id: 'p30', label: 'Device Catalog', featureIds: ['62', '63', '114'], description: 'Device models, visual damage mapper, gallery', path: 'repairs' },
      { id: 'p31', label: 'Repair Photos', featureIds: ['88', '89'], description: 'Upload before/after, customer gallery', path: 'repairs' },
      { id: 'p32', label: 'Repair Payments', featureIds: ['90', '91', '92', '93', '310'], description: 'Deposit, balance, invoice, split', path: 'repairs/payments' },
      { id: 'p33', label: 'Status & Notify', featureIds: ['69', '70', '74', '75', '108'], description: 'Status tracking, WhatsApp/SMS, post-repair survey', path: 'repairs/status' },
      { id: 'p34', label: '20-Point QC', featureIds: ['71', '72', '73'], description: 'Checklist, failure reason, rework', path: 'repairs/qc' },
      { id: 'p35', label: 'Warranty Claims', featureIds: ['77', '78'], description: 'Store warranty, auto-create repair', path: 'repairs/warranty' },
      { id: 'p36', label: 'Parts Usage', featureIds: ['79', '80', '81', '118'], description: 'Part replacement log, deduction, restocking, serial tracking', path: 'repairs/parts' },
      { id: 'p37', label: 'Tech Assignment', featureIds: ['82', '83', '113', '292'], description: 'Manual/auto assign, queue view, rules', path: 'repairs/assignment' },
      { id: 'p38', label: 'Tech Performance', featureIds: ['84', '85', '105'], description: 'Metrics, labour commission', path: 'repairs/tech-stats' },
      { id: 'p39', label: 'Repair Notes', featureIds: ['86', '87'], description: 'Internal notes, customer-visible notes', path: 'repairs/notes' },
      { id: 'p40', label: 'Cancellation', featureIds: ['94', '119'], description: 'Cancellation flow, restock parts', path: 'repairs/cancel' },
      { id: 'p41', label: 'No-Show Alerts', featureIds: ['95', '96', '116'], description: 'Follow-up, expiry alert', path: 'repairs/alerts' },
      { id: 'p42', label: 'Device Archive', featureIds: ['97', '110'], description: 'Move old repairs', path: 'repairs/archive' },
      { id: 'p43', label: 'Category Mapping', featureIds: ['98', '99', '111', '112'], description: 'Custom categories, status colours', path: 'repairs/config' },
      { id: 'p44', label: 'Tech NFC Login', featureIds: ['101', '102'], description: 'NFC tap, parts backorder list', path: 'repairs/nfc' },
      { id: 'p45', label: 'IMEI Blacklist', featureIds: ['103', '104'], description: 'GSMA check, spare parts approval', path: 'repairs/blacklist' },
      { id: 'p46', label: 'ESD Checklist', featureIds: ['306', '323'], description: 'Pre-repair safety, certification tracker', path: 'repairs/esd' },
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    color: 'text-purple-500',
    pages: [
      { id: 'p47', label: 'Multi-Store Matrix', featureIds: ['121', '125', '142'], description: 'Global stock view, low stock dashboard, reorder alerts', path: 'inventory/matrix' },
      { id: 'p48', label: 'Store Transfer', featureIds: ['122', '123', '124', '137', '170', '171'], description: 'Request, approve, receive, bulk transfer', path: 'inventory/transfer' },
      { id: 'p49', label: 'Store Loan', featureIds: ['166', '324'], description: 'Loan with return date, auto-reminder', path: 'inventory/loan' },
      { id: 'p50', label: 'Transit Insurance', featureIds: ['152', '153', '179'], description: 'Insurance tag, driver QR scan', path: 'inventory/transit' },
      { id: 'p51', label: 'Purchase Orders', featureIds: ['126', '143', '144', '167'], description: 'PO, auto-replenish, lead time, order reminder', path: 'inventory/po' },
      { id: 'p52', label: 'PO Approval', featureIds: ['127', '129', '130'], description: 'Approval workflow, full/partial receipt', path: 'inventory/po-approval' },
      { id: 'p53', label: 'Landed Cost', featureIds: ['128', '308'], description: 'Add customs, shipping, insurance, HS code', path: 'inventory/landed-cost' },
      { id: 'p54', label: 'Supplier Manager', featureIds: ['131', '132', '151', '174'], description: 'Supplier details, credit, bank info', path: 'inventory/suppliers' },
      { id: 'p55', label: 'Supplier RMA', featureIds: ['133', '333'], description: 'Defective parts return, credit note', path: 'inventory/rma' },
      { id: 'p56', label: 'Stock Adjustment', featureIds: ['134', '136'], description: 'Increase/decrease, approval for negatives', path: 'inventory/adjustment' },
      { id: 'p57', label: 'Stock Valuation', featureIds: ['138', '139', '140', '141', '169', '172'], description: 'Valuation methods, reporting', path: 'inventory/valuation' },
      { id: 'p58', label: 'Stock Snapshot', featureIds: ['154', '180'], description: 'Export stock levels', path: 'inventory/snapshot' },
      { id: 'p59', label: 'Intake Buffer', featureIds: ['162', '163', '316', '336'], description: 'Scan-to-bucket, exceptions, post-scan reconciliation', path: 'inventory/intake' },
      { id: 'p60', label: 'IMEI Registration', featureIds: ['147', '148', '286', '337'], description: 'CSV upload, range generation', path: 'inventory/imei-reg' },
      { id: 'p61', label: 'Label Printing', featureIds: ['164', '338'], description: 'Raw ZPL pass-through, spooler', path: 'inventory/labels' },
      { id: 'p62', label: 'Cycle Count', featureIds: ['135', '158', '159', '160', '318'], description: 'Staff count (no expected qty), manager discrepancy', path: 'inventory/cycle-count' },
      { id: 'p63', label: 'Stock Recon', featureIds: ['168', '288'], description: 'System suggests fixes', path: 'inventory/recon' },
      { id: 'p64', label: 'Bin Locations', featureIds: ['155', '156', '157', '173'], description: 'UOM, shelf/rack, QR pick list', path: 'inventory/bins' },
      { id: 'p101', label: 'Serial Matrix', featureIds: ['192'], description: 'Global ID & Authenticity registry', path: 'inventory/serial-matrix' },
    ]
  },
  {
    id: 'governance',
    label: 'Governance',
    icon: ShieldCheck,
    color: 'text-slate-500',
    pages: [
      { id: 'p65', label: 'Audit Trail', featureIds: ['181', '182', '183', '215', '299'], description: 'View, filter, export, encryption, tamper-proof', path: 'gov/audit' },
      { id: 'p66', label: 'Anomaly Rules', featureIds: ['184', '205'], description: 'Configure rules, fraud detection', path: 'gov/anomalies' },
      { id: 'p67', label: 'Feature Toggles', featureIds: ['185'], description: 'Enable/disable any ID per role', path: 'gov/toggles' },
      { id: 'p68', label: 'Z/X Reports', featureIds: ['190', '191'], description: 'Daily close, mid-shift snapshot', path: 'gov/reports' },
      { id: 'p69', label: 'Expense Tracker', featureIds: ['193', '207'], description: 'Log expenses, receipt upload', path: 'gov/expenses' },
      { id: 'p70', label: 'VAT Export', featureIds: ['194'], description: 'Government-ready CSV', path: 'gov/vat' },
      { id: 'p71', label: 'Payroll Engine', featureIds: ['197'], description: 'Base + commission – penalties', path: 'gov/payroll' },
      { id: 'p72', label: 'Staff Score', featureIds: ['198'], description: 'Combined sales/repair metrics', path: 'gov/staff-score' },
      { id: 'p73', label: 'Store Management', featureIds: ['199'], description: 'Manage logos, addresses, and branch links', path: 'gov/profile' },
      { id: 'p74', label: 'Health Monitor', featureIds: ['200'], description: 'Latency, uptime', path: 'gov/health' },
      { id: 'p75', label: 'Auto-Backups', featureIds: ['201', '341'], description: 'Hot/warm/cold backup UI', path: 'gov/backups' },
      { id: 'p76', label: 'PITR Restore', featureIds: ['317'], description: 'Time-travel recovery', path: 'gov/restore' },
      { id: 'p77', label: 'Self-Heal DB', featureIds: ['340'], description: 'Orphaned records, repair', path: 'gov/self-heal' },
      { id: 'p78', label: 'Circuit Breaker', featureIds: ['319', '334'], description: 'Per-API trip, global kill switch', path: 'gov/circuit-breaker' },
      { id: 'p79', label: 'Sessions', featureIds: ['202', '335'], description: 'Remote logout, branch invalidation', path: 'gov/sessions' },
      { id: 'p80', label: 'Async Export', featureIds: ['339'], description: 'Background export, WhatsApp notification', path: 'gov/exports' },
    ]
  },
  {
    id: 'crm-omni',
    label: 'CRM & Omni',
    icon: Users,
    color: 'text-pink-500',
    pages: [
      { id: 'p81', label: 'Customer 360', featureIds: ['256', '252', '264', '267'], description: 'Full history, tiering, family links, CLV', path: 'crm/360' },
      { id: 'p82', label: 'Wishlist', featureIds: ['322'], description: 'Notify when item returns', path: 'crm/wishlist' },
      { id: 'p83', label: 'Blacklist', featureIds: ['257', '347'], description: 'Flag customers, freeze account', path: 'crm/blacklist' },
      { id: 'p84', label: 'WhatsApp Bot', featureIds: ['251', '74', '253', '254'], description: 'Templates, birthday bot, review solicitor', path: 'crm/whatsapp' },
      { id: 'p85', label: 'SMS Notify', featureIds: ['248'], description: 'Twilio integration', path: 'crm/sms' },
      { id: 'p86', label: 'Email Marketing', featureIds: ['249', '307'], description: 'Mailchimp/Klaviyo', path: 'crm/email' },
      { id: 'p87', label: 'Self-Service', featureIds: ['258'], description: 'Repair status lookup', path: 'crm/portal' },
      { id: 'p88', label: 'Waitlist', featureIds: ['262', '263'], description: 'Part arrival alert, unreleased phones', path: 'crm/waitlist' },
      { id: 'p89', label: 'Kiosk Mode', featureIds: ['280', '269'], description: 'Self-service UI, exit tablet', path: 'crm/kiosk' },
      { id: 'p90', label: 'IoT Devices', featureIds: ['275', '277', '278', '281', '282', '283', '284'], description: 'Scale, RFID, printer status, audio, signage, payment handshake, door sensor', path: 'crm/iot' },
      { id: 'p91', label: 'Mandoob Tracker', featureIds: ['255', '266'], description: 'Driver location, delivery routing', path: 'crm/mandoob' },
      { id: 'p92', label: 'Stock Sync', featureIds: ['241', '242', '243', '287'], description: 'BOPIS, e-commerce sync, webhooks', path: 'crm/sync' },
    ]
  },
  {
    id: 'extended',
    label: 'Extended',
    icon: Sparkles,
    color: 'text-amber-500',
    pages: [
      { id: 'p93', label: 'Trade-In & BNPL', featureIds: ['301', '302'], description: 'Phone trade-in, instalment payments', path: 'ext/trade-in' },
      { id: 'p94', label: 'Apple GSX', featureIds: ['304', '305'], description: 'Authorised repair, stolen device check', path: 'ext/gsx' },
      { id: 'p95', label: 'GDPR Consent', featureIds: ['309', '231'], description: 'Opt-in log, privacy tools', path: 'ext/gdpr' },
      { id: 'p96', label: 'Arabic & Accessibility', featureIds: ['311'], description: 'Multi-language, accessibility', path: 'ext/accessibility' },
      { id: 'p97', label: 'Supplier WhatsApp', featureIds: ['312'], description: 'Send PO via WhatsApp', path: 'ext/supplier-wa' },
      { id: 'p98', label: 'CCTV & Chat', featureIds: ['313', '314'], description: 'Security footage link, Apple/Google messages', path: 'ext/security' },
      { id: 'p99', label: 'Exchange Rates', featureIds: ['315'], description: 'Real-time KD rates', path: 'ext/rates' },
      { id: 'p100', label: 'Conflict UI', featureIds: ['329'], description: 'Manual conflict UI', path: 'ext/conflicts' },
    ]
  }
];
