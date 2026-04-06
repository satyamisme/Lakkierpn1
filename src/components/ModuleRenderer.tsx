import React, { lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { 
  Construction, 
  Lock, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  Loader2
} from 'lucide-react';

// Lazy load existing organisms
const ProductGrid = lazy(() => import('./pos/organisms/ProductGrid').then(m => ({ default: m.ProductGrid })));
const RepairDashboard = lazy(() => import('./repair/RepairDashboard').then(m => ({ default: m.RepairDashboard })));
const InventoryManager = lazy(() => import('./inventory/InventoryManager').then(m => ({ default: m.InventoryManager })));
const TechnicianWorkspace = lazy(() => import('./repair/TechnicianWorkspace').then(m => ({ default: m.TechnicianWorkspace })));
const PickupTerminal = lazy(() => import('./repair/PickupTerminal').then(m => ({ default: m.PickupTerminal })));
const FeatureToggleBoard = lazy(() => import('./FeatureToggleBoard').then(m => ({ default: m.FeatureToggleBoard })));

// New Dashboards
const FinanceDashboard = lazy(() => import('./finance/FinanceDashboard').then(m => ({ default: m.FinanceDashboard })));
const HRDashboard = lazy(() => import('./hr/HRDashboard').then(m => ({ default: m.HRDashboard })));
const CRMDashboard = lazy(() => import('./customers/CRMDashboard').then(m => ({ default: m.CRMDashboard })));
const AnalyticsDashboard = lazy(() => import('./analytics/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Sub-modules
const SalesHistory = lazy(() => import('./pos/SalesHistory').then(m => ({ default: m.SalesHistory })));
const QCTerminal = lazy(() => import('./repair/QCTerminal').then(m => ({ default: m.QCTerminal })));

interface ModuleRendererProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

/**
 * ID 184: The Stage (ModuleRenderer.tsx)
 * Switch statement for all 8 folders.
 * Professional 'Feature Coming Soon' placeholder for unimplemented modules.
 */
export const ModuleRenderer: React.FC<ModuleRendererProps> = ({ activeModule, onModuleChange }) => {
  
  const ComingSoon = ({ title, id }: { title: string, id: number }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-card rounded-[3rem] border border-border shadow-2xl shadow-primary/5 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative">
        <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-8 mx-auto relative">
          <Construction className="w-10 h-10" />
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-xl">
            Under Dev
          </div>
        </div>

        <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter mb-4">
          {title} <span className="text-primary">Terminal</span>
        </h2>
        
        <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px] mb-8 max-w-md mx-auto leading-relaxed">
          This module (ID {id}) is currently being atomized by the Senior UI Architect. 
          Expected deployment: Q2 2026.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <Lock className="w-3 h-3" /> Encrypted
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <ShieldAlert className="w-3 h-3" /> Gated
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <Clock className="w-3 h-3" /> Scheduled
          </div>
        </div>

        <button 
          onClick={() => onModuleChange('pos')}
          className="mt-12 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20 group"
        >
          Return to POS Terminal
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <Loader2 className="w-16 h-16 text-primary animate-spin" />
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">
        Initializing Enterprise Module...
      </p>
    </div>
  );

  return (
    <Suspense fallback={<LoadingState />}>
      {(() => {
        switch (activeModule) {
          // POS Folder
          case 'pos': return <ProductGrid />;
          case 'payments': return <ComingSoon title="Payment Matrix" id={12} />;
          case 'history': return <SalesHistory />;
          
          // Repairs Folder
          case 'repairs': return <RepairDashboard />;
          case 'bench': return <TechnicianWorkspace />;
          case 'qc': return <QCTerminal />;
          case 'pickup': return <PickupTerminal />;
          
          // Inventory Folder
          case 'inventory': return <InventoryManager />;
          case 'alerts': return <ComingSoon title="Stock Alarms" id={34} />;
          case 'costs': return <ComingSoon title="Cost Analysis" id={29} />;
          
          // Finance Folder
          case 'finance': return <FinanceDashboard />;
          case 'expenses': return <FinanceDashboard />;
          
          // HR Folder
          case 'staff': return <HRDashboard />;
          case 'attendance': return <HRDashboard />;
          case 'payroll': return <HRDashboard />;
          
          // Customers Folder
          case 'customers': return <CRMDashboard />;
          case 'loyalty': return <CRMDashboard />;
          
          // Analytics Folder
          case 'analytics': return <AnalyticsDashboard />;
          case 'logs': return <AnalyticsDashboard />;
          
          // Admin Folder
          case 'toggles': return <FeatureToggleBoard userId="65f1a2b3c4d5e6f7a8b9c0d1" />;
          case 'roles': return <AdminDashboard />;
          case 'profile': return <AdminDashboard />;
          case 'health': return <AdminDashboard />;
          
          default: return <ComingSoon title="Module Not Found" id={404} />;
        }
      })()}
    </Suspense>
  );
};
