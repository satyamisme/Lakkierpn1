import React from 'react';
import { 
  ShoppingCart, 
  Smartphone, 
  Package, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Activity,
  History,
  Wrench,
  CreditCard,
  ClipboardCheck,
  Truck,
  BarChart3,
  Lock,
  Store,
  Clock,
  Wallet,
  UserCircle,
  PieChart,
  Settings2,
  FileText,
  Layers,
  Globe,
  RefreshCw,
  Megaphone,
  Trophy,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  id: number;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'POS Terminal',
    items: [
      { id: 1, label: 'Sales Terminal', icon: <ShoppingCart className="w-5 h-5" />, path: 'pos' },
      { id: 21, label: 'Sales History', icon: <History className="w-5 h-5" />, path: 'history' },
    ]
  },
  {
    label: 'Repair Hub',
    items: [
      { id: 61, label: 'Job Cards', icon: <Wrench className="w-5 h-5" />, path: 'repairs' },
      { id: 63, label: 'Bench Queue', icon: <Activity className="w-5 h-5" />, path: 'bench' },
      { id: 71, label: 'QC Terminal', icon: <ClipboardCheck className="w-5 h-5" />, path: 'qc' },
    ]
  },
  {
    label: 'Inventory',
    items: [
      { id: 31, label: 'Stock Matrix', icon: <Package className="w-5 h-5" />, path: 'inventory' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { id: 101, label: 'Finance Dashboard', icon: <Wallet className="w-5 h-5" />, path: 'finance' },
      { id: 193, label: 'Expenses', icon: <CreditCard className="w-5 h-5" />, path: 'expenses' },
    ]
  },
  {
    label: 'HR & Staff',
    items: [
      { id: 188, label: 'HR Dashboard', icon: <Users className="w-5 h-5" />, path: 'hr' },
      { id: 226, label: 'Shift Handover', icon: <Clock className="w-5 h-5" />, path: 'shift' },
    ]
  },
  {
    label: 'CRM & Loyalty',
    items: [
      { id: 256, label: 'Customer 360', icon: <UserCircle className="w-5 h-5" />, path: 'crm' },
      { id: 19, label: 'Loyalty Points', icon: <PieChart className="w-5 h-5" />, path: 'loyalty' },
    ]
  },
  {
    label: 'IoT & Mesh',
    items: [
      { id: 277, label: 'IoT Dashboard', icon: <Activity className="w-5 h-5" />, path: 'iot' },
    ]
  },
  {
    label: 'Logistics',
    items: [
      { id: 320, label: 'Warehouse', icon: <Package className="w-5 h-5" />, path: 'warehouse' },
      { id: 321, label: 'Suppliers', icon: <Truck className="w-5 h-5" />, path: 'suppliers' },
      { id: 322, label: 'Bulk Ops', icon: <Layers className="w-5 h-5" />, path: 'bulk' },
      { id: 323, label: 'Omnichannel', icon: <Globe className="w-5 h-5" />, path: 'omnichannel' },
      { id: 334, label: 'QC Terminal', icon: <ClipboardCheck className="w-5 h-5" />, path: 'qc-terminal' },
      { id: 335, label: 'Returns', icon: <RefreshCw className="w-5 h-5" />, path: 'returns' },
    ]
  },
  {
    label: 'Marketing & CRM',
    items: [
      { id: 338, label: 'Campaigns', icon: <Megaphone className="w-5 h-5" />, path: 'marketing' },
      { id: 336, label: 'Gift Cards', icon: <Wallet className="w-5 h-5" />, path: 'gift-cards' },
      { id: 337, label: 'Layaway', icon: <Clock className="w-5 h-5" />, path: 'layaway' },
      { id: 340, label: 'Customer Groups', icon: <Users className="w-5 h-5" />, path: 'customer-groups' },
      { id: 326, label: 'Customer Portal', icon: <UserCircle className="w-5 h-5" />, path: 'customer-portal' },
      { id: 327, label: 'IMEI Timeline', icon: <Smartphone className="w-5 h-5" />, path: 'imei-timeline' },
    ]
  },
  {
    label: 'Performance',
    items: [
      { id: 329, label: 'Leaderboard', icon: <Trophy className="w-5 h-5" />, path: 'performance' },
      { id: 330, label: 'Commissions', icon: <CreditCard className="w-5 h-5" />, path: 'commission' },
      { id: 332, label: 'Compliance', icon: <ShieldCheck className="w-5 h-5" />, path: 'compliance' },
      { id: 325, label: 'Hardware', icon: <Settings2 className="w-5 h-5" />, path: 'hardware' },
    ]
  },
  {
    label: 'Analytics',
    items: [
      { id: 294, label: 'Analytics Dashboard', icon: <BarChart3 className="w-5 h-5" />, path: 'analytics' },
      { id: 328, label: 'AI Intelligence', icon: <BrainCircuit className="w-5 h-5" />, path: 'intelligence' },
      { id: 181, label: 'Audit Logs', icon: <History className="w-5 h-5" />, path: 'logs' },
    ]
  },
  {
    label: 'Admin',
    items: [
      { id: 185, label: 'Feature Toggles', icon: <ShieldCheck className="w-5 h-5" />, path: 'toggles' },
      { id: 195, label: 'Role Manager', icon: <Lock className="w-5 h-5" />, path: 'roles' },
      { id: 199, label: 'Store Profile', icon: <Store className="w-5 h-5" />, path: 'profile' },
      { id: 232, label: 'System Health', icon: <Settings2 className="w-5 h-5" />, path: 'health' },
    ]
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, activeModule, onModuleChange }) => {
  const { hasPermission, user } = useAuth();

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasPermission(item.id))
  })).filter(group => group.items.length > 0);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="h-screen bg-card border-r border-border flex flex-col transition-colors duration-500 sticky top-0 z-50"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-foreground uppercase tracking-tighter text-xl leading-none">Lakki ERP</span>
              <span className="text-[8px] font-black text-primary uppercase tracking-widest mt-1">Enterprise Shell</span>
            </div>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto scrollbar-hide">
        {filteredGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onModuleChange(item.path)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative ${
                    activeModule === item.path 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <div className="group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60]">
                      {item.label}
                    </div>
                  )}
                  {!isCollapsed && (
                    <span className={`ml-auto text-[8px] font-black transition-opacity ${activeModule === item.path ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`}>ID {item.id}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className={`flex items-center gap-4 p-3 rounded-2xl bg-muted/50 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
            {user?.name?.substring(0, 2) || '??'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-black text-foreground truncate">{user?.name || 'Guest'}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{user?.role || 'No Role'}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
