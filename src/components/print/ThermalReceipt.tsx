import React, { useState, useEffect } from 'react';
import { Smartphone, CreditCard, Banknote, MapPin, Phone, RefreshCcw } from 'lucide-react';

interface ThermalReceiptProps {
  id: string;
  orderId: string;
  date: string;
  items: { name: string; sku: string; price: number; imei?: string }[];
  payments: any;
  total: number;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ id, orderId, date, items, payments, total }) => {
  const [storeInfo, setStoreInfo] = useState({
    name: "Lakki Phone ERP",
    address: "Kuwait City, Main Branch",
    phone: "+965 2222 3333"
  });

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch('/api/stores', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const stores = await res.json();
          if (stores.length > 0) {
            setStoreInfo({
              name: stores[0].name,
              address: stores[0].address,
              phone: stores[0].phone
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch store info for receipt", err);
      }
    };
    fetchStore();
  }, []);

  return (
    <div id={id} className="w-[300px] bg-white p-4 mx-auto text-gray-900 border border-gray-200" style={{ fontFamily: "'Inter', 'Noto Sans Arabic', sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-4 border-b border-dashed border-gray-300 pb-4">
        <div className="flex justify-center mb-2">
          <div className="bg-gray-900 text-white p-2 rounded-lg">
            <Smartphone className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-xl font-black uppercase tracking-tighter">{storeInfo.name}</h1>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Enterprise Retail Terminal</p>
        
        <div className="mt-2 text-[10px] flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{storeInfo.address}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>{storeInfo.phone}</span>
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div className="text-[10px] mb-4 flex justify-between font-bold uppercase">
        <div>
          <p>Order: #{orderId}</p>
          <p>Date: {date}</p>
        </div>
        <div className="text-right">
          <p>Terminal: POS-01</p>
          <p>Staff: Admin</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-black border-b border-gray-200 pb-1 mb-2 uppercase">
          <span>Item / الصنف</span>
          <span>Price / السعر</span>
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="text-[10px]">
              <div className="flex justify-between font-bold">
                <span className="flex-1">{item.name}</span>
                <span className="ml-2">{item.price.toFixed(3)} KD</span>
              </div>
              <div className="flex justify-between text-gray-500 text-[9px] mt-0.5 italic">
                <span>SKU: {item.sku}</span>
                {item.imei && <span className="text-indigo-600 font-bold">IMEI: {item.imei}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-dashed border-gray-300 pt-3 mb-4 space-y-1">
        <div className="flex justify-between text-[10px] font-bold">
          <span>Subtotal / المجموع الفرعي</span>
          <span>{total.toFixed(3)} KD</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold">
          <span>VAT (0%) / الضريبة</span>
          <span>0.000 KD</span>
        </div>
        <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-100">
          <span>TOTAL / الإجمالي</span>
          <span>{total.toFixed(3)} KD</span>
        </div>
      </div>

      {/* Payment Split (ID 12) */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">Payment Split / تفاصيل الدفع</p>
        <div className="space-y-1">
          {Array.isArray(payments) ? (
            payments.map((p, idx) => (
              <div key={idx} className="flex justify-between text-[10px] font-medium">
                <span className="flex items-center gap-1">
                  {p.method === 'cash' && <Banknote className="w-3 h-3 text-green-500" />}
                  {p.method === 'knet' && <Smartphone className="w-3 h-3 text-blue-500" />}
                  {(p.method === 'card' || p.method === 'credit_card') && <CreditCard className="w-3 h-3 text-purple-500" />}
                  {p.method === 'store_credit' && <RefreshCcw className="w-3 h-3 text-orange-500" />}
                  <span className="capitalize">{p.method.replace('_', ' ')}</span>
                </span>
                <span>{p.amount.toFixed(3)} KD</span>
              </div>
            ))
          ) : (
            <>
              {payments.cash > 0 && (
                <div className="flex justify-between text-[10px] font-medium">
                  <span className="flex items-center gap-1"><Banknote className="w-3 h-3 text-green-500" /> Cash / نقدي</span>
                  <span>{payments.cash.toFixed(3)} KD</span>
                </div>
              )}
              {payments.knet > 0 && (
                <div className="flex justify-between text-[10px] font-medium">
                  <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-blue-500" /> K-Net / كي نت</span>
                  <span>{payments.knet.toFixed(3)} KD</span>
                </div>
              )}
              {payments.creditCard > 0 && (
                <div className="flex justify-between text-[10px] font-medium">
                  <span className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-purple-500" /> Card / فيزا</span>
                  <span>{payments.creditCard.toFixed(3)} KD</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-6">
        <p>Thank you for your business</p>
        <p>شكراً لتعاملكم معنا</p>
        <div className="mt-4 border-t border-gray-100 pt-4 italic">
          <p>No Return without Receipt</p>
          <p>لا يوجد استرجاع بدون الفاتورة</p>
        </div>
      </div>
    </div>
  );
};
