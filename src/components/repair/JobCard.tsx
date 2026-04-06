import React from 'react';
import { Wrench, MapPin, Phone, User, Smartphone, Hash, Calendar } from 'lucide-react';

interface JobCardProps {
  id: string;
  data: {
    customerName: string;
    customerPhone: string;
    phoneModel: string;
    imei: string;
    faults: string[];
    estimatedQuote: number;
    createdAt?: string;
  };
}

export const JobCard: React.FC<JobCardProps> = ({ id, data }) => {
  return (
    <div id={id} className="w-[210mm] min-h-[148mm] bg-white p-12 mx-auto text-gray-900 border-2 border-gray-900" style={{ fontFamily: "'Inter', 'Noto Sans Arabic', sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b-4 border-gray-900 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gray-900 text-white p-4 rounded-2xl">
            <Wrench className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Lakki Repair Hub</h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Official Intake Job Card</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-1">JOB CARD</h2>
          <div className="text-xs font-bold text-gray-500 space-y-1">
            <p>Job ID: <span className="text-gray-900">{data.imei || 'PENDING'}</span></p>
            <p>Date: <span className="text-gray-900">{data.createdAt || new Date().toLocaleString()}</span></p>
          </div>
        </div>
      </div>

      {/* Customer & Device Info */}
      <div className="grid grid-cols-2 gap-12 mb-8">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Customer Details / العميل</h3>
          <div className="text-sm font-bold space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <span>{data.customerName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{data.customerPhone}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Device Details / الجهاز</h3>
          <div className="text-sm font-bold space-y-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <span>{data.phoneModel}</span>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-gray-400" />
              <span>IMEI: {data.imei}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Faults & Quote */}
      <div className="mb-8">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Reported Faults / الأعطال</h3>
        <div className="grid grid-cols-2 gap-4">
          {data.faults.map((fault, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm font-bold">
              <div className="w-2 h-2 bg-indigo-600 rounded-full" />
              {fault}
            </div>
          ))}
        </div>
      </div>

      {/* Quote & Terms */}
      <div className="grid grid-cols-2 gap-12 pt-8 border-t-2 border-gray-900">
        <div className="space-y-4">
          <div className="bg-gray-900 text-white p-6 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Estimated Quote / التكلفة التقديرية</p>
            <p className="text-3xl font-black">{data.estimatedQuote.toFixed(3)} KD</p>
          </div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic leading-relaxed">
            * This is an estimate only. Final price may vary after full diagnosis.
            * Repair time is subject to part availability.
          </p>
        </div>
        <div className="flex flex-col justify-end space-y-8">
          <div className="border-b border-gray-300 pb-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Customer Signature / توقيع العميل</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Technician Signature / توقيع الفني</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Kuwait City
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" /> +965 2222 3333
          </div>
        </div>
        <div>Lakki Phone ERP v2.5</div>
      </div>
    </div>
  );
};
