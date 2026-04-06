import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  MapPin, 
  Printer, 
  ChevronRight, 
  Home, 
  Command,
  FileText,
  CreditCard
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Gate, usePermissions } from './PermissionGuard';
import { RoleSwitcher } from './RoleSwitcher';
import { printThermalReceipt, printA4Invoice } from '../utils/documentService';

interface TopBarProps {
  activeModule: string;
}

/**
 * ID 219, 195: Control Center (TopBar.tsx)
 * Left: Breadcrumbs.
 * Center: Global Search (Ctrl+K).
 * Right: Theme Toggle (ID 219), Role Switcher (ID 195), and Quick-Action Print (ID 21, 25).
 */
export const TopBar: React.FC<TopBarProps> = ({ activeModule }) => {
  const { theme, toggleTheme } = useTheme();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Global Search Shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-20 bg-card/80 border-b border-border flex items-center justify-between px-8 transition-colors duration-500 sticky top-0 z-40 backdrop-blur-md">
      {/* Left: Breadcrumbs (ID 184) */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <Home className="w-3 h-3" />
          <ChevronRight className="w-3 h-3" />
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary tracking-[0.2em]">{activeModule} Terminal</span>
        </div>
      </div>

      {/* Center: Global Search (Ctrl+K) (ID 3) */}
      <div className="flex-1 max-w-2xl px-8">
        <Gate id={3}>
          <div className={`relative group transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
            <input 
              id="global-search"
              type="text"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Elastic Search (ID 3): Name, SKU, or IMEI..."
              className="w-full pl-12 pr-16 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground font-bold text-xs uppercase tracking-widest"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-muted border border-border rounded-lg text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>
        </Gate>
      </div>

      {/* Right: Actions (ID 219, 195, 21, 25) */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* Quick-Action Print (ID 21, 25) */}
        <div className="flex items-center gap-2 border-r border-border pr-4">
          <Gate id={21}>
            <button 
              onClick={() => printThermalReceipt('QUICK-PRINT')}
              className="p-2.5 bg-muted rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-border group relative"
            >
              <Printer className="w-4 h-4" />
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Thermal (ID 21)</span>
            </button>
          </Gate>
          <Gate id={25}>
            <button 
              onClick={() => printA4Invoice('QUICK-PRINT')}
              className="p-2.5 bg-muted rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-border group relative"
            >
              <FileText className="w-4 h-4" />
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Invoice (ID 25)</span>
            </button>
          </Gate>
        </div>

        {/* Role Switcher (ID 195) */}
        <RoleSwitcher />

        {/* Theme Toggle (ID 219) */}
        <Gate id={219}>
          <button 
            onClick={toggleTheme}
            className="p-3 bg-muted rounded-2xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-border"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </Gate>

        <button className="p-3 bg-muted rounded-2xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-border relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
        </button>

        <Gate id={199}>
          <div className="hidden xl:flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
            <MapPin className="w-5 h-5 text-primary" />
            <div className="text-[10px]">
              <p className="text-primary font-black uppercase tracking-widest leading-none">Lakki Main Branch</p>
              <p className="text-primary/60 font-black mt-0.5 uppercase tracking-widest text-[8px]">ID 199</p>
            </div>
          </div>
        </Gate>
      </div>
    </header>
  );
};
