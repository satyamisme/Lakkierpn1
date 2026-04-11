import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Command, 
  X, 
  ChevronRight, 
  Smartphone, 
  ShoppingCart, 
  Wrench, 
  Package, 
  Users, 
  Wallet, 
  BarChart3, 
  ShieldCheck, 
  Lock, 
  Store, 
  Settings2,
  Layers,
  Truck,
  RefreshCw,
  BrainCircuit,
  Plus,
  Globe,
  Trophy
} from 'lucide-react';

interface CommandItem {
  id: number;
  label: string;
  icon: React.ReactNode;
  path: string;
  category: string;
}

const commands: CommandItem[] = [
  { id: 192, label: 'Executive Cockpit', icon: <BarChart3 className="w-4 h-4" />, path: 'cockpit', category: 'Executive' },
  { id: 256, label: 'CRM Matrix', icon: <Users className="w-4 h-4" />, path: 'crm', category: 'Executive' },
  { id: 1, label: 'Sales Terminal', icon: <ShoppingCart className="w-4 h-4" />, path: 'pos', category: 'Operations' },
  { id: 61, label: 'Deep-Tech Repair Hub', icon: <Wrench className="w-4 h-4" />, path: 'repairs', category: 'Operations' },
  { id: 31, label: 'Supply Chain Matrix', icon: <Package className="w-4 h-4" />, path: 'inventory', category: 'Operations' },
  { id: 121, label: 'Global Warehouse', icon: <Layers className="w-4 h-4" />, path: 'warehouse', category: 'Logistics' },
  { id: 122, label: 'Vendor Portal', icon: <Truck className="w-4 h-4" />, path: 'suppliers', category: 'Logistics' },
  { id: 123, label: 'Bulk Processing', icon: <RefreshCw className="w-4 h-4" />, path: 'bulk', category: 'Logistics' },
  { id: 316, label: 'Enterprise Core', icon: <BrainCircuit className="w-4 h-4" />, path: 'enterprise', category: 'Enterprise' },
  { id: 181, label: 'Governance & Security', icon: <ShieldCheck className="w-4 h-4" />, path: 'governance', category: 'Enterprise' },
  { id: 185, label: 'Feature Gate Board', icon: <Lock className="w-4 h-4" />, path: 'toggles', category: 'Enterprise' },
  { id: 301, label: 'Premium Features', icon: <Plus className="w-4 h-4" />, path: 'extended', category: 'Extended' },
  { id: 241, label: 'Omnichannel Hub', icon: <Globe className="w-4 h-4" />, path: 'omnichannel', category: 'Extended' },
  { id: 101, label: 'Finance Terminal', icon: <Wallet className="w-4 h-4" />, path: 'finance', category: 'Finance' },
  { id: 188, label: 'Performance Analytics', icon: <Trophy className="w-4 h-4" />, path: 'performance', category: 'CRM & Loyalty' },
  { id: 195, label: 'Access Control', icon: <Users className="w-4 h-4" />, path: 'roles', category: 'Admin' },
  { id: 232, label: 'System Watchtower', icon: <Settings2 className="w-4 h-4" />, path: 'health', category: 'Admin' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSearch('');
      }
      if (!isOpen) return;

      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      if (e.key === 'ArrowUp') setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      if (e.key === 'Enter') {
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].path);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, search]);

  const filteredCommands = useMemo(() => {
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-card border border-border shadow-2xl overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-4 p-4 border-b border-border">
              <Search className="text-muted-foreground" size={20} />
              <input 
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search features, tools, and reports..."
                className="flex-1 bg-transparent border-none outline-none text-lg font-bold uppercase tracking-widest placeholder:text-muted-foreground/50"
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-muted border border-border rounded-lg text-[10px] font-black text-muted-foreground">
                ESC
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No results found for "{search}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCommands.map((cmd, index) => (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        onSelect(cmd.path);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                        index === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                        {cmd.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-black uppercase tracking-widest">{cmd.label}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${index === selectedIndex ? 'text-white/60' : 'text-muted-foreground'}`}>
                          {cmd.category}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${index === selectedIndex ? 'opacity-100' : 'opacity-0'}`}>
                        Jump To <ChevronRight size={12} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Command size={10} /> + K to toggle</span>
                <span className="flex items-center gap-1">↑↓ to navigate</span>
                <span className="flex items-center gap-1">↵ to select</span>
              </div>
              <span>Lakki ERP v4.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
