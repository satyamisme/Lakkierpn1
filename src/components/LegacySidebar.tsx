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
  Home,
  Boxes,
  Puzzle,
  Sparkles,
  Scan,
  RotateCcw,
  ShieldAlert,
  Key,
  AlertTriangle,
  Database,
  DatabaseBackup,
  Zap,
  DollarSign,
  AlertCircle,
  Printer,
  LayoutGrid,
  Gauge,
  Banknote
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Gate } from './PermissionGuard';
import { toast } from 'sonner';

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

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  path: string;
  isCollapsed: boolean;
  activeModule: string;
  onModuleChange: (module: string) => void;
  id?: number;
  guard?: string;
  onClick?: () => void;
}> = ({ icon, label, path, isCollapsed, activeModule, onModuleChange, id, guard, onClick }) => {
  const { hasPermission } = useAuth();
  
  const isAllowed = React.useMemo(() => {
    if (id !== undefined) return hasPermission(id);
    if (!guard) return true;
    return guard.split(',').some(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          if (hasPermission(i)) return true;
        }
        return false;
      }
      return hasPermission(Number(part));
    });
  }, [id, guard, hasPermission]);

  if (!isAllowed) return null;

  return (
    <button
      onClick={onClick || (() => onModuleChange(path))}
      className={`w-full flex items-center gap-5 p-4 rounded-[1.5rem] transition-all group relative border ${
        activeModule === path 
          ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 border-primary' 
          : 'text-muted-foreground hover:bg-primary/5 hover:text-primary border-transparent hover:border-primary/10'
      }`}
    >
      <div className={`transition-all duration-500 ${activeModule === path ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'}`}>
        {icon}
      </div>
      {!isCollapsed && (
        <span className={`font-black text-[11px] uppercase tracking-[0.15em] transition-all ${activeModule === path ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
          {label}
        </span>
      )}
      {isCollapsed && (
        <div className="absolute left-full ml-6 px-4 py-3 bg-foreground text-background text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] shadow-2xl">
          {label}
        </div>
      )}
      {!isCollapsed && (
        <span className={`ml-auto text-[8px] font-mono font-black transition-opacity ${activeModule === path ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}`}>#{id || guard}</span>
      )}
      {activeModule === path && (
        <motion.div 
          layoutId="active-pill"
          className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
        />
      )}
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, activeModule, onModuleChange }) => {
  const { hasPermission, user } = useAuth();

  const domains = [
    { id: 'pos', icon: <ShoppingCart className="w-5 h-5" />, label: 'Sales', guard: '1-60' },
    { id: 'repairs', icon: <Wrench className="w-5 h-5" />, label: 'Repairs', guard: '61-120' },
    { id: 'inventory', icon: <Boxes className="w-5 h-5" />, label: 'Inventory', guard: '121-180' },
    { id: 'governance', icon: <Shield className="w-5 h-5" />, label: 'Governance', guard: '181-240' },
    { id: 'crm', icon: <Users className="w-5 h-5" />, label: 'CRM', guard: '241-300' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '100px' : '380px' }}
      className="h-screen bg-surface-container-lowest border-r border-border flex flex-col transition-all duration-500 sticky top-0 z-50 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-8 flex items-center justify-between border-b border-border bg-surface-container-lowest/50">
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

      {/* Domain Quick Switch (ID 184) */}
      <div className="px-6 py-6 border-b border-border bg-muted/5">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col' : 'justify-between'}`}>
          {domains.map((domain) => (
            <Gate key={domain.id} id={Number(domain.guard.split('-')[0])}>
              <button
                onClick={() => onModuleChange(domain.id)}
                className={`p-3.5 rounded-2xl transition-all relative group border ${
                  activeModule.startsWith(domain.id) 
                    ? 'bg-primary text-primary-foreground shadow-xl border-primary' 
                    : 'hover:bg-primary/5 text-muted-foreground hover:text-primary border-transparent hover:border-primary/10'
                }`}
              >
                {domain.icon}
                {!isCollapsed && (
                  <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[60] shadow-2xl">
                    {domain.label}
                  </span>
                )}
              </button>
            </Gate>
          ))}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-6 space-y-10 mt-8 overflow-y-auto no-scrollbar pb-10">
        {/* Section: Core Operations */}
        <div className="space-y-4">
          {!isCollapsed && (
            <div className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">Core Operations</div>
          )}
          <div className="space-y-2">
            <SidebarItem icon={<Home className="w-5 h-5" />} label="Command Center" path="command-center" isCollapsed={isCollapsed} activeModule={activeModule} onModuleChange={onModuleChange} id={1} />
            <SidebarItem icon={<Gauge className="w-5 h-5" />} label="Executive Cockpit" path="cockpit" isCollapsed={isCollapsed} activeModule={activeModule} onModuleChange={onModuleChange} id={192} />
            <SidebarItem icon={<LayoutGrid className="w-5 h-5" />} label="Feature Universe" path="features" isCollapsed={isCollapsed} activeModule={activeModule} onModuleChange={onModuleChange} id={301} />
          </div>
        </div>

        {/* Section: Business Domains */}
        <div className="space-y-4">
          {!isCollapsed && (
            <div className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">Business Domains</div>
          )}
          <div className="space-y-2">
            <SidebarItem icon={<ShoppingCart className="w-5 h-5" />} label="Sales & POS" path="pos" guard="1-60" isCollapsed={isCollapsed} activeModule={activeModule} onModuleChange={onModuleChange} />
            <SidebarItem icon={<Wrench className="w-5 h-5" />} label="Repair Hub" path="repairs" guard="61-120" isCollapsed={isCollapsed} activeModule={activeModule} onModuleChange={onModuleChange} />
            <SidebarItem icon={<Boxes className="w-5 h-5" />} label="Inventory & Supply" path="inventory" guard="121-180" isCollapsed={isCollapsed} activeModule={activeModule} onModuleChange={onModuleChange} />
            <SidebarItem icon={<Users className="w-5 h-5" />} label="CRM & Omnichannel" path="crm" guard="241-300" isCollapsed={isCollapsed} activeModule={activeModule} onModuleChange={onModuleChange} />
          </div>
        </div>

        {/* Section: Governance & Enterprise */}
        <div className="space-y-4">
          {!isCollapsed && (
            <div className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">Governance & Enterprise</div>
          )}
          <div className="space-y-2">
            <SidebarItem icon={<ShieldCheck className="w-5 h-5" />} label="Security & Governance" path="governance" guard="181-240" isCollapsed={isCollapsed} activeModule={activeModule} onModuleChange={onModuleChange} />
            <SidebarItem icon={<BrainCircuit className="w-5 h-5" />} label="Enterprise Core" path="enterprise" guard="316-350" isCollapsed={isCollapsed} activeModule={activeModule} onModuleChange={onModuleChange} />
            <SidebarItem icon={<Settings2 className="w-5 h-5" />} label="System Settings" path="health" isCollapsed={isCollapsed} activeModule={activeModule} onModuleChange={onModuleChange} id={232} />
          </div>
        </div>

        {/* Section: Quick Tools (ID 316-350) */}
        {!isCollapsed && (
          <div className="mt-10 px-4">
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Enterprise Tools
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[316, 317, 318, 319, 329, 330, 334, 338, 340, 341, 349, 350].map(id => (
                  <Gate key={id} id={id}>
                    <button 
                      onClick={() => onModuleChange('enterprise')}
                      className="p-2 bg-background border border-border rounded-xl text-[8px] font-black text-muted-foreground hover:text-primary hover:border-primary/30 transition-all uppercase tracking-widest"
                    >
                      ID {id}
                    </button>
                  </Gate>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
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
