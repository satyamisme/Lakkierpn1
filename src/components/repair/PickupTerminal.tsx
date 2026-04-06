import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Gate } from '../PermissionGuard';
import { ReadyQueue } from './ReadyQueue';
import { PickupModal } from './PickupModal';

/**
 * ID 141: Pickup Terminal Organism
 * Main dashboard for front-desk staff to handle repair pickups and billing.
 */
export const PickupTerminal: React.FC = () => {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReadyRepairs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/repairs?status=ready');
      if (response.ok) {
        const data = await response.json();
        setRepairs(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyRepairs();
  }, []);

  const handlePickupConfirm = async (id: string, paymentMethod: string) => {
    try {
      const response = await fetch(`/api/repairs/${id}/pickup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod }),
      });
      if (response.ok) {
        fetchReadyRepairs();
      }
    } catch (error) {
      console.error("Pickup confirmation error:", error);
      throw error;
    }
  };

  const filteredRepairs = repairs.filter(r => 
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phoneModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Gate id={141}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
              <div className="bg-green-600 p-3 rounded-2xl text-white shadow-xl shadow-green-200 dark:shadow-none">
                <ShoppingBag className="w-8 h-8" />
              </div>
              Pickup <span className="text-green-600 dark:text-green-400">Terminal</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-2 ml-1">
              ID 141: Billing & Customer Delivery
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search by Name, Model or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-xs font-bold uppercase tracking-widest w-full md:w-80 shadow-sm"
              />
            </div>
            <button className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning Ready Queue...</p>
          </div>
        ) : (
          <ReadyQueue 
            repairs={filteredRepairs} 
            onSelectRepair={setSelectedRepair} 
          />
        )}

        <PickupModal 
          repair={selectedRepair}
          onClose={() => setSelectedRepair(null)}
          onConfirm={handlePickupConfirm}
        />
      </div>
    </Gate>
  );
};
