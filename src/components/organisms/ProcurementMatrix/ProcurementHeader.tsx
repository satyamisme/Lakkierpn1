import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Calendar, FileText } from 'lucide-react';
import api from '../../../api/client';

interface Props {
  data: any;
  onChange: (data: any) => void;
  active: boolean;
  onComplete: () => void;
}

export const ProcurementHeader: React.FC<Props> = ({ data, onChange, active, onComplete }) => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, storeRes] = await Promise.all([
          api.get('/inventory/suppliers'),
          api.get('/stores')
        ]);
        setSuppliers(supRes.data);
        setStores(storeRes.data);
      } catch (err) {
        console.error("Header fetch failed", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={`p-8 rounded-[3rem] border transition-all duration-500 ${active ? 'bg-white/[0.03] border-blue-500/30' : 'bg-white/[0.01] border-white/5 opacity-60'}`}>
      <h2 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
        <Truck className="text-blue-500" />
        Procurement Header
      </h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Vendor/Supplier</label>
          <select 
            disabled={!active}
            value={data.supplierId}
            onChange={(e) => onChange({...data, supplierId: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:ring-2 ring-blue-500/20 outline-none appearance-none"
          >
            <option value="">Select Vendor</option>
            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Reference No</label>
            <input 
              disabled={!active}
              type="text"
              placeholder="PO-2026-X"
              value={data.referenceNo}
              onChange={(e) => onChange({...data, referenceNo: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:ring-2 ring-blue-500/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Purchase Date</label>
            <input 
              disabled={!active}
              type="date"
              value={data.date}
              onChange={(e) => onChange({...data, date: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:ring-2 ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Receiving Branch</label>
          <div className="relative">
            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <select 
              disabled={!active}
              value={data.storeId}
              onChange={(e) => onChange({...data, storeId: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:ring-2 ring-blue-500/20 outline-none appearance-none"
            >
              <option value="">Select Store</option>
              {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {active && (
          <button 
            onClick={onComplete}
            disabled={!data.supplierId || !data.storeId}
            className="w-full py-4 mt-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
          >
            Lock Header & Continue
          </button>
        )}
      </div>
    </div>
  );
};
