import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Construction, 
  Lock, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  Loader2,
  Zap,
  ChevronRight,
  Info
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { ATOMIC_NAVIGATION, AtomicPage } from '../constants/navigation';

// Lazy load existing organisms
const POS = lazy(() => import('../pages/POS').then(m => ({ default: m.POS })));
const RepairIntake = lazy(() => import('../pages/RepairIntake').then(m => ({ default: m.RepairIntake })));
const TechnicianDashboard = lazy(() => import('../pages/TechnicianDashboard').then(m => ({ default: m.TechnicianDashboard })));
const InventoryDashboard = lazy(() => import('../pages/InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));
const ReceivingMatrix = lazy(() => import('../pages/ReceivingMatrix').then(m => ({ default: m.ReceivingMatrix })));
const Roles = lazy(() => import('../pages/Roles').then(m => ({ default: m.Roles })));
const POApproval = lazy(() => import('../pages/POApproval').then(m => ({ default: m.POApproval })));
const BinLocations = lazy(() => import('../pages/BinLocations').then(m => ({ default: m.BinLocations })));
const StockValuation = lazy(() => import('../pages/StockValuation').then(m => ({ default: m.StockValuation })));
const LandedCost = lazy(() => import('../pages/LandedCost').then(m => ({ default: m.LandedCost })));
const SupplierRMA = lazy(() => import('../pages/SupplierRMA').then(m => ({ default: m.SupplierRMA })));
const StockRecon = lazy(() => import('../pages/StockRecon').then(m => ({ default: m.StockRecon })));
const Wishlist = lazy(() => import('../pages/Wishlist').then(m => ({ default: m.Wishlist })));
const Blacklist = lazy(() => import('../pages/Blacklist').then(m => ({ default: m.Blacklist })));
const PurchaseOrders = lazy(() => import('../pages/PurchaseOrders').then(m => ({ default: m.PurchaseOrders })));
const ZReports = lazy(() => import('../pages/ZReports').then(m => ({ default: m.ZReports })));
const DeviceCatalog = lazy(() => import('../pages/DeviceCatalog').then(m => ({ default: m.DeviceCatalog })));
const StockAdjustment = lazy(() => import('../pages/StockAdjustment').then(m => ({ default: m.StockAdjustment })));
const LabelPrinting = lazy(() => import('../pages/LabelPrinting').then(m => ({ default: m.LabelPrinting })));
const StockSnapshot = lazy(() => import('../pages/StockSnapshot').then(m => ({ default: m.StockSnapshot })));
const DataLake = lazy(() => import('../pages/DataLake').then(m => ({ default: m.DataLake })));
const FeatureToggleBoard = lazy(() => import('./FeatureToggleBoard').then(m => ({ default: m.FeatureToggleBoard })));
const Compliance = lazy(() => import('../pages/Compliance').then(m => ({ default: m.Compliance })));
const QualityControl = lazy(() => import('../pages/QualityControl').then(m => ({ default: m.QualityControl })));
const Profile = lazy(() => import('../pages/Profile').then(m => ({ default: m.Profile })));
const Staff = lazy(() => import('../pages/Staff').then(m => ({ default: m.Staff })));
const SecurityConfig = lazy(() => import('../pages/SecurityConfig').then(m => ({ default: m.SecurityConfig })));
const BulkUserInvite = lazy(() => import('../pages/BulkUserInvite').then(m => ({ default: m.BulkUserInvite })));
const PasswordPolicy = lazy(() => import('../pages/PasswordPolicy').then(m => ({ default: m.PasswordPolicy })));
const Cockpit = lazy(() => import('../pages/Cockpit').then(m => ({ default: m.Cockpit })));
const ExecutiveComparison = lazy(() => import('../pages/ExecutiveComparison').then(m => ({ default: m.ExecutiveComparison })));
const ExecutiveAnomalies = lazy(() => import('../pages/ExecutiveAnomalies').then(m => ({ default: m.ExecutiveAnomalies })));
const ExecutiveAffinity = lazy(() => import('../pages/ExecutiveAffinity').then(m => ({ default: m.ExecutiveAffinity })));
const ExecutiveInfrastructure = lazy(() => import('../pages/ExecutiveInfrastructure').then(m => ({ default: m.ExecutiveInfrastructure })));
const CommandCenter = lazy(() => import('../pages/CommandCenter').then(m => ({ default: m.CommandCenter })));
const Customer360 = lazy(() => import('../pages/Customer360').then(m => ({ default: m.Customer360 })));
const Governance = lazy(() => import('../pages/Governance').then(m => ({ default: m.Governance })));
const EnterpriseHub = lazy(() => import('../pages/EnterpriseHub').then(m => ({ default: m.EnterpriseHub })));
const IoTDashboard = lazy(() => import('../pages/IoTDashboard').then(m => ({ default: m.IoTDashboard })));
const Omnichannel = lazy(() => import('../pages/Omnichannel').then(m => ({ default: m.Omnichannel })));
const ExtendedFeatures = lazy(() => import('../pages/ExtendedFeatures').then(m => ({ default: m.ExtendedFeatures })));
const POSLoyalty = lazy(() => import('../pages/POSLoyalty').then(m => ({ default: m.POSLoyalty })));
const POSLayaway = lazy(() => import('../pages/POSLayaway').then(m => ({ default: m.POSLayaway })));
const POSSync = lazy(() => import('../pages/POSSync').then(m => ({ default: m.POSSync })));
const POSConfiguration = lazy(() => import('../pages/POSConfiguration').then(m => ({ default: m.POSConfiguration })));
const FinanceDashboard = lazy(() => import('../pages/FinanceDashboard').then(m => ({ default: m.FinanceDashboard })));
const Marketing = lazy(() => import('../pages/Marketing').then(m => ({ default: m.Marketing })));
const StaffPerformance = lazy(() => import('../pages/StaffPerformance').then(m => ({ default: m.StaffPerformance })));
const Stores = lazy(() => import('../pages/Stores').then(m => ({ default: m.Stores })));
const HRDashboard = lazy(() => import('../pages/HRDashboard').then(m => ({ default: m.HRDashboard })));
const Hardware = lazy(() => import('../pages/Hardware').then(m => ({ default: m.Hardware })));
const ImeiTimeline = lazy(() => import('../pages/ImeiTimeline').then(m => ({ default: m.ImeiTimeline })));
const InventoryIntelligence = lazy(() => import('../pages/InventoryIntelligence').then(m => ({ default: m.InventoryIntelligence })));
const Returns = lazy(() => import('../pages/Returns').then(m => ({ default: m.Returns })));
const GiftCards = lazy(() => import('../pages/GiftCards').then(m => ({ default: m.GiftCards })));
const Layaway = lazy(() => import('../pages/Layaway').then(m => ({ default: m.Layaway })));
const ShiftHandover = lazy(() => import('../pages/ShiftHandover').then(m => ({ default: m.ShiftHandover })));
const Warehouse = lazy(() => import('../pages/Warehouse').then(m => ({ default: m.Warehouse })));
const AnalyticsDashboard = lazy(() => import('../pages/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const Commission = lazy(() => import('../pages/Commission').then(m => ({ default: m.Commission })));
const SupplierPortal = lazy(() => import('../pages/SupplierPortal').then(m => ({ default: m.SupplierPortal })));
const CustomerPortal = lazy(() => import('../pages/CustomerPortal').then(m => ({ default: m.CustomerPortal })));
const MasterFeatureGrid = lazy(() => import('../pages/MasterFeatureGrid').then(m => ({ default: m.MasterFeatureGrid })));
const RepairHub = lazy(() => import('../pages/RepairHub').then(m => ({ default: m.RepairHub })));
const CycleCountManager = lazy(() => import('../pages/CycleCountManager').then(m => ({ default: m.CycleCountManager })));
const CycleCountStaff = lazy(() => import('../pages/CycleCountStaff').then(m => ({ default: m.CycleCountStaff })));


const SerialManagement = lazy(() => import('../pages/SerialManagement').then(m => ({ default: m.SerialManagement })));

interface ModuleRendererProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  onAddProductClick: () => void;
}

const FeaturePagePlaceholder = ({ page }: { page: AtomicPage }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="min-h-[80vh] flex items-center justify-center p-8"
  >
    <div className="max-w-4xl w-full bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
      <div className="p-12 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10">
            <Zap className="w-8 h-8 text-black fill-black" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">{page.label}</h2>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Atomic Feature Page #{page.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-black text-blue-500 uppercase tracking-widest">
          <Construction className="w-4 h-4" /> Under Construction
        </div>
      </div>

      <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Functional Description</h3>
            <p className="text-white/60 text-sm leading-relaxed font-medium">
              {page.description}
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Linked Feature IDs</h3>
            <div className="flex flex-wrap gap-2">
              {page.featureIds.map(id => (
                <div key={id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-white/40">
                  ID {id}
                </div>
              ))}
              {page.featureIds.length === 0 && <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">None</span>}
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-3xl p-8 border border-white/5 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/40">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Security Gated</p>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Role-based access enabled</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Audit Enabled</p>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">All interactions logged</p>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-white/5">
            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] leading-relaxed">
              This atomic page is part of the Lakki Terminal OS v2.6 expansion. 
              The UI Architect is currently mapping the data layer for this module.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6 text-[9px] font-black text-white/20 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Frontend: Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            <span>Backend: Mapping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <span>QA: Pending</span>
          </div>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
        >
          Return to Previous <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  </motion.div>
);

export const ModuleRenderer: React.FC<ModuleRendererProps> = ({ activeModule, onModuleChange, onAddProductClick }) => {
  const { user } = useAuth();

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">
        Initializing Obsidian Module...
      </p>
    </div>
  );

  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        {/* Core & Landing */}
        <Route path="command-center" element={<CommandCenter />} />
        <Route path="/" element={<CommandCenter />} />

        {/* Map Atomic Pages */}
        {ATOMIC_NAVIGATION.map(category => 
          category.pages.map(page => {
            // Map specific paths to existing components if available
            if (page.path === 'pos/grid') return <Route key={page.id} path={page.path} element={<POS onAddProductClick={onAddProductClick} />} />;
            if (page.path === 'pos/returns') return <Route key={page.id} path={page.path} element={<Returns />} />;
            if (page.path === 'pos/loyalty') return <Route key={page.id} path={page.path} element={<POSLoyalty />} />;
            if (page.path === 'pos/layaway') return <Route key={page.id} path={page.path} element={<POSLayaway />} />;
            if (page.path === 'pos/tax') return <Route key={page.id} path={page.path} element={<POSConfiguration />} />;
            if (page.path === 'pos/sync') return <Route key={page.id} path={page.path} element={<POSSync />} />;
            if (page.path.startsWith('pos/')) return <Route key={page.id} path={page.path} element={<POS onAddProductClick={onAddProductClick} />} />;
            if (page.path === 'repairs' || page.path.startsWith('repairs/')) return <Route key={page.id} path={page.path} element={<RepairHub />} />;
            if (page.path === 'auth/roles' || page.path === 'auth/overrides') return <Route key={page.id} path={page.path} element={<Roles />} />;
            if (page.path === 'inventory/po-approval') return <Route key={page.id} path={page.path} element={<POApproval />} />;
            if (page.path === 'inventory/purchase-orders' || page.path === 'inventory/pos') return <Route key={page.id} path={page.path} element={<PurchaseOrders />} />;
            if (page.path === 'inventory/adjust') return <Route key={page.id} path={page.path} element={<StockAdjustment />} />;
            if (page.path === 'inventory/labels') return <Route key={page.id} path={page.path} element={<LabelPrinting />} />;
            if (page.path === 'inventory/snapshot') return <Route key={page.id} path={page.path} element={<StockSnapshot />} />;
            if (page.path === 'inventory/bins') return <Route key={page.id} path={page.path} element={<BinLocations />} />;
            if (page.path === 'gov/toggles') return <Route key={page.id} path={page.path} element={<FeatureToggleBoard userId={user?.id || "65f1a2b3c4d5e6f7a8b9c0d1"} />} />;
            if (page.path === 'gov/reports' || page.path === 'gov/z-reports') return <Route key={page.id} path={page.path} element={<ZReports />} />;
            if (page.path === 'gov/compliance' || page.path === 'gov/audit' || page.path === 'gov/vat') return <Route key={page.id} path={page.path} element={<Compliance />} />;
            if (page.path === 'inventory/qc' || page.path === 'repairs/qc') return <Route key={page.id} path={page.path} element={<QualityControl />} />;
            if (page.path === 'auth/profile' || page.path === 'auth/2fa') return <Route key={page.id} path={page.path} element={<Profile />} />;
            if (page.path === 'staff') return <Route key={page.id} path={page.path} element={<Staff />} />;
            if (page.path === 'auth/ip-whitelist' || page.path === 'auth/geofence') return <Route key={page.id} path={page.path} element={<SecurityConfig />} />;
            if (page.path === 'auth/bulk-invite') return <Route key={page.id} path={page.path} element={<BulkUserInvite />} />;
            if (page.path === 'auth/password-policy') return <Route key={page.id} path={page.path} element={<PasswordPolicy />} />;
            if (page.path === 'exec/revenue') return <Route key={page.id} path={page.path} element={<Cockpit />} />;
            if (page.path === 'exec/comparison') return <Route key={page.id} path={page.path} element={<ExecutiveComparison />} />;
            if (page.path === 'exec/anomalies') return <Route key={page.id} path={page.path} element={<ExecutiveAnomalies />} />;
            if (page.path === 'exec/affinity') return <Route key={page.id} path={page.path} element={<ExecutiveAffinity />} />;
            if (page.path === 'exec/routing') return <Route key={page.id} path={page.path} element={<ExecutiveInfrastructure type="routing" />} />;
            if (page.path === 'exec/coalescing') return <Route key={page.id} path={page.path} element={<ExecutiveInfrastructure type="coalescing" />} />;
            if (page.path === 'inventory/matrix' || page.path === 'inventory/transfer') return <Route key={page.id} path={page.path} element={<InventoryDashboard />} />;
            if (page.path === 'inventory/intake') return <Route key={page.id} path={page.path} element={<ReceivingMatrix />} />;
            if (page.path === 'inventory/serial-matrix' || page.path === 'inventory/imei-reg') return <Route key={page.id} path={page.path} element={<SerialManagement />} />;
            if (page.path === 'repairs/assignment' || page.path === 'repairs/tech-stats') return <Route key={page.id} path={page.path} element={<TechnicianDashboard />} />;
            
            // CRM & Omni
            if (page.path === 'crm/360') return <Route key={page.id} path={page.path} element={<Customer360 />} />;
            if (page.path === 'crm/wishlist') return <Route key={page.id} path={page.path} element={<Wishlist />} />;
            if (page.path === 'crm/blacklist') return <Route key={page.id} path={page.path} element={<Blacklist />} />;
            if (page.path === 'crm/mandoob' || page.path === 'crm/sync') return <Route key={page.id} path={page.path} element={<Omnichannel />} />;
            if (page.path === 'crm/iot') return <Route key={page.id} path={page.path} element={<IoTDashboard />} />;
            if (page.path === 'crm/portal') return <Route key={page.id} path={page.path} element={<CustomerPortal />} />;
            if (page.path === 'crm/marketing' || page.path === 'crm/whatsapp' || page.path === 'crm/sms' || page.path === 'crm/email') return <Route key={page.id} path={page.path} element={<Marketing />} />;

            // Governance & Finance
            if (page.path === 'gov/toggles') return <Route key={page.id} path={page.path} element={<MasterFeatureGrid />} />;
            if (page.path === 'gov/anomalies') return <Route key={page.id} path={page.path} element={<ExecutiveAnomalies />} />;
            if (page.path === 'gov/expenses' || page.path === 'gov/payroll') return <Route key={page.id} path={page.path} element={<FinanceDashboard />} />;
            if (page.path === 'gov/staff-score') return <Route key={page.id} path={page.path} element={<StaffPerformance />} />;
            if (page.path === 'gov/profile') return <Route key={page.id} path={page.path} element={<Stores />} />;
            if (page.path.startsWith('gov/health') || page.path.startsWith('gov/backups') || page.path.startsWith('gov/sessions')) return <Route key={page.id} path={page.path} element={<EnterpriseHub />} />;
            if (page.path === 'gov/audit' || page.path === 'gov/compliance') return <Route key={page.id} path={page.path} element={<Governance />} />;

            // Inventory & Logistics
            if (page.path === 'inventory/analytics' || page.path === 'inventory/valuation') return <Route key={page.id} path={page.path} element={<StockValuation />} />;
            if (page.path === 'inventory/landed-cost') return <Route key={page.id} path={page.path} element={<LandedCost />} />;
            if (page.path === 'inventory/rma') return <Route key={page.id} path={page.path} element={<SupplierRMA />} />;
            if (page.path === 'inventory/recon') return <Route key={page.id} path={page.path} element={<StockRecon />} />;
            if (page.path === 'inventory/imei-log') return <Route key={page.id} path={page.path} element={<ImeiTimeline />} />;
            if (page.path === 'inventory/warehouse') return <Route key={page.id} path={page.path} element={<Warehouse />} />;
            if (page.path === 'inventory/suppliers') return <Route key={page.id} path={page.path} element={<SupplierPortal />} />;
            if (page.path === 'inventory/cycle-count') return <Route key={page.id} path={page.path} element={<CycleCountStaff />} />;
            if (page.path === 'inventory/reconciliation') return <Route key={page.id} path={page.path} element={<CycleCountManager />} />;

            // Extended
            if (page.path.startsWith('ext/')) return <Route key={page.id} path={page.path} element={<ExtendedFeatures />} />;
            if (page.path === 'intelligence/data-lake' || page.path === 'vault') return <Route key={page.id} path={page.path} element={<DataLake />} />;

            // Specifics & Placeholders
            if (page.path === 'pos/gift-cards') return <Route key={page.id} path={page.path} element={<GiftCards />} />;
            if (page.path === 'gov/handover') return <Route key={page.id} path={page.path} element={<ShiftHandover />} />;
            if (page.path === 'gov/commissions') return <Route key={page.id} path={page.path} element={<Commission />} />;
            if (page.path === 'hr/dashboard') return <Route key={page.id} path={page.path} element={<HRDashboard />} />;
            if (page.path === 'pos/hardware') return <Route key={page.id} path={page.path} element={<Hardware />} />;
            if (page.path === 'pos/stats') return <Route key={page.id} path={page.path} element={<AnalyticsDashboard />} />;

            // Default to placeholder
            return <Route key={page.id} path={page.path} element={<FeaturePagePlaceholder page={page} />} />;
          })
        )}

        {/* Legacy / Compatibility Routes */}
        <Route path="pos" element={<POS onAddProductClick={onAddProductClick} />} />
        <Route path="repairs" element={<RepairHub />} />
        <Route path="inventory" element={<InventoryDashboard />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/command-center" replace />} />
      </Routes>
    </Suspense>
  );
};
