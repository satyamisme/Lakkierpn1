import React from 'react';
import { User, Smartphone, Hash, Clock, CheckCircle2, MessageCircle, CreditCard } from 'lucide-react';
import { generateWhatsAppLink } from '../../utils/whatsappGenerator';

interface Repair {
  _id: string;
  customerName: string;
  customerPhone: string;
  phoneModel: string;
  imei: string;
  status: string;
  estimatedQuote: number;
  createdAt: string;
}

interface ReadyQueueProps {
  repairs: Repair[];
  onSelectRepair: (repair: Repair) => void;
}

/**
 * ID 141: Ready Queue Atom
 * High-density atom showing only 'Ready for Pickup' devices.
 */
export const ReadyQueue: React.FC<ReadyQueueProps> = ({ repairs, onSelectRepair }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer / Device</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quote</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ready Since</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {repairs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                  No devices ready for pickup.
                </td>
              </tr>
            ) : (
              repairs.map((repair) => (
                <tr 
                  key={repair._id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group"
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
                    <div className="flex items-center gap-2 text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {repair.estimatedQuote.toFixed(3)} KD
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={generateWhatsAppLink(repair.customerPhone, repair.customerName, repair.phoneModel, repair.estimatedQuote)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-200 dark:shadow-none"
                        title="ID 121: Notify via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                      </a>
                      <button
                        onClick={() => onSelectRepair(repair)}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                        title="ID 141: Pickup & Billing"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pickup</span>
                      </button>
                    </div>
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
