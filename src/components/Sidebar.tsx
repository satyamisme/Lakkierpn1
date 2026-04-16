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
      animate={{ width: isCollapsed ? 64 : 260 }}
      className="h-screen bg-[#0A0A0A] border-r border-white/5 flex flex-col relative z-50 overflow-hidden"
    >
      {/* Brand / Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 shrink-0">
        <div 
          onClick={() => onModuleChange('command-center')}
          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
        >
          <Zap className="w-5 h-5 text-black fill-black" />
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3"
          >
            <h1 className="text-white font-black tracking-tighter text-lg leading-none uppercase">LAKKI</h1>
            <p className="text-[8px] text-white/40 font-mono tracking-widest uppercase mt-0.5">Terminal OS v2.6</p>
          </motion.div>
        )}
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 py-4 flex flex-col gap-0.5 px-2 overflow-y-auto no-scrollbar">
        {/* Command Center Quick Link */}
        <button
          onClick={() => onModuleChange('command-center')}
          className={`
            relative group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 mb-4
            ${activeModule === 'command-center' ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}
          `}
        >
          <div className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeModule === 'command-center' ? 'text-blue-500' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className="text-xs font-black tracking-tight uppercase">Command</span>
          )}
          {activeModule === 'command-center' && (
            <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-5 bg-white rounded-r-full" />
          )}
        </button>

        <div className="px-3 mb-1">
          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Domains</p>
        </div>

        {ATOMIC_NAVIGATION.map((category) => {
          const isExpanded = expandedCategory === category.id;
          const hasActivePage = category.pages.some(p => activeModule === p.path);

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
                    {category.pages.map((page) => {
                      const isActive = activeModule === page.path;
                      return (
                        <button
                          key={page.id}
                          onClick={() => onModuleChange(page.path)}
                          className={`
                            group flex items-center gap-2.5 p-1.5 rounded-lg text-left transition-all
                            ${isActive ? 'text-white font-bold' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}
                          `}
                        >
                          <div className={`w-1 h-1 rounded-full transition-all ${isActive ? 'bg-blue-500 scale-125' : 'bg-white/10 group-hover:bg-white/30'}`} />
                          <span className="text-[10px] tracking-tight uppercase">{page.label}</span>
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
