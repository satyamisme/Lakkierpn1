import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Gate } from '../../PermissionGuard';

import { toast } from 'sonner';

interface LoyaltyPaymentProps {
  onRedeem: (discount: number) => void;
  totalAmount: number;
}

export const LoyaltyPayment: React.FC<LoyaltyPaymentProps> = ({ onRedeem, totalAmount }) => {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState('');

  const searchCustomer = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/crm/customers/search?phone=${phone}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.length > 0) {
        setCustomer(data[0]);
      } else {
        setError('Customer not found');
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!customer || customer.loyaltyPoints < 10) return;
    
    setIsRedeeming(true);
    try {
      const pointsToRedeem = Math.min(customer.loyaltyPoints, Math.floor(totalAmount * 10));
      const response = await fetch('/api/crm/loyalty/redeem', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ customerId: customer._id, points: pointsToRedeem }),
      });

      if (response.ok) {
        const data = await response.json();
        onRedeem(data.discount);
        setCustomer({ ...customer, loyaltyPoints: customer.loyaltyPoints - pointsToRedeem });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Redemption failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Gate id={19}>
      <div className="bg-card border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest italic">Loyalty Redemption (ID 19)</h3>
        </div>

        {!customer ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input 
                type="text" 
                placeholder="Customer Phone..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-muted border border-border pl-10 pr-3 py-2 text-xs font-mono focus:border-primary outline-none"
              />
            </div>
            <button 
              onClick={searchCustomer}
              disabled={isLoading || !phone}
              className="bg-primary text-primary-foreground px-4 py-2 font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Find"}
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-muted/30 border border-border space-y-3"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">{customer.name}</p>
                <p className="text-[9px] font-mono text-muted-foreground">{customer.tier} Tier</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{customer.loyaltyPoints} Points</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">≈ {(customer.loyaltyPoints * 0.1).toFixed(3)} KD</p>
              </div>
            </div>
            <button 
              onClick={handleRedeem}
              disabled={isRedeeming || customer.loyaltyPoints < 10}
              className="w-full bg-amber-500 text-white py-2 font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRedeeming ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Star size={12} /> Redeem Points</>}
            </button>
            <button onClick={() => setCustomer(null)} className="w-full text-[8px] font-black text-muted-foreground uppercase tracking-widest hover:text-red-500">Change Customer</button>
          </motion.div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-[9px] font-bold uppercase tracking-widest">
            <AlertCircle size={12} /> {error}
          </div>
        )}
      </div>
    </Gate>
  );
};
