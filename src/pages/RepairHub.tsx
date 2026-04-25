import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Filter,
  Users,
  Smartphone,
  ClipboardList,
  Kanban,
  LayoutDashboard
} from 'lucide-react';
import api from '../api/client';
import { toast } from 'sonner';

// Child components will be exported separately or defined as internal
import { RepairIntake } from '../components/organisms/RepairIntake';
import { RepairList } from '../components/organisms/RepairList';
import { RepairStats } from '../components/organisms/RepairStats';
import { RepairDetailsModal } from '../components/organisms/RepairDetailsModal';

export const RepairHub = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'active' | 'history' | 'intake'>('dashboard');
  const [repairs, setRepairs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchRepairs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/repairs');
      setRepairs(res.data);
    } catch (err) {
      console.error("Failed to fetch repairs:", err);
      toast.error("Cloud Matrix Error: Could not synchronize repair records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  return (
    <div className="p-8 space-y-10 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif italic tracking-tight leading-none text-white">Repair Hub</h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-4 opacity-60">
            Advanced Troubleshooting & Hardware Restoration Node (ID 61-68)
          </p>
        </div>
        <div className="flex bg-white/5 border border-white/5 rounded-3xl p-1.5 backdrop-blur-xl">
           {[
             { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },
             { id: 'active', icon: Kanban, label: 'Active Pipeline' },
             { id: 'intake', icon: Plus, label: 'Intake Vector' }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-xl shadow-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
             >
               <tab.icon size={16} /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <RepairStats repairs={repairs} />
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8">
                   <RepairList 
                     repairs={repairs.filter(r => r.status !== 'collected' && r.status !== 'cancelled')} 
                     title="Immediate Attention Requred"
                     onRefresh={fetchRepairs}
                   />
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-8">
                   <div className="surface-container p-8 rounded-[3rem] border border-white/5">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Technician Load</h3>
                      <div className="space-y-4">
                        {/* Mock Technician Load */}
                        {[
                          { name: 'Eng. Ahmed', load: 8, status: 'Active' },
                          { name: 'Eng. Sarah', load: 3, status: 'Available' },
                          { name: 'Eng. Mustafa', load: 12, status: 'Overloaded' }
                        ].map((tech, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">{tech.name[5]}</div>
                                <span className="text-[11px] font-bold text-white/80">{tech.name}</span>
                             </div>
                             <div className="text-right text-[10px] font-black uppercase tracking-widest text-white/40">
                                {tech.load} Jobs
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'active' && (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[70vh]">
               {['received', 'diagnosing', 'repairing', 'ready'].map(status => (
                 <div key={status} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                       <div className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white underline decoration-white/20 underline-offset-4">{status.replace('_', ' ')}</span>
                       <span className="ml-auto text-[9px] font-black text-white/20">
                          {repairs.filter(r => r.status === status).length}
                       </span>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-12">
                       {repairs.filter(r => r.status === status).map(repair => (
                          <RepairCard 
                            key={repair._id} 
                            repair={repair} 
                            onRefresh={fetchRepairs} 
                            onClick={() => {
                              setSelectedRepair(repair);
                              setIsDetailsOpen(true);
                            }}
                          />
                       ))}
                       {repairs.filter(r => r.status === status).length === 0 && (
                         <div className="p-8 border border-dashed border-white/5 rounded-3xl text-center">
                            <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">No active units</p>
                         </div>
                       )}
                    </div>
                 </div>
               ))}
             </div>
          )}

          {activeTab === 'intake' && (
            <div className="max-w-4xl mx-auto">
               <RepairIntake onComplete={() => {
                 setActiveTab('active');
                 fetchRepairs();
               }} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isDetailsOpen && selectedRepair && (
          <RepairDetailsModal 
            repair={selectedRepair}
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedRepair(null);
            }}
            onRefresh={fetchRepairs}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const RepairCard = ({ repair, onRefresh, onClick }: { repair: any, onRefresh: () => void, onClick: () => void }) => {
  return (
    <motion.div 
      layout
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="p-6 bg-surface-container-low/40 backdrop-blur-xl border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] font-serif italic text-white/80 mb-1">{repair.deviceInfo.brand} {repair.deviceInfo.model}</p>
          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">#{repair.repairNumber}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all">
           <ChevronRight size={14} />
        </div>
      </div>
      
      <div className="p-3 bg-black/20 rounded-xl mb-4">
         <p className="text-[9px] font-bold text-white/40 leading-relaxed italic line-clamp-2">
            "{repair.problemDescription}"
         </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
         <div className="flex items-center gap-2">
            <Users size={12} className="text-white/20" />
            <span className="text-[9px] font-bold text-white/40">{repair.customerId?.name || 'Guest'}</span>
         </div>
         <div className="text-[10px] font-black text-blue-500">
            {repair.quotedPrice?.toFixed(3) || '0.000'} KD
         </div>
      </div>
    </motion.div>
  );
};

export default RepairHub;
