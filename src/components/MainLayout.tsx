import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ModuleRenderer } from './ModuleRenderer';
import { useLocation, useNavigate } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';
import { GlobalAddProductModal } from './GlobalAddProductModal';
import { Downbar } from './Downbar';

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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);

  // Determine active module from URL path
  const activeModule = location.pathname.substring(1) || 'pos';

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
        />
        
        {/* The Stage (ModuleRenderer.tsx) */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-surface p-10 lg:p-16 relative">
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
