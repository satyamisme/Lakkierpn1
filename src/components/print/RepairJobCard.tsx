import React from 'react';
import { Wrench, Smartphone, User, ShieldCheck } from 'lucide-react';
import { toArabicNumerals } from '../../utils/arabicUtils';

interface RepairJobCardProps {
  repair: any;
}

export const RepairJobCard: React.FC<RepairJobCardProps> = ({ repair }) => {
  if (!repair) return null;

  const balance = repair.quotedPrice - repair.deposit;

  return (
    <div id={`job-card-${repair.repairNumber || repair._id}`} className="hidden print:block w-[210mm] min-h-[148mm] bg-white text-black p-10 font-sans border-2 border-black">
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-8">
        <div className="flex-1">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">Lakki Phone</h1>
          <p className="text-sm font-bold uppercase tracking-[0.3em] mt-2">Repair Job Card & Asset Receipt</p>
        </div>
        <div className="flex-1 text-right dir-rtl">
          <h1 className="text-5xl font-black tracking-tighter italic">لاكي فون</h1>
          <p className="text-sm font-bold uppercase tracking-[0.3em] mt-2">بطاقة عمل الإصلاح وإيصال الأصول</p>
        </div>
        <div className="ml-8 text-right">
          <div className="bg-black text-white px-6 py-2 text-2xl font-black mb-2">
            #{repair.repairNumber}
          </div>
          <p className="text-xs font-bold text-gray-500">{new Date(repair.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12">
        {/* Left Col: Customer & Device */}
        <div className="space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white bg-black px-3 py-1 inline-block">Customer Details</h3>
              <h3 className="text-[10px] font-black text-gray-400">بيانات العميل</h3>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold">{repair.customerId?.name || 'Guest Customer'}</p>
              <p className="text-sm text-gray-600">{repair.customerId?.phone}</p>
              <p className="text-sm text-gray-600">{repair.customerId?.email}</p>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white bg-black px-3 py-1 inline-block">Asset Specification</h3>
              <h3 className="text-[10px] font-black text-gray-400">مواصفات الجهاز</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2 font-bold">
                <span className="text-xs text-gray-400 uppercase">Manufacturer / المصنع</span>
                <span className="text-sm">{repair.deviceInfo.brand}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 font-bold">
                <span className="text-xs text-gray-400 uppercase">Model Matrix / الموديل</span>
                <span className="text-sm">{repair.deviceInfo.model}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 font-bold">
                <span className="text-xs text-gray-400 uppercase">IMEI / Serial / الرقم التسلسلي</span>
                <span className="text-sm font-mono">{repair.deviceInfo.imei || repair.deviceInfo.serialNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 font-bold">
                <span className="text-xs text-gray-400 uppercase">Priority / الأولوية</span>
                <span className={`text-sm uppercase ${repair.priority === 'vip' ? 'text-purple-600' : repair.priority === 'urgent' ? 'text-red-500' : ''}`}>
                  {repair.priority}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Col: Diagnosis & Costs */}
        <div className="space-y-8">
          <section className="bg-gray-50 p-6 border-l-4 border-black relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reported Problem</h3>
              <h3 className="text-[10px] font-black text-gray-300">وصف المشكلة</h3>
            </div>
            <p className="text-lg font-bold italic leading-tight">"{repair.problemDescription}"</p>
          </section>

          <section>
             <div className="flex justify-between items-center mb-4 border-b border-black/10 pb-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-black/20">Financial Summary</h3>
              <h3 className="text-[10px] font-black text-gray-300 uppercase">الملخص المالي</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-xl font-black italic">
                <div className="space-y-1">
                   <div className="flex items-center gap-2"><span>EST. QUOTE</span> <span className="text-gray-300 font-normal">/ التكلفة التقديرية</span></div>
                   <div className="text-[10px] text-gray-400 font-mono tracking-widest">KD {toArabicNumerals(repair.quotedPrice.toFixed(3))} د.ك</div>
                </div>
                <span>{repair.quotedPrice.toFixed(3)} KD</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-500">
                <div className="flex items-center gap-2"><span>DEPOSIT</span> <span className="text-gray-300 font-normal">/ العربون</span></div>
                <span>-{repair.deposit.toFixed(3)} KD</span>
              </div>
              <div className="flex justify-between text-2xl font-black border-t-2 border-black pt-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-green-600"><span>BALANCE DUE</span> <span className="text-gray-300 font-normal">/ المتبقي</span></div>
                  <div className="text-[12px] text-green-500/50 font-mono tracking-widest">KD {toArabicNumerals(balance.toFixed(3))} د.ك</div>
                </div>
                <span className="text-green-600">{balance.toFixed(3)} KD</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer / Terms */}
      <div className="mt-16 pt-10 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 text-[8px] uppercase font-bold text-gray-400 leading-relaxed grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <h4 className="text-black mb-2 font-black">Terms of Service</h4>
              <p>1. Repair times are estimates and may vary based on component availability.</p>
              <p>2. Data backup is the responsibility of the customer. Lakki Phone is not liable for data loss.</p>
              <p>3. Liquid damaged devices may exhibit further failure during restoration.</p>
              <p>4. Uncollected assets liquidated after 90 days.</p>
            </div>
            <div className="space-y-1 text-right">
              <h4 className="text-black mb-2 font-black">شروط الخدمة</h4>
              <p>١. أوقات الإصلاح تقديرية وقد تختلف بناءً على توفر المكونات.</p>
              <p>٢. النسخ الاحتياطي للبيانات هو مسؤولية العميل. لاكي فون غير مسؤولة عن فقدان البيانات.</p>
              <p>٣. الأجهزة المتضررة من السوائل قد تظهر فشلاً إضافياً أثناء الترميم.</p>
              <p>٤. تتم تصفية الأصول غير المستلمة بعد ٩٠ يوماً.</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-end">
             <div className="w-full border-t border-black mb-2" />
             <p className="text-[9px] font-black uppercase tracking-widest text-center">Customer Signature / توقيع العميل</p>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t-2 border-dashed border-gray-300 pt-8 text-center text-[10px] font-black text-gray-300 uppercase tracking-[1em]">
        Workshop Copy Buffer
      </div>
    </div>
  );
};
