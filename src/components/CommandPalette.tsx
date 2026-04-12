import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
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
  Trophy,
  ClipboardCheck,
  Loader2,
  FileText,
  User
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
  { id: 318, label: 'Cycle Count (Staff)', icon: <ClipboardCheck className="w-4 h-4" />, path: 'cycle-count/staff', category: 'Operations' },
  { id: 318, label: 'Cycle Count (Manager)', icon: <ShieldCheck className="w-4 h-4" />, path: 'cycle-count/manager', category: 'Operations' },
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
  const [unifiedResults, setUnifiedResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSearch('');
      }
      if (!isOpen) return;

      if (e.key === 'Escape') onClose();
      
      const totalItems = filteredCommands.length + unifiedResults.length;
      if (e.key === 'ArrowDown') setSelectedIndex(prev => (prev + 1) % totalItems);
      if (e.key === 'ArrowUp') setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
      
      if (e.key === 'Enter') {
        if (selectedIndex < filteredCommands.length) {
          onSelect(filteredCommands[selectedIndex].path);
        } else {
          const result = unifiedResults[selectedIndex - filteredCommands.length];
          onSelect(result.link.startsWith('/') ? result.link.substring(1) : result.link);
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, search, unifiedResults]);

  const filteredCommands = useMemo(() => {
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  useEffect(() => {
    if (search.length < 2) {
      setUnifiedResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`/api/search/unified?q=${search}`);
        setUnifiedResults(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, unifiedResults]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'product': return <Package size={16} />;
      case 'sale': return <FileText size={16} />;
      case 'customer': return <User size={16} />;
      case 'repair': return <Wrench size={16} />;
      default: return <Search size={16} />;
    }
  };

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
              {isSearching ? <Loader2 className="animate-spin text-primary" size={20} /> : <Search className="text-muted-foreground" size={20} />}
              <input 
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search features, products, sales..."
                className="flex-1 bg-transparent border-none outline-none text-lg font-bold uppercase tracking-widest placeholder:text-muted-foreground/50"
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-muted border border-border rounded-lg text-[10px] font-black text-muted-foreground">
                ESC
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
              {filteredCommands.length === 0 && unifiedResults.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No results found for "{search}"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCommands.length > 0 && (
                    <div className="space-y-1">
                      <p className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">System Modules</p>
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
                        </button>
                      ))}
                    </div>
                  )}

                  {unifiedResults.length > 0 && (
                    <div className="space-y-1">
                      <p className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">Database Records</p>
                      {unifiedResults.map((result, index) => {
                        const actualIndex = index + filteredCommands.length;
                        return (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => {
                              onSelect(result.link.startsWith('/') ? result.link.substring(1) : result.link);
                              onClose();
                            }}
                            onMouseEnter={() => setSelectedIndex(actualIndex)}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                              actualIndex === selectedIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${actualIndex === selectedIndex ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                              {getIcon(result.type)}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-xs font-black uppercase tracking-widest">{result.title}</p>
                              <p className={`text-[10px] font-bold uppercase tracking-widest ${actualIndex === selectedIndex ? 'text-white/60' : 'text-muted-foreground'}`}>
                                {result.type} • {result.subtitle}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
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
