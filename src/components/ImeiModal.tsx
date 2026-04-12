import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

interface ImeiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (imei: string) => void;
  productName: string;
}

export const ImeiModal: React.FC<ImeiModalProps> = ({ isOpen, onClose, onConfirm, productName }) => {
  const [imei, setImei] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateImei = async () => {
    if (imei.length !== 15 || !/^\d+$/.test(imei)) {
      setError('IMEI must be exactly 15 digits.');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // ID 6: Duplicate IMEI Prevention - Check if IMEI exists and is available
      const response = await axios.get(`/api/imei/check/${imei}`);
      const data = response.data;

      if (data.error && !data.exists) {
        setError('IMEI not found in system. Please perform stock intake first.');
      } else if (!data.available) {
        setError(data.error || 'IMEI is not available for sale.');
      } else {
        onConfirm(imei);
        setImei('');
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/30">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">IMEI Guard (ID 5)</h3>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Validation Required</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Scanning serial for:</p>
              <p className="text-lg font-bold text-indigo-900">{productName}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter 15-Digit IMEI</label>
                <input 
                  type="text"
                  maxLength={15}
                  autoFocus
                  className={`w-full px-4 py-3 border rounded-xl text-2xl font-mono tracking-widest text-center focus:ring-2 outline-none transition-all ${
                    error ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'
                  }`}
                  placeholder="000000000000000"
                  value={imei}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setImei(val);
                    if (error) setError(null);
                  }}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={validateImei}
                disabled={isValidating || imei.length !== 15}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isValidating ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm & Add to Cart'}
              </button>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-50 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Security Protocol ID 6: Duplicate Prevention Active
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
