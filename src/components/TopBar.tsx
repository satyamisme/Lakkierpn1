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
  CreditCard,
  LogOut,
  User,
  Plus
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Gate, usePermissions } from './PermissionGuard';
import { RoleSwitcher } from './RoleSwitcher';
import { printThermalReceipt, printA4Invoice } from '../utils/documentService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  activeModule: string;
  onSearchClick: () => void;
  onAddProductClick: () => void;
}

/**
 * ID 219, 195: Control Center (TopBar.tsx)
 * Left: Breadcrumbs.
 * Center: Global Search (Ctrl+K).
 * Right: Theme Toggle (ID 219), Role Switcher (ID 195), and Quick-Action Print (ID 21, 25).
 */
export const TopBar: React.FC<TopBarProps> = ({ activeModule, onSearchClick, onAddProductClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-24 bg-surface-container-lowest/60 border-b border-border flex items-center justify-between px-10 transition-all duration-500 sticky top-0 z-40 backdrop-blur-2xl">
      {/* Left: Breadcrumbs (ID 184) */}
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
          <Home className="w-4 h-4" />
          <ChevronRight className="w-3 h-3" />
          <span className="font-serif italic lowercase text-lg tracking-normal opacity-100 text-foreground">dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary tracking-[0.4em] font-black">{activeModule.replace('-', ' ')} terminal</span>
        </div>
      </div>

      {/* Center: Global Search (Ctrl+K) (ID 3) */}
      <div className="flex-1 max-w-2xl px-12">
        <Gate id={3}>
          <div 
            onClick={onSearchClick}
            className={`relative group cursor-pointer transition-all duration-500 ${isSearchFocused ? 'scale-[1.02]' : ''}`}
          >
            <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-500 ${isSearchFocused ? 'text-primary rotate-90' : 'text-muted-foreground'}`} />
            <div className="w-full pl-16 pr-20 py-4 bg-surface border border-border rounded-[2rem] text-muted-foreground/40 font-black text-[10px] uppercase tracking-[0.2em] flex items-center shadow-inner group-hover:border-primary/30 transition-all">
              Search features, tools, and reports...
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-border rounded-xl text-[9px] font-black text-muted-foreground uppercase tracking-widest shadow-sm group-hover:text-primary group-hover:border-primary/20 transition-all">
              <Command className="w-3 h-3" /> K
            </div>
          </div>
        </Gate>
      </div>

      {/* Right: Actions (ID 219, 195, 21, 25) */}
      <div className="flex items-center gap-6 flex-1 justify-end">
        {/* Quick-Action Print (ID 21, 25) */}
        <div className="flex items-center gap-3 border-r border-border pr-6">
          <Gate id={122}>
            <button 
              onClick={onAddProductClick}
              className="p-3.5 bg-primary/5 rounded-2xl text-primary hover:bg-primary hover:text-primary-foreground transition-all active:scale-90 border border-primary/10 group relative shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 shadow-2xl">Add Product (ID 122)</span>
            </button>
          </Gate>
          <Gate id={21}>
            <button 
              onClick={() => printThermalReceipt('QUICK-PRINT')}
              className="p-3.5 bg-surface-container rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all active:scale-90 border border-border group relative shadow-sm"
            >
              <Printer className="w-5 h-5" />
              <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 shadow-2xl">Thermal (ID 21)</span>
            </button>
          </Gate>
          <Gate id={25}>
            <button 
              onClick={() => printA4Invoice('QUICK-PRINT')}
              className="p-3.5 bg-surface-container rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all active:scale-90 border border-border group relative shadow-sm"
            >
              <FileText className="w-5 h-5" />
              <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 shadow-2xl">Invoice (ID 25)</span>
            </button>
          </Gate>
        </div>

        {/* Role Switcher (ID 195) */}
        <RoleSwitcher />

        {/* Theme Toggle (ID 219) */}
        <Gate id={219}>
          <button 
            onClick={toggleTheme}
            className="p-4 bg-surface-container rounded-[1.5rem] text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all active:scale-90 border border-border shadow-sm"
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
        </Gate>

        <button className="p-4 bg-surface-container rounded-[1.5rem] text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all active:scale-90 border border-border relative shadow-sm">
          <Bell className="w-6 h-6" />
          <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-4 border-surface-container shadow-sm" />
        </button>

        <div className="h-12 w-[1px] bg-border mx-2 opacity-50" />

        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="p-4 bg-destructive/5 rounded-[1.5rem] text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-90 border border-destructive/10 group relative shadow-sm"
          >
            <LogOut className="w-6 h-6" />
            <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 shadow-2xl">Logout Terminal</span>
          </button>
        </div>

        <Gate id={199}>
          <div className="hidden xl:flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 cursor-pointer hover:bg-primary/20 transition-all group relative">
            <MapPin className="w-5 h-5 text-primary" />
            <div className="text-[10px]">
              <p className="text-primary font-black uppercase tracking-widest leading-none">Lakki Main Branch</p>
              <p className="text-primary/60 font-black mt-0.5 uppercase tracking-widest text-[8px]">ID 199 • Switch Store</p>
            </div>
            
            {/* Store Switcher Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
              <p className="px-4 py-2 text-[8px] font-black text-muted-foreground uppercase tracking-widest border-b border-border mb-2">Select Active Node</p>
              {[
                { id: 1, name: 'Lakki Main Branch', status: 'Active' },
                { id: 2, name: 'Salmiya Warehouse', status: 'Ready' },
                { id: 3, name: 'Hawally Retail', status: 'Ready' },
                { id: 4, name: 'Fahaheel Hub', status: 'Offline' }
              ].map(store => (
                <button key={store.id} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted rounded-xl transition-colors group/item">
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{store.name}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Node ID {store.id}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    store.status === 'Active' ? 'bg-green-500/10 text-green-500' : 
                    store.status === 'Ready' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {store.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Gate>
      </div>
    </header>
  );
};
