import React from "react";
import { ImeiEvent } from "../../api/services/imeiTimeline";
import { Clock, MapPin, User, Info, Smartphone } from "lucide-react";
import { motion } from "motion/react";

interface ImeiTimelineProps {
  imei: string;
  history: ImeiEvent[];
}

export const ImeiTimeline: React.FC<ImeiTimelineProps> = ({ imei, history }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 bg-muted/30 p-6 border border-border rounded-2xl">
        <div className="bg-primary p-3 rounded-xl text-primary-foreground">
          <Smartphone size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">IMEI: {imei}</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Complete Device Lifecycle</p>
        </div>
      </div>

      <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {history.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative"
          >
            {/* Timeline Node */}
            <div className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full border-4 border-card z-10 flex items-center justify-center ${
              event.type === 'sale' ? 'bg-green-500' :
              event.type === 'repair' ? 'bg-amber-500' :
              event.type === 'transfer' ? 'bg-blue-500' :
              event.type === 'return' ? 'bg-red-500' : 'bg-primary'
            }`}>
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>

            <div className="bg-card border border-border p-5 space-y-3 hover:border-primary transition-all group">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-1 rounded">
                  {event.type}
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Clock size={10} /> {new Date(event.date).toLocaleString()}
                </div>
              </div>

              <h4 className="font-black uppercase tracking-tight text-lg leading-tight">{event.details}</h4>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <MapPin size={12} className="text-primary" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest justify-end">
                  <User size={12} className="text-primary" />
                  {event.user}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {history.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <Info size={48} className="mx-auto mb-2" />
            <p className="font-black uppercase tracking-widest">No history found for this IMEI</p>
          </div>
        )}
      </div>
    </div>
  );
};
