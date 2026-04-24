import React, { useState } from 'react';
import { 
  Home, 
  ShoppingCart, 
  Wrench, 
  Package, 
  Users, 
  Sparkles, 
  Settings, 
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Box,
  BarChart3,
  Database,
  Globe,
  Lock,
  Menu,
  X,
  ChevronDown,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ATOMIC_NAVIGATION, NavCategory, AtomicPage } from '../constants/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, activeModule, onModuleChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, hasPermission } = useAuth();

  const isPageVisible = (page: AtomicPage) => {
    if (page.featureIds.length === 0) return true;
    return page.featureIds.some(id => hasPermission(id));
  };

  const filteredNavigation = ATOMIC_NAVIGATION.filter(category => {
    const visiblePages = category.pages.filter(isPageVisible);
    if (visiblePages.length === 0) return false;

    const matchesCategory = category.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPages = visiblePages.some(page => 
      page.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      page.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesCategory || matchesPages;
  }).map(category => ({
    ...category,
    pages: category.pages.filter(isPageVisible)
  }));

  const handleCategoryClick = (categoryId: string) => {
    if (isCollapsed) {
      onToggle();
      setExpandedCategory(categoryId);
    } else {
      setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    }
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      className="h-screen bg-surface-container-low/80 backdrop-blur-xl border-r border-[#41484d]/15 flex flex-col relative z-50 overflow-hidden"
    >
      {/* Brand / Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#41484d]/10 shrink-0">
        <div 
          onClick={() => onModuleChange('command-center')}
          className="w-7 h-7 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center shrink-0 cursor-pointer hover:bg-white/20 transition-all shadow-lg shadow-black/20"
        >
          <Zap className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3"
          >
            <h1 className="text-white font-black tracking-tighter text-base leading-none uppercase">LAKKI</h1>
            <p className="text-[7px] text-white/20 font-mono tracking-[0.3em] uppercase mt-0.5">Terminal.OS</p>
          </motion.div>
        )}
      </div>

      {/* Search Matrix */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-b border-[#41484d]/10 bg-white/[0.01]">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/10 group-focus-within:text-primary-foreground transition-colors" />
            <input 
              type="text"
              placeholder="Search Intelligence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-highest/30 border border-white/5 rounded-md pl-8 pr-3 py-1.5 text-[9px] font-bold text-white placeholder:text-white/10 outline-none focus:border-primary-foreground/30 transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation Tree */}
      <div className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto no-scrollbar">
        {/* Command Center Quick Link */}
        <button
          onClick={() => onModuleChange('command-center')}
          className={`
            relative group flex items-center gap-3 p-2 rounded-lg transition-all duration-300 mb-2
            ${activeModule === 'command-center' ? 'bg-gradient-to-br from-primary-foreground/20 to-primary/20 text-white' : 'text-white/20 hover:bg-white/5 hover:text-white'}
          `}
        >
          <div className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeModule === 'command-center' ? 'text-primary-foreground' : ''}`}>
            <Home className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-black tracking-tight uppercase">Command</span>
          )}
          {activeModule === 'command-center' && (
            <motion.div layoutId="active-pill" className="absolute left-0 w-0.5 h-4 bg-primary-foreground rounded-r-full" />
          )}
        </button>

        <div className="px-2 mb-1 mt-2">
          <p className="text-[7px] font-black text-white/10 uppercase tracking-[0.4em]">Operational Domains</p>
        </div>

        {filteredNavigation.map((category) => {
          const isExpanded = expandedCategory === category.id || searchQuery.length > 0;
          const hasActivePage = category.pages.some(p => activeModule === p.path || location.pathname.includes(p.path));

          return (
            <div key={category.id} className="flex flex-col gap-0.5">
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  relative group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300
                  ${hasActivePage || isExpanded ? 'bg-white/5 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                `}
              >
                <div className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${hasActivePage ? category.color : ''}`}>
                  <category.icon className="w-5 h-5" />
                </div>
                
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left text-[11px] font-bold tracking-tight uppercase">
                      {category.label}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </>
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {category.label}
                  </div>
                )}
              </button>

              {/* Sub-pages */}
              <AnimatePresence>
                {!isCollapsed && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col gap-0.5 ml-8 border-l border-white/5 pl-2 my-0.5"
                  >
                    {category.pages
                      .filter(page => 
                        page.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        searchQuery === ''
                      )
                      .map((page) => {
                        const isActive = activeModule === page.path || location.pathname.includes(page.path);
                        return (
                          <button
                            key={page.id}
                            onClick={() => onModuleChange(page.path)}
                            className={`
                              group flex items-center gap-2.5 p-1.5 rounded-lg text-left transition-all
                              ${isActive ? 'text-white font-bold bg-white/5' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}
                            `}
                          >
                            <div className={`w-1 h-1 rounded-full transition-all ${isActive ? 'bg-blue-500 scale-125' : 'bg-white/10 group-hover:bg-white/30'}`} />
                            <span className="text-[10px] tracking-tight uppercase">{page.label}</span>
                            {isActive && <div className="ml-auto w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                          </button>
                        );
                      })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <div className="my-4 border-t border-white/5 mx-2" />

        {/* Quick Tools */}
        <div className="space-y-0.5">
          {[
            { id: 'analytics', icon: BarChart3, label: 'Intelligence' },
            { id: 'database', icon: Database, label: 'Data Lake' },
            { id: 'security', icon: Lock, label: 'Vault' },
          ].map((tool) => (
            <button
              key={tool.id}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-white/20 hover:text-white/60 transition-all group"
            >
              <tool.icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <span className="text-[9px] font-black uppercase tracking-widest">{tool.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer / Settings */}
      <div className="p-3 border-t border-white/5 bg-black/50 backdrop-blur-md">
        {!isCollapsed && (
          <div className="px-3 py-4 mb-2 bg-white/[0.02] border border-white/5 rounded-xl">
             <div className="flex items-center justify-between mb-3">
               <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Core Status</span>
               <div className="flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-green-500" />
                 <span className="text-[8px] font-black text-green-500/80 uppercase tracking-widest leading-none">Healthy</span>
               </div>
             </div>
             <div className="space-y-2">
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '65%' }}
                   className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" 
                 />
               </div>
               <div className="flex justify-between text-[7px] font-bold text-white/20 uppercase tracking-widest">
                 <span>Load: 24%</span>
                 <span>Sync: 100%</span>
               </div>
             </div>
          </div>
        )}
        
        <button 
          onClick={onToggle}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all"
        >
          <Menu className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <span className="text-[9px] font-black uppercase tracking-widest">Collapse</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
