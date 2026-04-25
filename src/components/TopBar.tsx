import React from 'react';
import { 
  Search, 
  Bell, 
  User, 
  Moon, 
  Sun, 
  Plus, 
  Activity,
  Cpu,
  Network,
  LogOut,
  ChevronDown,
  ChevronRight,
  Command,
  Printer,
  Scan
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation, Link } from 'react-router-dom';
import { useHardwareStore } from '../store/useHardwareStore';

interface TopBarProps {
  activeModule: string;
  onSearchClick: () => void;
  onAddProductClick: () => void;
  onToggleActivityFeed: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  activeModule, 
  onSearchClick, 
  onAddProductClick,
  onToggleActivityFeed 
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { status } = useHardwareStore();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const isPrinterOnline = status?.printer === 'online';
  const isScannerOnline = status?.scanner === 'online';

  return (
    <header className="h-14 px-6 flex items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-40">
      {/* Left: Module Context & Breadcrumbs */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <nav className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">
            <Link to="/" className="hover:text-blue-500 transition-colors">Obsidian</Link>
            {pathnames.map((name, index) => (
              <React.Fragment key={name}>
                <ChevronRight className="w-2 h-2 text-white/10" />
                <span className={index === pathnames.length - 1 ? "text-blue-500/60" : ""}>{name.replace('-', ' ')}</span>
              </React.Fragment>
            ))}
          </nav>
          <div className="flex items-center gap-3 mt-0.5">
            <h2 className="text-sm font-bold tracking-tight uppercase text-white/90">
              {activeModule.split('/').pop()?.replace('-', ' ')}
            </h2>
            <div className="flex gap-0.5">
              <div className={`w-1 h-1 rounded-full ${isPrinterOnline ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} title="Printer Status" />
              <div className={`w-1 h-1 rounded-full ${isScannerOnline ? 'bg-emerald-500' : 'bg-white/10'}`} title="Scanner Status" />
            </div>
          </div>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-lg mx-12">
        <button 
          onClick={onSearchClick}
          className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center justify-between group hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <Search className="w-3.5 h-3.5 text-white/20 group-hover:text-blue-500 transition-colors" />
            <span className="text-[10px] font-bold text-white/30 tracking-tight uppercase">Quick Search...</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 rounded-md border border-white/5">
            <Command className="w-2.5 h-2.5 text-white/20" />
            <span className="text-[9px] font-black text-white/20">K</span>
          </div>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Hardware Status */}
        <div className="hidden xl:flex items-center gap-5 px-4 py-1.5 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-bold uppercase tracking-widest text-white/20">HARDWARE</span>
            <div className="flex items-center gap-3">
              <Printer className={`w-3 h-3 ${isPrinterOnline ? 'text-emerald-500' : 'text-white/10'}`} />
              <Scan className={`w-3 h-3 ${isScannerOnline ? 'text-blue-500' : 'text-white/10'}`} />
            </div>
          </div>
          <div className="w-px h-5 bg-white/5" />
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-bold uppercase tracking-widest text-white/20">LATENCY</span>
            <div className="flex items-center gap-1">
              <Network className="w-2.5 h-2.5 text-emerald-500/60" />
              <span className="text-[9px] font-mono font-bold text-white/60">12ms</span>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={onToggleActivityFeed}
            className="p-2 hover:bg-white/5 rounded-lg transition-all relative group"
          >
            <Activity className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-[#0A0A0A]" />
          </button>
          
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-white/5 rounded-lg transition-all group"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-white/40 group-hover:text-white" /> : <Moon className="w-4 h-4 text-white/40 group-hover:text-white" />}
          </button>

          <div className="w-px h-6 bg-white/5 mx-1" />

          {/* User Profile - Compact & Pro */}
          <div className="flex items-center gap-3 pl-1.5 pr-1 py-1 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black tracking-tight text-white/80">{user?.email?.split('@')[0]}</span>
              <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Root Admin</span>
            </div>
            <button className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform">
              {user?.email?.[0].toUpperCase() || 'U'}
            </button>
          </div>

          <button 
            onClick={logout}
            className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
