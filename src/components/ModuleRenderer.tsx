import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Construction, 
  Lock, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  Loader2
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

// Lazy load existing organisms
const POS = lazy(() => import('../pages/POS').then(m => ({ default: m.POS })));
const RepairIntake = lazy(() => import('../pages/RepairIntake').then(m => ({ default: m.RepairIntake })));
const TechnicianDashboard = lazy(() => import('../pages/TechnicianDashboard').then(m => ({ default: m.TechnicianDashboard })));
const InventoryDashboard = lazy(() => import('../pages/InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));
const AdminReports = lazy(() => import('../pages/AdminReports').then(m => ({ default: m.AdminReports })));
const FeatureToggleBoard = lazy(() => import('./FeatureToggleBoard').then(m => ({ default: m.FeatureToggleBoard })));

// New Dashboards
const FinanceDashboard = lazy(() => import('../pages/FinanceDashboard').then(m => ({ default: m.FinanceDashboard })));
const HRDashboard = lazy(() => import('../pages/HRDashboard').then(m => ({ default: m.HRDashboard })));
const Customer360 = lazy(() => import('../pages/Customer360').then(m => ({ default: m.Customer360 })));
const AnalyticsDashboard = lazy(() => import('../pages/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const IoTDashboard = lazy(() => import('../pages/IoTDashboard').then(m => ({ default: m.IoTDashboard })));
const ShiftHandover = lazy(() => import('../pages/ShiftHandover').then(m => ({ default: m.ShiftHandover })));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Missing Modules
const Warehouse = lazy(() => import('../pages/Warehouse'));
const SupplierPortal = lazy(() => import('../pages/SupplierPortal'));
const BulkOperations = lazy(() => import('../pages/BulkOperations'));
const Omnichannel = lazy(() => import('../pages/Omnichannel'));
const StaffPerformance = lazy(() => import('../pages/StaffPerformance'));
const Compliance = lazy(() => import('../pages/Compliance'));
const QualityControl = lazy(() => import('../pages/QualityControl'));
const CustomerPortal = lazy(() => import('../pages/CustomerPortal'));
const ImeiTimeline = lazy(() => import('../pages/ImeiTimeline'));
const InventoryIntelligence = lazy(() => import('../pages/InventoryIntelligence'));
const Marketing = lazy(() => import('../pages/Marketing'));
const CustomerGroups = lazy(() => import('../pages/CustomerGroups'));
const Returns = lazy(() => import('../pages/Returns'));
const GiftCards = lazy(() => import('../pages/GiftCards'));
const Layaway = lazy(() => import('../pages/Layaway'));
const Commission = lazy(() => import('../pages/Commission'));
const Hardware = lazy(() => import('../pages/Hardware'));

// Sub-modules
const SalesHistory = lazy(() => import('./pos/SalesHistory').then(m => ({ default: m.SalesHistory })));
const QCTerminal = lazy(() => import('./repair/QCTerminal').then(m => ({ default: m.QCTerminal })));

interface ModuleRendererProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

/**
 * ID 184: The Stage (ModuleRenderer.tsx)
 * Refactored to use React Router Routes for sub-modules.
 */
export const ModuleRenderer: React.FC<ModuleRendererProps> = ({ activeModule, onModuleChange }) => {
  const { user } = useAuth();
  
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
      <Routes>
        {/* POS Folder */}
        <Route path="pos" element={<POS />} />
        <Route path="payments" element={<ComingSoon title="Payment Matrix" id={12} />} />
        <Route path="history" element={<SalesHistory />} />
        
        {/* Repairs Folder */}
        <Route path="repairs" element={<RepairIntake />} />
        <Route path="bench" element={<TechnicianDashboard />} />
        <Route path="qc" element={<QCTerminal />} />
        <Route path="pickup" element={<ComingSoon title="Pickup Terminal" id={141} />} />
        
        {/* Inventory Folder */}
        <Route path="inventory" element={<InventoryDashboard />} />
        <Route path="alerts" element={<ComingSoon title="Stock Alarms" id={34} />} />
        <Route path="costs" element={<ComingSoon title="Cost Analysis" id={29} />} />
        
        {/* Finance Folder */}
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="expenses" element={<FinanceDashboard />} />
        
        {/* HR Folder */}
        <Route path="hr" element={<HRDashboard />} />
        <Route path="staff" element={<HRDashboard />} />
        <Route path="attendance" element={<HRDashboard />} />
        <Route path="payroll" element={<HRDashboard />} />
        <Route path="shift" element={<ShiftHandover />} />
        <Route path="handover" element={<ShiftHandover />} />
        
        {/* Customers Folder */}
        <Route path="crm" element={<Customer360 />} />
        <Route path="customers" element={<Customer360 />} />
        <Route path="loyalty" element={<Customer360 />} />
        
        {/* Analytics Folder */}
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="intelligence" element={<InventoryIntelligence />} />
        <Route path="logs" element={<AdminReports />} />

        {/* IoT Folder */}
        <Route path="iot" element={<IoTDashboard />} />
        
        {/* Logistics & Warehouse */}
        <Route path="warehouse" element={<Warehouse />} />
        <Route path="suppliers" element={<SupplierPortal />} />
        <Route path="bulk" element={<BulkOperations />} />
        <Route path="omnichannel" element={<Omnichannel />} />
        <Route path="qc-terminal" element={<QualityControl />} />
        <Route path="returns" element={<Returns />} />

        {/* Marketing & CRM */}
        <Route path="marketing" element={<Marketing />} />
        <Route path="gift-cards" element={<GiftCards />} />
        <Route path="layaway" element={<Layaway />} />
        <Route path="customer-groups" element={<CustomerGroups />} />
        <Route path="customer-portal" element={<CustomerPortal />} />
        <Route path="imei-timeline" element={<ImeiTimeline />} />

        {/* Performance */}
        <Route path="performance" element={<StaffPerformance />} />
        <Route path="commission" element={<Commission />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="hardware" element={<Hardware />} />

        {/* Admin Folder */}
        <Route path="toggles" element={<FeatureToggleBoard userId={user?.id || "65f1a2b3c4d5e6f7a8b9c0d1"} />} />
        <Route path="roles" element={<AdminDashboard />} />
        <Route path="profile" element={<AdminDashboard />} />
        <Route path="health" element={<AdminDashboard />} />
        
        {/* Default / Fallback */}
        <Route path="/" element={<Navigate to="/pos" replace />} />
        <Route path="*" element={<ComingSoon title="Module Not Found" id={404} />} />
      </Routes>
    </Suspense>
  );
};
