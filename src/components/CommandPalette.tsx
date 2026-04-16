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
  User,
  LayoutGrid,
  Zap
} from 'lucide-react';
import { ATOMIC_NAVIGATION } from '../constants/navigation';

interface CommandItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  category: string;
}

const commands: CommandItem[] = ATOMIC_NAVIGATION.flatMap(cat => 
  cat.pages.map(page => ({
    id: page.id,
    label: page.label,
    icon: React.createElement(cat.icon, { className: "w-4 h-4" }),
    path: page.path,
    category: cat.label
  }))
);

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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden rounded-[2rem]"
          >
            <div className="flex items-center gap-6 p-6 border-b border-white/5">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-black fill-black" />
              </div>
              <div className="flex-1 relative">
                {isSearching && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-blue-500" size={20} />
                  </div>
                )}
                <input 
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="COMMAND SEARCH..."
                  className="w-full bg-transparent border-none outline-none text-xl font-black uppercase tracking-widest text-white placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-4 no-scrollbar">
              {filteredCommands.length === 0 && unifiedResults.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-xs font-black text-white/20 uppercase tracking-[0.4em]">No results found for "{search}"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredCommands.length > 0 && (
                    <div className="space-y-2">
                      <p className="px-4 py-2 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">System Modules</p>
                      {filteredCommands.map((cmd, index) => (
                        <button
                          key={`${cmd.id}-${cmd.path}`}
                          onClick={() => {
                            onSelect(cmd.path);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                            index === selectedIndex ? 'bg-white text-black' : 'hover:bg-white/5 text-white/60 hover:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${index === selectedIndex ? 'bg-black/10 text-black' : 'bg-white/5 text-blue-500'}`}>
                            {cmd.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-black uppercase tracking-tight">{cmd.label}</p>
                            <p className={`text-[9px] font-bold uppercase tracking-widest opacity-60`}>
                              {cmd.category}
                            </p>
                          </div>
                          {index === selectedIndex && (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {unifiedResults.length > 0 && (
                    <div className="space-y-2">
                      <p className="px-4 py-2 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Database Records</p>
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
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                              actualIndex === selectedIndex ? 'bg-blue-500 text-white' : 'hover:bg-white/5 text-white/60 hover:text-white'
                            }`}
                          >
                            <div className={`p-2 rounded-lg transition-colors ${actualIndex === selectedIndex ? 'bg-white/20 text-white' : 'bg-white/5 text-blue-500'}`}>
                              {getIcon(result.type)}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-black uppercase tracking-tight">{result.title}</p>
                              <p className={`text-[9px] font-bold uppercase tracking-widest opacity-60`}>
                                {result.type} • {result.subtitle}
                              </p>
                            </div>
                            {actualIndex === selectedIndex && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/20">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-white/40">ESC</div>
                  <span>Close</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-white/40">↑↓</div>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-white/40">↵</div>
                  <span>Execute</span>
                </div>
              </div>
              <span className="text-blue-500/40">v2.6.0-OBSIDIAN</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
