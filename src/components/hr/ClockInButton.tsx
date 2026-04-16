import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, Loader2, CheckCircle2, LogOut } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { toast } from 'sonner';

interface ClockInButtonProps {
  onSuccess: () => void;
}

export const ClockInButton: React.FC<ClockInButtonProps> = ({ onSuccess }) => {
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClockAction = async (action: 'in' | 'out') => {
    if (action === 'in' && !latitude) {
      toast.error("Location required to clock in.");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = action === 'in' ? '/api/hr/attendance/clock-in' : '/api/hr/attendance/clock-out';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(action === 'in' ? { latitude, longitude } : {}),
      });

      if (response.ok) {
        setIsClockedIn(action === 'in');
        toast.success(`Successfully clocked ${action}!`);
        onSuccess();
      } else {
        const data = await response.json();
        toast.error(data.error || `Clock-${action} failed`);
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tighter italic">Attendance Terminal</h3>
        </div>
        {latitude && (
          <div className="flex items-center gap-1 text-[9px] font-black text-green-500 uppercase tracking-widest">
            <MapPin size={10} /> Location Verified
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {!isClockedIn ? (
          <button 
            onClick={() => handleClockAction('in')}
            disabled={isSubmitting || geoLoading}
            className="w-full bg-primary text-primary-foreground py-6 font-black text-sm uppercase tracking-[0.3em] hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex flex-col items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <Clock size={24} className="mb-1" />
                Clock In
                <span className="text-[9px] font-bold opacity-70">Capture Geolocation (ID 188)</span>
              </>
            )}
          </button>
        ) : (
          <button 
            onClick={() => handleClockAction('out')}
            disabled={isSubmitting}
            className="w-full bg-red-500 text-white py-6 font-black text-sm uppercase tracking-[0.3em] hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-50 flex flex-col items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <LogOut size={24} className="mb-1" />
                Clock Out
                <span className="text-[9px] font-bold opacity-70">End Shift</span>
              </>
            )}
          </button>
        )}
      </div>

      {geoError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
          Location Error: {geoError}
        </div>
      )}
    </div>
  );
};
