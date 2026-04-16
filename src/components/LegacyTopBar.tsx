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
  Plus,
  ArrowLeft,
  Zap,
  Activity,
  Globe,
  Clock
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Gate, usePermissions } from './PermissionGuard';
import { RoleSwitcher } from './RoleSwitcher';
import { printThermalReceipt, printA4Invoice } from '../utils/documentService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface TopBarProps {
  activeModule: string;
  onSearchClick: () => void;
  onAddProductClick: () => void;
  onToggleActivityFeed: () => void;
}

/**
 * ID 219, 195: Control Center (TopBar.tsx)
 * Left: Breadcrumbs & Back Navigation.
 * Center: Global Search (Ctrl+K).
 * Right: Theme Toggle (ID 219), Role Switcher (ID 195), and Quick-Action Print (ID 21, 25).
 */
export const TopBar: React.FC<TopBarProps> = ({ activeModule, onSearchClick, onAddProductClick, onToggleActivityFeed }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <header className="flex flex-col sticky top-0 z-40">
      {/* System Health Bar */}
      <div className="h-10 bg-surface-container-lowest border-b border-border flex items-center justify-between px-10 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-foreground/80">System: Operational</span>
          </span>
          <div className="h-3 w-[1px] bg-border opacity-30" />
          <span className="flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Load: 12%
          </span>
        </div>
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2 text-primary">
            <Clock className="w-3 h-3" />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <div className="h-3 w-[1px] bg-border opacity-30" />
          <span className="opacity-40">ID 232: Health Monitor</span>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="h-24 bg-surface-container-lowest/80 border-b border-border flex items-center justify-between px-10 transition-all duration-500 backdrop-blur-3xl">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
            <Home className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/')} />
            <ChevronRight className="w-3 h-3" />
            <span className="font-serif italic lowercase text-lg tracking-normal opacity-100 text-foreground">
              {pathSegments.length > 0 ? pathSegments[0].replace(/-/g, ' ') : 'dashboard'}
            </span>
            {pathSegments.length > 1 && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary tracking-[0.4em] font-black">
                  {pathSegments[pathSegments.length - 1].replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center: Global Search Pill */}
        <div className="flex-1 max-w-2xl px-12 flex justify-center">
          <Gate id={3}>
            <div 
              onClick={onSearchClick}
              className="glass px-10 py-4 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-6 cursor-pointer border border-white/10 hover:border-primary/30 transition-all shadow-2xl bg-white/5 backdrop-blur-md group"
            >
              <Search className="w-5 h-5 text-primary group-hover:rotate-90 transition-transform duration-500" />
              <span className="opacity-60">Search all 367 features (Ctrl+K)</span>
              <div className="flex items-center gap-2 ml-4">
                <kbd className="px-2 py-1 bg-muted rounded-md text-[8px] font-black text-muted-foreground border border-border shadow-sm">CTRL</kbd>
                <kbd className="px-2 py-1 bg-muted rounded-md text-[8px] font-black text-muted-foreground border border-border shadow-sm">K</kbd>
              </div>
            </div>
          </Gate>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6 flex-1 justify-end">
          <div className="flex items-center gap-3 border-r border-border pr-6">
            <Gate id={122}>
              <button 
                onClick={onAddProductClick}
                className="p-4 bg-primary/5 rounded-2xl text-primary hover:bg-primary hover:text-primary-foreground transition-all active:scale-90 border border-primary/10 group relative shadow-sm"
              >
                <Plus className="w-6 h-6" />
                <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 shadow-2xl">Add Product</span>
              </button>
            </Gate>
            <button 
              onClick={onToggleActivityFeed}
              className="p-4 bg-surface-container rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all active:scale-90 border border-border relative shadow-sm group"
            >
              <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 shadow-2xl">System Pulse</span>
            </button>
            <button 
              onClick={toggleTheme}
              className="p-4 bg-surface-container rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all active:scale-90 border border-border shadow-sm"
            >
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="p-4 bg-destructive/5 rounded-2xl text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-90 border border-destructive/10 group relative shadow-sm"
          >
            <LogOut className="w-6 h-6" />
            <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 shadow-2xl">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
