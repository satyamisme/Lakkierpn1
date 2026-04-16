import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ModuleRenderer } from './ModuleRenderer';
import { useLocation, useNavigate } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';
import { GlobalAddProductModal } from './GlobalAddProductModal';
import { Downbar } from './Downbar';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Scan, Bell, ShoppingCart, ChevronRight, LayoutDashboard, Wrench, Package, Users, Sparkles, Home } from 'lucide-react';

/**
 * ID 184: Main Chassis (MainLayout.tsx)
 * A professional, high-density dashboard that never unmounts.
 */
export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);

  // Determine active module from URL path
  const activeModule = location.pathname.substring(1) || 'command-center';

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
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
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden">
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelect={handleModuleChange}
      />
      <GlobalAddProductModal 
        isOpen={isGlobalAddOpen}
        onClose={() => setIsGlobalAddOpen(false)}
      />
      
      {/* Mobile Downbar (Quick Actions) */}
      <Downbar 
        onSearchClick={() => setIsCommandPaletteOpen(true)}
        onAddProductClick={() => setIsGlobalAddOpen(true)}
      />

      {/* Sidebar (ID 184) */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar} 
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* TopBar (ID 3, 195, 199, 232, 219, 21, 25) */}
        <TopBar 
          activeModule={activeModule} 
          onSearchClick={() => setIsCommandPaletteOpen(true)} 
          onAddProductClick={() => setIsGlobalAddOpen(true)}
          onToggleActivityFeed={() => setIsActivityFeedOpen(!isActivityFeedOpen)}
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* The Stage (ModuleRenderer.tsx) */}
          <main className="flex-1 overflow-y-auto no-scrollbar bg-surface p-10 lg:p-16 relative border-r border-border/50">
            {/* Subtle background texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_2px_2px,var(--color-primary)_1px,transparent_0)] bg-[size:48px_48px]" />
            
            <div className="max-w-[2000px] mx-auto relative z-10">
              <ModuleRenderer 
                activeModule={activeModule} 
                onModuleChange={handleModuleChange} 
                onAddProductClick={() => setIsGlobalAddOpen(true)}
              />
            </div>
          </main>

          {/* ID 181: Master Audit Trail / Activity Feed */}
          <AnimatePresence>
            {isActivityFeedOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-surface-container-lowest border-l border-border flex flex-col overflow-hidden relative z-20"
              >
                <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
                  <div>
                    <h3 className="text-xl font-serif italic">System Pulse</h3>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">ID 181: Master Audit Trail</p>
                  </div>
                  <button onClick={() => setIsActivityFeedOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                  {[
                    { type: 'sale', user: 'Ahmed', action: 'Completed POS Sale', time: '2m ago', id: '#INV-4421' },
                    { type: 'repair', user: 'Sara', action: 'Status Change: QC Passed', time: '5m ago', id: '#REP-992' },
                    { type: 'inventory', user: 'System', action: 'Low Stock Alert: iPhone 15', time: '12m ago', id: '#SKU-IP15' },
                    { type: 'security', user: 'Admin', action: 'Manager PIN Override', time: '15m ago', id: '#AUTH-01' },
                    { type: 'sale', user: 'John', action: 'New Order: B2B Bulk', time: '22m ago', id: '#INV-4422' },
                  ].map((event, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="relative">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          event.type === 'sale' ? 'bg-green-500' : 
                          event.type === 'repair' ? 'bg-primary' : 
                          event.type === 'security' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                        {i !== 4 && <div className="absolute top-4 left-1 w-[1px] h-full bg-border opacity-30" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{event.user}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{event.time}</span>
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">{event.action}</p>
                        <p className="text-[9px] font-mono text-primary mt-1 opacity-60">{event.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-muted/5 border-t border-border">
                  <button className="w-full py-3 bg-surface border border-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-muted transition-all">View Full Audit Log</button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Right Quick Panel (IMEI Checker, Notifications, Cart) */}
          <AnimatePresence>
            {isRightPanelOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-surface-container-lowest border-l border-border flex flex-col overflow-hidden relative z-20"
              >
                <div className="p-8 border-b border-border flex items-center justify-between bg-primary/5">
                  <div>
                    <h3 className="text-xl font-serif italic">Quick Panel</h3>
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">Live Matrix Tools</p>
                  </div>
                  <button onClick={() => setIsRightPanelOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                  {/* IMEI Checker */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">IMEI Validator</h4>
                      <Scan className="w-4 h-4 text-primary opacity-40" />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Enter 15-digit IMEI..."
                        className="w-full bg-surface border border-border px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Check</button>
                    </div>
                  </div>

                  {/* Cart Preview */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Active Cart</h4>
                      <ShoppingCart className="w-4 h-4 text-primary opacity-40" />
                    </div>
                    <div className="p-6 border border-dashed border-border rounded-[2rem] text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Cart is empty</p>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Recent Alerts</h4>
                      <Bell className="w-4 h-4 text-primary opacity-40" />
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 bg-muted/10 rounded-2xl border border-border/50">
                          <p className="text-[10px] font-bold text-foreground">System Update v2.5.1</p>
                          <p className="text-[9px] text-muted-foreground mt-1">Security patch deployed successfully.</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel Toggle Handle */}
        {!isRightPanelOpen && (
          <button 
            onClick={() => setIsRightPanelOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 bg-surface-container-lowest border border-border border-r-0 p-3 rounded-l-2xl shadow-2xl z-30 hover:bg-primary hover:text-primary-foreground transition-all group"
          >
            <ChevronRight className="w-5 h-5 rotate-180 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* BOTTOM BAR (Mobile/Tablet Only) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface-container-lowest/80 backdrop-blur-2xl border-t border-border flex items-center justify-around px-6 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          {[
            { id: 'command-center', icon: <Home className="w-6 h-6" />, guard: 1 },
            { id: 'pos', icon: <ShoppingCart className="w-6 h-6" />, guard: 1 },
            { id: 'repairs', icon: <Wrench className="w-6 h-6" />, guard: 61 },
            { id: 'inventory', icon: <Package className="w-6 h-6" />, guard: 121 },
            { id: 'crm', icon: <Users className="w-6 h-6" />, guard: 241 },
            { id: 'enterprise', icon: <Sparkles className="w-6 h-6" />, guard: 316 },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => handleModuleChange(item.id)}
              className={`p-4 rounded-2xl transition-all ${activeModule.startsWith(item.id) ? 'bg-primary text-primary-foreground shadow-xl' : 'text-muted-foreground'}`}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* Global Footer Status Bar */}
        <footer className="h-12 bg-surface-container-lowest border-t border-border px-10 flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] shrink-0 shadow-2xl relative z-30">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-20" />
              </div>
              <span className="text-foreground/80">Enterprise Shell Active</span>
            </span>
            <div className="h-4 w-[1px] bg-border opacity-30" />
            <span className="opacity-60 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              Terminal: POS-01-LAKKI
            </span>
            <div className="h-4 w-[1px] bg-border opacity-30" />
            <span className="opacity-60 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              Latency: 14ms
            </span>
          </div>
          <div className="flex items-center gap-8">
            <span className="opacity-40">Lakki Phone ERP &copy; 2026</span>
            <div className="h-4 w-[1px] bg-border opacity-30" />
            <div className="flex items-center gap-3 bg-primary/5 px-4 py-1 rounded-full border border-primary/10">
              <span className="text-primary font-black tracking-[0.4em]">v2.5.0-STABLE</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
