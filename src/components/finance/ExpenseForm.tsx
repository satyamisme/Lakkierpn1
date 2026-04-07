import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Banknote, Tag, FileText, Loader2, CheckCircle2 } from 'lucide-react';

interface ExpenseFormProps {
  onSuccess: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: Number(amount), category, receiptUrl }),
      });

      if (response.ok) {
        setAmount('');
        setCategory('Other');
        setReceiptUrl('');
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to log expense');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-card border border-border p-6 space-y-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Banknote className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-black uppercase tracking-tighter italic">Log New Expense</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Amount (KD)</label>
          <input 
            type="number" 
            step="0.001"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.000"
            className="w-full bg-muted border border-border p-3 text-lg font-mono focus:border-primary outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Category</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-muted border border-border p-3 text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
          >
            {['Rent', 'Electricity', 'Tea', 'Mandoob', 'Other'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Receipt URL (Optional)</label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input 
              type="url" 
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-muted border border-border pl-10 pr-3 py-3 text-xs font-mono focus:border-primary outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest">
          {error}
        </div>
      )}

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground py-4 font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Log Expense</>}
      </button>
    </motion.form>
  );
};
