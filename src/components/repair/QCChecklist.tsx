import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface QCChecklistProps {
  checklist: Record<string, boolean>;
  onToggle: (item: string) => void;
}

const QC_ITEMS = [
  'Wifi Test',
  'Camera Test (Front/Back)',
  'Charging Test',
  'Signal/SIM Test',
  'Touch/LCD Test',
  'Speaker/Mic Test',
  'Proximity Sensor',
  'Buttons (Vol/Power)',
  'FaceID/TouchID',
  'Battery Health Check'
];

/**
 * ID 71: QC Checklist Atom
 * A list of 10 toggle switches for quality control.
 */
export const QCChecklist: React.FC<QCChecklistProps> = ({ checklist, onToggle }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {QC_ITEMS.map((item) => {
        const isChecked = checklist[item] || false;
        return (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              isChecked 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-indigo-500'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">{item}</span>
            {isChecked ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 opacity-20" />}
          </button>
        );
      })}
    </div>
  );
};
