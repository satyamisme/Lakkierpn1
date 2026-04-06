import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ModuleRenderer } from './ModuleRenderer';
import { ChevronRight, Home } from 'lucide-react';

/**
 * ID 184: Main Chassis (MainLayout.tsx)
 * A professional, high-density dashboard that never unmounts.
 */
export const MainLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });
  const [activeModule, setActiveModule] = useState<string>(() => {
    return localStorage.getItem('active_module') || 'pos';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('active_module', activeModule);
  }, [activeModule]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden">
      {/* Sidebar (ID 184) */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar} 
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* TopBar (ID 3, 195, 199, 232, 219, 21, 25) */}
        <TopBar activeModule={activeModule} />
        
        {/* The Stage (ModuleRenderer.tsx) */}
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-muted/30 p-6 lg:p-10">
          <div className="max-w-[1800px] mx-auto">
            <ModuleRenderer activeModule={activeModule} onModuleChange={setActiveModule} />
          </div>
        </main>

        {/* Global Footer Status Bar */}
        <footer className="h-8 bg-card border-t border-border px-6 flex items-center justify-between text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Enterprise Shell Active (ID 184)
            </span>
            <span className="opacity-30">|</span>
            <span>Terminal: POS-01-LAKKI</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Lakki Phone ERP &copy; 2026</span>
            <span className="opacity-30">|</span>
            <span className="text-primary">v2.5.0-STABLE</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
