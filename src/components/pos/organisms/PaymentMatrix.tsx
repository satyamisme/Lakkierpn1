import React, { useState, useMemo } from 'react';
import { CreditCard, Banknote, Smartphone, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { toast } from 'sonner';
import { Gate } from '../../PermissionGuard';
import { PaymentInput } from '../atoms/PaymentInput';
import { 
  PaymentData, 
  calculateTotalPaid, 
  calculateRemainingBalance, 
  isFullyPaid as checkFullyPaid, 
  isOverPaid as checkOverPaid 
} from '../../../utils/BalanceLogic';

interface PaymentMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onProcessSale: (payments: PaymentData, giftCardCode?: string) => void;
}

export const PaymentMatrix: React.FC<PaymentMatrixProps> = ({ isOpen, onClose, totalAmount, onProcessSale }) => {
  const [payments, setPayments] = useState<PaymentData>({
    cash: 0,
    knet: 0,
    creditCard: 0,
    giftCard: 0,
    storeCredit: 0,
  });

  const [giftCardCode, setGiftCardCode] = useState("");
  const [isValidatingGC, setIsValidatingGC] = useState(false);

  const validateGiftCard = async () => {
    if (!giftCardCode) return;
    setIsValidatingGC(true);
    try {
      const res = await axios.get(`/api/gift-cards/verify/${giftCardCode}`);
      const balance = res.data.currentBalance;
      toast.success(`Gift Card Verified: ${balance.toFixed(3)} KD available`);
      // Auto-apply balance up to remaining
      const applyAmount = Math.min(balance, remainingBalance);
      setPayments(prev => ({ ...prev, giftCard: applyAmount }));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid Gift Card");
    } finally {
      setIsValidatingGC(false);
    }
  };

  const totalPaid = useMemo(() => calculateTotalPaid(payments), [payments]);
  const remainingBalance = useMemo(() => calculateRemainingBalance(totalAmount, totalPaid), [totalAmount, totalPaid]);
  const fullyPaid = useMemo(() => checkFullyPaid(remainingBalance), [remainingBalance]);
  const overPaid = useMemo(() => checkOverPaid(remainingBalance), [remainingBalance]);

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(numValue)) return;
    setPayments(prev => ({ ...prev, [field]: numValue }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
        >
          <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-indigo-400" />
                Payment Matrix (ID 12)
              </h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Multi-Payment Split Terminal</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payable</p>
                <p className="text-3xl font-black text-gray-900">{totalAmount.toFixed(3)} <span className="text-sm font-normal text-gray-500">KD</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Remaining</p>
                <p className={`text-xl font-black ${fullyPaid ? 'text-green-500' : overPaid ? 'text-amber-500' : 'text-red-500'}`}>
                  {remainingBalance.toFixed(3)} <span className="text-xs font-normal text-gray-500">KD</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <PaymentInput 
                label="Cash Payment"
                icon={<Banknote className="w-4 h-4" />}
                value={payments.cash}
                onChange={(v) => handleInputChange('cash', v)}
                colorClass="text-green-500"
              />
              <PaymentInput 
                label="K-Net (Debit)"
                icon={<Smartphone className="w-4 h-4" />}
                value={payments.knet}
                onChange={(v) => handleInputChange('knet', v)}
                colorClass="text-blue-500"
              />
              <PaymentInput 
                label="Credit Card"
                icon={<CreditCard className="w-4 h-4" />}
                value={payments.creditCard}
                onChange={(v) => handleInputChange('creditCard', v)}
                colorClass="text-purple-500"
              />
              
              <div className="pt-4 border-t border-dashed border-gray-100">
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text"
                    placeholder="Enter Gift Card Code"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all"
                  />
                  <button 
                    onClick={validateGiftCard}
                    disabled={isValidatingGC}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                  >
                    {isValidatingGC ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Verify'}
                  </button>
                </div>
                <PaymentInput 
                  label="Gift Card (Redeem)"
                  icon={<CreditCard className="w-4 h-4" />}
                  value={payments.giftCard}
                  onChange={(v) => handleInputChange('giftCard', v)}
                  colorClass="text-indigo-400"
                />
              </div>

              <PaymentInput 
                label="Store Credit / Account"
                icon={<Banknote className="w-4 h-4" />}
                value={payments.storeCredit}
                onChange={(v) => handleInputChange('storeCredit', v)}
                colorClass="text-amber-600"
              />
            </div>

            {overPaid && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700 text-sm font-medium">
                <AlertCircle className="w-5 h-5" />
                Overpayment detected. Change to return: {Math.abs(remainingBalance).toFixed(3)} KD
              </div>
            )}

            <Gate id={12}>
              <button 
                onClick={() => onProcessSale(payments, giftCardCode)}
                disabled={(!fullyPaid && !overPaid)}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 disabled:opacity-50 disabled:bg-gray-200 disabled:shadow-none active:scale-95"
              >
                <CheckCircle2 className="w-6 h-6" />
                Complete Transaction (ID 12)
              </button>
            </Gate>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
