import React from 'react';
import { User, Smartphone, Hash, Phone } from 'lucide-react';

interface JobCardFormProps {
  formData: {
    customerName: string;
    customerPhone: string;
    phoneModel: string;
    imei: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * ID 61: Job Card Intake Form Atom
 * Captures customer and device details.
 */
export const JobCardForm: React.FC<JobCardFormProps> = ({ formData, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <User className="w-3 h-3" /> Customer Name
        </label>
        <input
          name="customerName"
          value={formData.customerName}
          onChange={onChange}
          placeholder="e.g. Ahmed Al-Salem"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white font-bold"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Phone className="w-3 h-3" /> Customer Phone
        </label>
        <input
          name="customerPhone"
          value={formData.customerPhone}
          onChange={onChange}
          placeholder="e.g. +965 9988 7766"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white font-bold"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Smartphone className="w-3 h-3" /> Phone Model
        </label>
        <input
          name="phoneModel"
          value={formData.phoneModel}
          onChange={onChange}
          placeholder="e.g. iPhone 15 Pro Max"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white font-bold"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Hash className="w-3 h-3" /> IMEI / Serial (ID 5)
        </label>
        <input
          name="imei"
          value={formData.imei}
          onChange={onChange}
          placeholder="15-digit IMEI number"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white font-bold"
        />
      </div>
    </div>
  );
};
