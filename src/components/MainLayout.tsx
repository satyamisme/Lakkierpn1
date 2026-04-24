import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ModuleRenderer } from './ModuleRenderer';
import { useLocation, useNavigate } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';
import { GlobalAddProductModal } from './GlobalAddProductModal';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Scan, Bell, ShoppingCart, ChevronRight, LayoutDashboard, Wrench, Package, Users, Sparkles, Home } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed_v2');
    return saved === 'true';
  });
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);

  const activeModule = location.pathname.substring(1) || 'command-center';

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed_v2', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleModuleChange = (module: string) => {
    navigate(`/${module}`);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-foreground transition-colors duration-500 overflow-hidden font-sans selection:bg-blue-500/30">
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelect={handleModuleChange}
      />
      <GlobalAddProductModal 
        isOpen={isGlobalAddOpen}
        onClose={() => setIsGlobalAddOpen(false)}
      />
      
      {/* Sidebar (The Obsidian Rail) - Hidden on mobile */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={toggleSidebar} 
          activeModule={activeModule}
          onModuleChange={handleModuleChange}
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 relative bg-black">
        {/* TopBar (The Floating Command) */}
        <TopBar 
          activeModule={activeModule} 
          onSearchClick={() => setIsCommandPaletteOpen(true)} 
          onAddProductClick={() => setIsGlobalAddOpen(true)}
          onToggleActivityFeed={() => setIsActivityFeedOpen(!isActivityFeedOpen)}
        />
        
        <div className="flex-1 flex overflow-hidden relative">
          {/* The Stage (ModuleRenderer) */}
          <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#050505] min-w-0">
            {/* Subtle Grid Background - More refined */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:120px_120px]" />
            
            <div className="p-4 lg:p-6 max-w-[2400px] mx-auto relative z-10 h-full">
              <motion.div
                key={activeModule}
                className="h-full"
                initial={{ opacity: 0, scale: 0.99, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <ModuleRenderer 
                  activeModule={activeModule} 
                  onModuleChange={handleModuleChange} 
                  onAddProductClick={() => setIsGlobalAddOpen(true)}
                />
              </motion.div>
            </div>
          </main>

          {/* Activity Feed Drawer - Now Pushes content instead of overlapping */}
          <AnimatePresence>
            {isActivityFeedOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="hidden xl:flex border-l border-white/5 bg-[#0A0A0A] flex-col overflow-hidden relative z-40"
              >
                <div className="w-[360px] h-full flex flex-col">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black tracking-tighter uppercase">System Pulse</h3>
                      <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Real-time Technical Audit</p>
                    </div>
                    <button onClick={() => setIsActivityFeedOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {[
                      { type: 'sale', user: 'Ahmed', action: 'Completed POS Sale', time: '2m ago', id: '#INV-4421' },
                      { type: 'repair', user: 'Sara', action: 'Status Change: QC Passed', time: '5m ago', id: '#REP-992' },
                      { type: 'inventory', user: 'System', action: 'Low Stock Alert: iPhone 15', time: '12m ago', id: '#SKU-IP15' },
                      { type: 'security', user: 'Admin', action: 'Manager PIN Override', time: '15m ago', id: '#AUTH-01' },
                      { type: 'sale', user: 'John', action: 'New Order: B2B Bulk', time: '22m ago', id: '#INV-4422' },
                    ].map((event, i) => (
                      <div key={i} className="flex gap-4 group p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="relative">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                            event.type === 'sale' ? 'bg-green-500' : 
                            event.type === 'repair' ? 'bg-blue-500' : 
                            event.type === 'security' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                          {i !== 4 && <div className="absolute top-4 left-[2.5px] w-[1px] h-full bg-white/5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{event.user}</span>
                            <span className="text-[8px] font-mono text-white/20">{event.time}</span>
                          </div>
                          <p className="text-[10px] font-bold text-white/80 leading-relaxed">{event.action}</p>
                          <p className="text-[8px] font-mono text-blue-500 mt-1 opacity-40">{event.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-white/5 border-t border-white/5">
                    <button className="w-full py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5">
                      Full Audit Log
                    </button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Activity Feed Mobile Overlay */}
          <AnimatePresence>
            {isActivityFeedOpen && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setIsActivityFeedOpen(false)}
                 className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
               />
            )}
            {isActivityFeedOpen && (
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="xl:hidden fixed right-0 top-0 bottom-0 w-full max-w-[320px] bg-[#0A0A0A] border-l border-white/5 z-[70] flex flex-col"
              >
                 <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-black tracking-tighter uppercase text-white">System Pulse</h3>
                    <button onClick={() => setIsActivityFeedOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                     <p className="text-[10px] text-white/40 italic">Mobile pulse monitoring active...</p>
                  </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Global Status Bar (Bottom Bar) */}
        <footer className="h-8 bg-[#0A0A0A] border-t border-white/5 px-6 flex items-center justify-between text-[8px] font-black text-white/20 uppercase tracking-[0.3em] shrink-0 z-40">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white/40">Terminal Secure</span>
            </span>
            <div className="w-px h-3 bg-white/5" />
            <span className="opacity-40">Node: POS-01-LAKKI</span>
            <div className="w-px h-3 bg-white/5" />
            <span className="opacity-40">Latency: 12ms</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="opacity-40">v2.6.0-OBSIDIAN</span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-blue-500" />
              <div className="w-1 h-1 rounded-full bg-blue-500/40" />
              <div className="w-1 h-1 rounded-full bg-blue-500/20" />
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Navigation Bar */}
        <div className="lg:hidden h-16 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 shrink-0 z-50">
          {[
            { id: 'command-center', icon: Home, label: 'Home' },
            { id: 'pos', icon: ShoppingCart, label: 'Sales' },
            { id: 'repairs', icon: Wrench, label: 'Fix' },
            { id: 'inventory', icon: Package, label: 'Stock' },
            { id: 'crm', icon: Users, label: 'Clients' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleModuleChange(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${activeModule === item.id ? 'text-blue-500' : 'text-white/40'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
