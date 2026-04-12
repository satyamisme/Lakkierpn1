import React from 'react';
import { 
  ShoppingCart, 
  Smartphone, 
  Package, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Shield,
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
  BrainCircuit,
  Plus,
  Home
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
    label: 'Executive',
    items: [
      { id: 192, label: 'Executive Cockpit', icon: <BarChart3 className="w-5 h-5" />, path: 'cockpit' },
      { id: 256, label: 'CRM Matrix', icon: <UserCircle className="w-5 h-5" />, path: 'crm' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { id: 61, label: 'Deep-Tech Repair Hub', icon: <Wrench className="w-5 h-5" />, path: 'repairs' },
      { id: 31, label: 'Supply Chain Matrix', icon: <Package className="w-5 h-5" />, path: 'inventory' },
      { id: 318, label: 'Cycle Count (Staff)', icon: <ClipboardCheck className="w-5 h-5" />, path: 'cycle-count/staff' },
      { id: 318, label: 'Cycle Count (Manager)', icon: <ShieldCheck className="w-5 h-5" />, path: 'cycle-count/manager' },
    ]
  },
  {
    label: 'Logistics',
    items: [
      { id: 121, label: 'Global Warehouse', icon: <Layers className="w-5 h-5" />, path: 'warehouse' },
      { id: 122, label: 'Vendor Portal', icon: <Truck className="w-5 h-5" />, path: 'suppliers' },
      { id: 123, label: 'Bulk Processing', icon: <RefreshCw className="w-5 h-5" />, path: 'bulk' },
    ]
  },
  {
    label: 'Enterprise',
    items: [
      { id: 316, label: 'Enterprise Core', icon: <BrainCircuit className="w-5 h-5" />, path: 'enterprise' },
      { id: 181, label: 'Governance & Security', icon: <ShieldCheck className="w-5 h-5" />, path: 'governance' },
      { id: 185, label: 'Feature Gate Board', icon: <Lock className="w-5 h-5" />, path: 'toggles' },
    ]
  },
  {
    label: 'Extended',
    items: [
      { id: 301, label: 'Premium Features', icon: <Plus className="w-5 h-5" />, path: 'extended' },
      { id: 241, label: 'Omnichannel Hub', icon: <Globe className="w-5 h-5" />, path: 'omnichannel' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { id: 101, label: 'Finance Terminal', icon: <Wallet className="w-5 h-5" />, path: 'finance' },
    ]
  },
  {
    label: 'CRM & Loyalty',
    items: [
      { id: 188, label: 'Performance Analytics', icon: <Trophy className="w-5 h-5" />, path: 'performance' },
    ]
  },
  {
    label: 'Admin',
    items: [
      { id: 195, label: 'Staff Management', icon: <Users className="w-5 h-5" />, path: 'staff' },
      { id: 199, label: 'Access Control', icon: <Shield className="w-5 h-5" />, path: 'roles' },
      { id: 232, label: 'System Watchtower', icon: <Settings2 className="w-5 h-5" />, path: 'health' },
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
      <div className="p-8 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="bg-primary p-2.5 rounded-2xl text-primary-foreground shadow-2xl shadow-primary/40 rotate-3 group-hover:rotate-0 transition-transform">
              <Smartphone className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif italic text-2xl tracking-tighter text-foreground leading-none">Lakki ERP</span>
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mt-1.5 opacity-70">Enterprise Core</span>
            </div>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="p-3 hover:bg-surface-container rounded-2xl text-muted-foreground transition-all active:scale-90 border border-transparent hover:border-border"
        >
          {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
      </div>

      <nav className="flex-1 px-6 space-y-12 mt-8 overflow-y-auto no-scrollbar pb-10">
        {/* Quick Access / Home */}
        <div className="space-y-2">
          <button
            onClick={() => onModuleChange('pos')}
            className={`w-full flex items-center gap-5 p-4 rounded-[1.5rem] transition-all group relative border ${
              activeModule === 'pos' 
                ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 border-primary' 
                : 'text-muted-foreground hover:bg-primary/5 hover:text-primary border-transparent hover:border-primary/10'
            }`}
          >
            <div className={`transition-all duration-500 ${activeModule === 'pos' ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'}`}>
              <Home className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className={`font-black text-[11px] uppercase tracking-[0.15em] transition-all ${activeModule === 'pos' ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                Dashboard Home
              </span>
            )}
            {activeModule === 'pos' && (
              <motion.div 
                layoutId="active-pill"
                className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
              />
            )}
          </button>
        </div>

        {filteredGroups.map((group) => (
          <div key={group.label} className="space-y-6">
            {!isCollapsed && (
              <div className="flex items-center gap-4 px-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 whitespace-nowrap">
                  {group.label}
                </p>
                <div className="h-[1px] w-full bg-border opacity-20" />
              </div>
            )}
            <div className="space-y-2">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onModuleChange(item.path)}
                  className={`w-full flex items-center gap-5 p-4 rounded-[1.5rem] transition-all group relative border ${
                    activeModule === item.path 
                      ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 border-primary' 
                      : 'text-muted-foreground hover:bg-primary/5 hover:text-primary border-transparent hover:border-primary/10'
                  }`}
                >
                  <div className={`transition-all duration-500 ${activeModule === item.path ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'}`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className={`font-black text-[11px] uppercase tracking-[0.15em] transition-all ${activeModule === item.path ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                      {item.label}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-6 px-4 py-3 bg-foreground text-background text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] shadow-2xl">
                      {item.label}
                    </div>
                  )}
                  {!isCollapsed && (
                    <span className={`ml-auto text-[8px] font-mono font-black transition-opacity ${activeModule === item.path ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`}>#{item.id}</span>
                  )}
                  
                  {/* Active Indicator Dot */}
                  {activeModule === item.path && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-border bg-surface-container-lowest/50">
        <div className={`flex items-center gap-5 p-4 rounded-[2rem] bg-surface border border-border shadow-sm ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-12 h-12 rounded-2xl bg-muted overflow-hidden border-2 border-primary/10 flex items-center justify-center text-primary font-black uppercase shadow-inner">
            {user?.name ? (
              <img 
                src={`https://picsum.photos/seed/${user.name}/100/100`} 
                alt={user.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            ) : (
              '??'
            )}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-black text-foreground truncate tracking-tight">{user?.name || 'Guest'}</p>
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] truncate opacity-70">{user?.role || 'No Role'}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
