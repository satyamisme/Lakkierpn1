import React from 'react';
import { Smartphone, CreditCard, Banknote, MapPin, Phone, Mail, Globe, CheckCircle2 } from 'lucide-react';

interface A4InvoiceProps {
  id: string;
  orderId: string;
  date: string;
  items: { name: string; sku: string; price: number; imei?: string }[];
  payments: { cash: number; knet: number; creditCard: number };
  total: number;
}

export const A4Invoice: React.FC<A4InvoiceProps> = ({ id, orderId, date, items, payments, total }) => {
  return (
    <div id={id} className="w-[210mm] min-h-[297mm] bg-white p-12 mx-auto text-gray-900 border border-gray-200 shadow-2xl print:shadow-none print:border-none print:m-0" style={{ fontFamily: "'Inter', 'Noto Sans Arabic', sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-12 border-b-4 border-gray-900 pb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gray-900 text-white p-4 rounded-2xl">
            <Smartphone className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Lakki Phone ERP</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Enterprise Retail Terminal</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-5xl font-black text-gray-200 uppercase tracking-widest mb-2">INVOICE</h2>
          <div className="text-sm font-bold text-gray-500 space-y-1">
            <p>Invoice #: <span className="text-gray-900">{orderId}</span></p>
            <p>Date: <span className="text-gray-900">{date}</span></p>
          </div>
        </div>
      </div>

      {/* Company & Client Info */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">From / من</h3>
          <div className="text-sm font-bold space-y-2">
            <p className="text-lg font-black">Lakki Phone Main Branch</p>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Kuwait City, Al-Hamra Tower, Floor 42</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>+965 2222 3333</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>billing@lakkiphone.com</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="w-4 h-4" />
              <span>www.lakkiphone.com</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">To / إلى</h3>
          <div className="text-sm font-bold space-y-2">
            <p className="text-lg font-black">Cash Customer / عميل نقدي</p>
            <p className="text-gray-600">Walk-in Retail Sale</p>
            <p className="text-gray-600">Kuwait City, Kuwait</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white text-xs font-black uppercase tracking-widest">
              <th className="p-4 rounded-tl-xl">Description / الوصف</th>
              <th className="p-4">SKU / الرمز</th>
              <th className="p-4">IMEI / الرقم التسلسلي</th>
              <th className="p-4 text-right rounded-tr-xl">Price / السعر</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold">
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">{item.name}</td>
                <td className="p-4 text-gray-500">{item.sku}</td>
                <td className="p-4 text-indigo-600">{item.imei || 'N/A'}</td>
                <td className="p-4 text-right">{item.price.toFixed(3)} KD</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Payments */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Payment Details / تفاصيل الدفع</h3>
          <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
            {payments.cash > 0 && (
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2"><Banknote className="w-4 h-4 text-green-500" /> Cash / نقدي</span>
                <span>{payments.cash.toFixed(3)} KD</span>
              </div>
            )}
            {payments.knet > 0 && (
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-blue-500" /> K-Net / كي نت</span>
                <span>{payments.knet.toFixed(3)} KD</span>
              </div>
            )}
            {payments.creditCard > 0 && (
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-purple-500" /> Card / فيزا</span>
                <span>{payments.creditCard.toFixed(3)} KD</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm font-black text-indigo-600">
              <span>Total Paid / إجمالي المدفوع</span>
              <span>{total.toFixed(3)} KD</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Summary / الملخص</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-bold text-gray-500">
              <span>Subtotal / المجموع الفرعي</span>
              <span>{total.toFixed(3)} KD</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-500">
              <span>VAT (0%) / الضريبة</span>
              <span>0.000 KD</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-gray-900 pt-4 border-t-2 border-gray-900">
              <span>TOTAL / الإجمالي</span>
              <span>{total.toFixed(3)} KD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-12 border-t border-gray-100 text-center space-y-6">
        <div className="flex justify-center gap-8 text-xs font-black text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Official B2B Invoice
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Authorized Signature
          </div>
        </div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
          <p>Thank you for choosing Lakki Phone ERP. This is a computer-generated invoice and does not require a physical signature.</p>
          <p>شكراً لاختياركم لكي فون. هذه فاتورة صادرة عن الكمبيوتر ولا تتطلب توقيعاً مادياً.</p>
        </div>
      </div>
    </div>
  );
};
