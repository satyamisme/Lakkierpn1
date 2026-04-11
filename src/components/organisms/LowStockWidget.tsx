import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export const LowStockWidget: React.FC = () => {
  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products/low-stock?threshold=10', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setLowStock(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-card border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle className="text-amber-500 w-4 h-4" />
          Low Stock Alerts
        </h3>
        <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[8px] font-black uppercase">
          {lowStock.length} Items
        </span>
      </div>

      <div className="space-y-2">
        {lowStock.slice(0, 5).map(item => (
          <div key={item._id} className="flex items-center justify-between p-2 bg-muted/30 border border-border">
            <div className="overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-tighter truncate">{item.name}</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">SKU: {item.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-red-500 font-mono">{item.stock}</p>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Left</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-2 text-[8px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all">
        View Inventory <ArrowRight size={10} />
      </button>
    </div>
  );
};
