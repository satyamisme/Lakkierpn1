import React from 'react';
import { 
  Smartphone, 
  Battery, 
  ZapOff, 
  Droplets, 
  Usb, 
  Volume2, 
  Camera, 
  Code 
} from 'lucide-react';
import { FAULT_PRICES } from '../../utils/repairLogic';

interface FaultMatrixProps {
  selectedFaults: string[];
  onToggleFault: (fault: string) => void;
}

const FAULT_ICONS: Record<string, React.ReactNode> = {
  'Broken Screen': <Smartphone className="w-6 h-6" />,
  'Battery Replacement': <Battery className="w-6 h-6" />,
  'No Power': <ZapOff className="w-6 h-6" />,
  'Water Damage': <Droplets className="w-6 h-6" />,
  'Charging Port': <Usb className="w-6 h-6" />,
  'Speaker/Mic': <Volume2 className="w-6 h-6" />,
  'Camera Repair': <Camera className="w-6 h-6" />,
  'Software/Unlocking': <Code className="w-6 h-6" />
};

/**
 * ID 62: Fault Matrix Grid Atom
 * High-density grid of clickable icons for common faults.
 */
export const FaultMatrix: React.FC<FaultMatrixProps> = ({ selectedFaults, onToggleFault }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Object.entries(FAULT_ICONS).map(([fault, icon]) => {
        const isSelected = selectedFaults.includes(fault);
        return (
          <button
            key={fault}
            onClick={() => onToggleFault(fault)}
            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all active:scale-95 group ${
              isSelected 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600'
            }`}
          >
            <div className={`mb-3 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-600'}`}>
              {icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{fault}</p>
            <p className={`text-[9px] font-bold mt-2 ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
              {FAULT_PRICES[fault].toFixed(3)} KD
            </p>
          </button>
        );
      })}
    </div>
  );
};
