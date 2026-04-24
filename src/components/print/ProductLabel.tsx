import React from 'react';
import { Smartphone, Tag } from 'lucide-react';
import { toArabicNumerals } from '../../utils/arabicUtils';

interface ProductLabelProps {
  id: string;
  name: string;
  name_ar?: string;
  brand?: string;
  brand_ar?: string;
  sku: string;
  price?: number;
  size?: '38x25' | '50x30' | '100x150' | string;
}

export const ProductLabel: React.FC<ProductLabelProps> = ({ 
  id, 
  name, 
  name_ar, 
  brand, 
  brand_ar, 
  sku, 
  price,
  size = '38x25'
}) => {
  return (
    <div 
      id={id}
      className="bg-white text-black p-2 flex flex-col items-center justify-center text-center overflow-hidden border border-gray-100"
      style={{ 
        width: size === '38x25' ? '143px' : (size === '50x30' ? '188px' : '377px'),
        height: size === '38x25' ? '94px' : (size === '50x30' ? '113px' : '566px'),
        fontFamily: "'Inter', 'Noto Sans Arabic', sans-serif"
      }}
    >
      {/* Brand Header */}
      <div className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
        {brand || 'Retail Asset'} {brand_ar && `| ${brand_ar}`}
      </div>

      {/* Main Name */}
      <div className="text-[9px] font-black uppercase leading-tight line-clamp-1">
        {name}
      </div>
      {name_ar && (
        <div className="text-[8px] font-bold text-gray-600 leading-tight line-clamp-1 mt-0.5" dir="rtl">
          {name_ar}
        </div>
      )}

      {/* SKU & Barcode Simulator */}
      <div className="mt-2 w-full">
        <div className="text-[7px] font-mono font-bold tracking-widest text-gray-500 mb-1">
          {sku}
        </div>
        <div className="w-full h-4 bg-black flex flex-col justify-center px-2 py-0.5 space-y-px">
          <div className="w-full h-px bg-white/20" />
          <div className="w-full h-px bg-white/40" />
          <div className="w-full h-px bg-white/60" />
          <div className="w-full h-px bg-white/80" />
          <div className="w-full h-px bg-white" />
        </div>
      </div>

      {/* Price if available */}
      {price !== undefined && (
        <div className="mt-2 text-[10px] font-black flex flex-col items-center">
          <span>{price.toFixed(3)} KD</span>
          <span className="text-[7px] text-gray-400 font-bold" dir="rtl">{toArabicNumerals(price.toFixed(3))} د.ك</span>
        </div>
      )}
    </div>
  );
};
