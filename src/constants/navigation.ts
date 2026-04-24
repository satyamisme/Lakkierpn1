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
  ArrowLeftRight,
  UserPlus,
  BarChart,
  Cpu,
  Fingerprint,
  RotateCcw,
  Boxes,
  TruckIcon,
  Factory,
  FileSearch,
  AlertCircle
} from 'lucide-react';

export interface AtomicPage {
  id: string;
  label: string;
  featureIds: number[];
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
    id: 'auth-staff',
    label: 'Identity & Staff',
    icon: Lock,
    color: 'text-blue-500',
    pages: [
      { id: 'p1', label: 'My Profile', featureIds: [], description: 'Personal security and preferences', path: 'auth/profile' },
      { id: 'p2', label: 'Staff Directory', featureIds: [195], description: 'Manage personnel and hiring', path: 'staff' },
      { id: 'p3', label: 'Role Management', featureIds: [195], description: 'Granular permission matrix', path: 'auth/roles' },
      { id: 'p4', label: 'HR & Performance', featureIds: [197, 198], description: 'Staff metrics and HR dashboard', path: 'hr/dashboard' },
      { id: 'p5', label: '2FA Setup', featureIds: [303], description: 'TOTP enrollment and security', path: 'auth/2fa' },
      { id: 'p6', label: 'Password Policy', featureIds: [189], description: 'Expiry and complexity rules', path: 'auth/password-policy' },
      { id: 'p7', label: 'Bulk User Invite', featureIds: [233], description: 'Onboard multiple staff', path: 'auth/bulk-invite' },
      { id: 'p8', label: 'Security Config', featureIds: [186, 187], description: 'IP Whitelist and Geofencing', path: 'auth/security-config' },
    ]
  },
  {
    id: 'executive',
    label: 'Intelligence',
    icon: BarChart3,
    color: 'text-indigo-500',
    pages: [
      { id: 'p9', label: 'Executive Cockpit', featureIds: [192, 293], description: 'P&L and real-time revenue summary', path: 'exec/revenue' },
      { id: 'p10', label: 'Market Analytics', featureIds: [203, 241], description: 'Store comparisons and sales trends', path: 'exec/comparison' },
      { id: 'p11', label: 'Anomaly Engine', featureIds: [244, 296], description: 'Fraud detection and suspicious patterns', path: 'exec/anomalies' },
      { id: 'p12', label: 'Product Affinity', featureIds: [294, 297], description: 'Analysis of product basket items', path: 'exec/affinity' },
      { id: 'p13', label: 'Data Lake (Vault)', featureIds: [342], description: 'Raw transaction records and cold storage', path: 'intelligence/data-lake' },
      { id: 'p14', label: 'Architecture', featureIds: [343], description: 'Routing and request coalescing monitor', path: 'exec/infrastructure' },
    ]
  },
  {
    id: 'pos',
    label: 'POS Matrix',
    icon: ShoppingCart,
    color: 'text-green-400',
    pages: [
      { id: 'p15', label: 'Sale Terminal', featureIds: [1, 3, 4, 2, 9, 5, 6, 7, 8], description: 'Main transaction gateway with IMEI logic', path: 'pos/grid' },
      { id: 'p16', label: 'Sale Records', featureIds: [15, 16, 48, 220], description: 'Invoice history and re-prints', path: 'pos/receipts' },
      { id: 'p17', label: 'Client 360', featureIds: [10, 52, 53, 54, 55, 56, 58, 59], description: 'Unified customer profiles and history', path: 'crm/360' },
      { id: 'p18', label: 'Returns Hub', featureIds: [17, 18, 21], description: 'Exchanges and credit notes', path: 'pos/returns' },
      { id: 'p19', label: 'Gifts & Loyalty', featureIds: [14, 23], description: 'Card activation and point management', path: 'pos/loyalty' },
      { id: 'p20', label: 'Instalment Plan', featureIds: [19, 22], description: 'Layaway and credit schemes', path: 'pos/layaway' },
      { id: 'p21', label: 'Hardware Matrix', featureIds: [11, 12, 26], description: 'Manage printers, scanners, and vision', path: 'pos/hardware' },
      { id: 'p22', label: 'Terminal Setup', featureIds: [11, 185], description: 'VAT, rounding, and terminal config', path: 'pos/tax' },
      { id: 'p23', label: 'Network Matrix', featureIds: [31, 32, 33], description: 'Edge sync and offline queue state', path: 'pos/sync' },
    ]
  },
  {
    id: 'repairs',
    label: 'Repair Core',
    icon: Wrench,
    color: 'text-amber-500',
    pages: [
      { id: 'p24', label: 'Repair Pipeline', featureIds: [61, 64, 65, 66, 67, 68], description: 'Unified repair lifecycle management', path: 'repairs' },
      { id: 'p25', label: 'Intake Manifest', featureIds: [61, 114], description: 'New repair intake and damage mapping', path: 'repairs/intake' },
      { id: 'p26', label: 'Device Catalog', featureIds: [62, 63], description: 'Device models and visual damage mapper', path: 'repairs/catalog' },
      { id: 'p27', label: 'QC & Testing', featureIds: [71, 72, 73], description: '20-Point QC and failure analytics', path: 'repairs/qc' },
      { id: 'p28', label: 'Tech Performance', featureIds: [84, 85, 105], description: 'Labor metrics and technician stats', path: 'repairs/tech-stats' },
      { id: 'p29', label: 'Tech Assignment', featureIds: [82, 83, 113], description: 'Repair queue and assignment rules', path: 'repairs/assignment' },
      { id: 'p30', label: 'Parts Usage', featureIds: [79, 80, 81], description: 'Part replacement and serial tracking', path: 'repairs/parts' },
      { id: 'p31', label: 'Warranty Claims', featureIds: [77, 78], description: 'Store warranty and auto-repairs', path: 'repairs/warranty' },
      { id: 'p32', label: 'GSMA Blacklist', featureIds: [103, 104], description: 'IMEI verification and security check', path: 'repairs/blacklist' },
      { id: 'p33', label: 'ESD Checklist', featureIds: [306, 323], description: 'Safety and certification tracker', path: 'repairs/esd' },
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    color: 'text-purple-500',
    pages: [
      { id: 'p34', label: 'Global Matrix', featureIds: [121, 125, 142], description: 'Multi-store stock and reorder hub', path: 'inventory/matrix' },
      { id: 'p35', label: 'Warehouse Hub', featureIds: [155, 173], description: 'Large scale storage and logistics', path: 'inventory/warehouse' },
      { id: 'p36', label: 'Bin Locations', featureIds: [155, 156], description: 'Shelf tracking and QR pick lists', path: 'inventory/bins' },
      { id: 'p37', label: 'Transfer & Loan', featureIds: [122, 166, 324], description: 'Store transfers and item loans', path: 'inventory/transfer' },
      { id: 'p38', label: 'Purchase Orders', featureIds: [126, 143, 144], description: 'PO issuance and auto-replenish', path: 'inventory/purchase-orders' },
      { id: 'p39', label: 'PO Approval', featureIds: [127, 129, 130], description: 'Managerial PO verification flow', path: 'inventory/po-approval' },
      { id: 'p40', label: 'Landed Cost', featureIds: [128, 308], description: 'Logistics, duties, and HS codes', path: 'inventory/landed-cost' },
      { id: 'p41', label: 'Stock Valuation', featureIds: [138, 140, 169], description: 'Asset value and margin reporting', path: 'inventory/valuation' },
      { id: 'p42', label: 'Stock Adjust', featureIds: [134, 136], description: 'Positive/negative inventory corrections', path: 'inventory/adjust' },
      { id: 'p43', label: 'Cycle Count', featureIds: [135, 158, 159], description: 'Staff counts and manager recon', path: 'inventory/cycle-count' },
      { id: 'p44', label: 'Stock Recon', featureIds: [168, 288], description: 'Resolve physical vs digital anomalies', path: 'inventory/recon' },
      { id: 'p45', label: 'Serial Registry', featureIds: [147, 192, 286], description: 'IMEI, EID, and serial number matrix', path: 'inventory/serial-matrix' },
      { id: 'p46', label: 'Supplier Portal', featureIds: [131, 151, 174], description: 'Supplier credits and contact registry', path: 'inventory/suppliers' },
      { id: 'p47', label: 'Supplier RMA', featureIds: [133, 333], description: 'Defective batch returns and notes', path: 'inventory/rma' },
      { id: 'p48', label: 'Label Factory', featureIds: [164, 338], description: 'ZPL printing and spooler management', path: 'inventory/labels' },
      { id: 'p49', label: 'Stock Snapshot', featureIds: [154, 180], description: 'Point-in-time inventory export', path: 'inventory/snapshot' },
    ]
  },
  {
    id: 'governance',
    label: 'Governance',
    icon: ShieldCheck,
    color: 'text-slate-400',
    pages: [
      { id: 'p50', label: 'Audit Matrix', featureIds: [181, 183, 299], description: 'Tamper-proof interaction logging', path: 'gov/audit' },
      { id: 'p51', label: 'Feature Matrix', featureIds: [185], description: 'Kill-switches and feature toggles', path: 'gov/toggles' },
      { id: 'p52', label: 'Shift Handover', featureIds: [190, 191], description: 'Daily Z-Reports and register close', path: 'gov/reports' },
      { id: 'p53', label: 'Expense Matrix', featureIds: [193, 207], description: 'Petty cash and receipt logging', path: 'gov/expenses' },
      { id: 'p54', label: 'VAT & Tax Export', featureIds: [194], description: 'Compliance-ready fiscal data exports', path: 'gov/vat' },
      { id: 'p55', label: 'Payroll Engine', featureIds: [197], description: 'Automated commission and salary logic', path: 'gov/payroll' },
      { id: 'p56', label: 'Store Management', featureIds: [199], description: 'Branch profiles and operational hours', path: 'gov/profile' },
      { id: 'p57', label: 'Health Monitor', featureIds: [200, 334], description: 'System latency and service uptime', path: 'gov/health' },
      { id: 'p58', label: 'Asset Insurance', featureIds: [152, 179], description: 'Transit insurance and QR security', path: 'inventory/transit' },
      { id: 'p59', label: 'Z/X Reporting', featureIds: [191], description: 'Official fiscal closure records', path: 'gov/z-reports' },
    ]
  },
  {
    id: 'crm-omni',
    label: 'CRM & Omni',
    icon: Users,
    color: 'text-pink-500',
    pages: [
      { id: 'p60', label: 'Marketing Hub', featureIds: [256, 248, 249], description: 'Omni-channel marketing campaigns', path: 'crm/marketing' },
      { id: 'p61', label: 'WhatsApp Bot', featureIds: [251, 253, 254], description: 'Automated customer communications', path: 'crm/whatsapp' },
      { id: 'p62', label: 'Customer Portal', featureIds: [258], description: 'Retail self-service lookup portal', path: 'crm/portal' },
      { id: 'p63', label: 'Wishlist & Tier', featureIds: [264, 267, 322], description: 'VIP tiers and stock arrival alerts', path: 'crm/wishlist' },
      { id: 'p64', label: 'Omni Sync', featureIds: [241, 242, 287], description: 'E-commerce and physical stock sync', path: 'crm/sync' },
      { id: 'p65', label: 'IoT Matrix', featureIds: [275, 281, 284], description: 'Connected devices and RFID status', path: 'crm/iot' },
      { id: 'p66', label: 'Mandoob Tracker', featureIds: [255, 266], description: 'Logistics and delivery tracking', path: 'crm/mandoob' },
      { id: 'p67', label: 'GSMA Blacklist', featureIds: [257, 347], description: 'Fraudulent customer identification', path: 'crm/blacklist' },
    ]
  },
  {
    id: 'extended',
    label: 'Extended',
    icon: Sparkles,
    color: 'text-amber-400',
    pages: [
      { id: 'p68', label: 'Trade-In / BNPL', featureIds: [301, 302], description: 'Exchange logic and credit financing', path: 'ext/trade-in' },
      { id: 'p69', label: 'Apple GSX Core', featureIds: [304, 305], description: 'Authorised service and stolen checks', path: 'ext/gsx' },
      { id: 'p70', label: 'GDPR / Privacy', featureIds: [309, 231], description: 'Data consent and privacy protocols', path: 'ext/gdpr' },
      { id: 'p71', label: 'Locale Matrix', featureIds: [311], description: 'Multi-lingual and RTL configuration', path: 'ext/accessibility' },
      { id: 'p72', label: 'Currency Rates', featureIds: [315], description: 'Global exchange rate synchronization', path: 'ext/rates' },
      { id: 'p73', label: 'Conflict UI', featureIds: [329], description: 'Manual data conflict resolution', path: 'ext/conflicts' },
      { id: 'p74', label: 'Security (CCTV)', featureIds: [313], description: 'Station surveillance links', path: 'ext/security' },
    ]
  }
];

