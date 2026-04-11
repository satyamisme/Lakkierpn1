import React, { useState, useMemo } from 'react';
import { CreditCard, Banknote, Smartphone, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Gate } from '../../PermissionGuard';
import { PaymentInput } from '../atoms/PaymentInput';
import { StripePaymentForm } from './StripePaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { 
  PaymentData, 
  calculateTotalPaid, 
  calculateRemainingBalance, 
  isFullyPaid as checkFullyPaid, 
  isOverPaid as checkOverPaid 
} from '../../../utils/BalanceLogic';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock');

interface PaymentMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onProcessSale: (payments: PaymentData) => void;
}

export const PaymentMatrix: React.FC<PaymentMatrixProps> = ({ isOpen, onClose, totalAmount, onProcessSale }) => {
  const [payments, setPayments] = useState<PaymentData>({
    cash: 0,
    knet: 0,
    creditCard: 0,
  });
  const [showStripe, setShowStripe] = useState(false);

  const totalPaid = useMemo(() => calculateTotalPaid(payments), [payments]);
  const remainingBalance = useMemo(() => calculateRemainingBalance(totalAmount, totalPaid), [totalAmount, totalPaid]);
  const fullyPaid = useMemo(() => checkFullyPaid(remainingBalance), [remainingBalance]);
  const overPaid = useMemo(() => checkOverPaid(remainingBalance), [remainingBalance]);

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(numValue)) return;
    setPayments(prev => ({ ...prev, [field]: numValue }));
  };

  const handleStripeSuccess = (paymentIntentId: string) => {
    // In a real app, we'd attach the paymentIntentId to the sale
    onProcessSale(payments);
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

            {!showStripe ? (
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
                <div className="space-y-2">
                  <PaymentInput 
                    label="Credit Card"
                    icon={<CreditCard className="w-4 h-4" />}
                    value={payments.creditCard}
                    onChange={(v) => handleInputChange('creditCard', v)}
                    colorClass="text-purple-500"
                  />
                  {payments.creditCard > 0 && (
                    <button 
                      onClick={() => setShowStripe(true)}
                      className="w-full py-2 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-100 hover:bg-purple-100 transition-all"
                    >
                      Initialize Stripe Terminal
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Stripe Secure Payment</h3>
                  <span className="text-lg font-black text-purple-600">{payments.creditCard.toFixed(3)} KD</span>
                </div>
                <Elements stripe={stripePromise}>
                  <StripePaymentForm 
                    amount={payments.creditCard} 
                    onSuccess={handleStripeSuccess}
                    onCancel={() => setShowStripe(false)}
                  />
                </Elements>
              </div>
            )}

            {overPaid && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700 text-sm font-medium">
                <AlertCircle className="w-5 h-5" />
                Overpayment detected. Change to return: {Math.abs(remainingBalance).toFixed(3)} KD
              </div>
            )}

            {!showStripe && (
              <Gate id={12}>
                <button 
                  onClick={() => onProcessSale(payments)}
                  disabled={(!fullyPaid && !overPaid) || (payments.creditCard > 0)}
                  className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 disabled:opacity-50 disabled:bg-gray-200 disabled:shadow-none active:scale-95"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  {payments.creditCard > 0 ? "Pay via Stripe Above" : "Complete Transaction (ID 12)"}
                </button>
              </Gate>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
