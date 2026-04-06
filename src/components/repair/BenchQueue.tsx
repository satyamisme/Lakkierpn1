import React from 'react';
import { Play, Clock, User, Smartphone, Hash } from 'lucide-react';
import { STATUS_LABELS } from '../../utils/statusTransitions';

interface Repair {
  _id: string;
  customerName: string;
  phoneModel: string;
  imei: string;
  status: string;
  createdAt: string;
}

interface BenchQueueProps {
  repairs: Repair[];
  onStartRepair: (id: string) => void;
  onSelectRepair: (repair: Repair) => void;
}

/**
 * ID 63: Bench Queue Molecule
 * High-density table showing all 'Pending' repairs.
 */
export const BenchQueue: React.FC<BenchQueueProps> = ({ repairs, onStartRepair, onSelectRepair }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer / Device</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Received</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {repairs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                  No repairs in queue.
                </td>
              </tr>
            ) : (
              repairs.map((repair) => (
                <tr 
                  key={repair._id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectRepair(repair)}
                >
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-gray-400 group-hover:text-indigo-600 transition-colors">#{repair._id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
                        <User className="w-3 h-3 text-gray-400" /> {repair.customerName}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mt-1">
                        <Smartphone className="w-3 h-3" /> {repair.phoneModel}
                        <span className="mx-1 opacity-20">|</span>
                        <Hash className="w-3 h-3" /> {repair.imei}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      repair.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      repair.status === 'in-progress' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {STATUS_LABELS[repair.status as any]}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Clock className="w-3 h-3" /> {new Date(repair.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {repair.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartRepair(repair._id);
                        }}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
