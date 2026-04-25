import React from 'react';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';
import { toArabicNumerals } from '../../utils/arabicUtils';

export interface ProductLabelProps {
  id: string;
  name: string;
  name_ar?: string;
  brand?: string;
  brand_ar?: string;
  sku: string;
  price?: number;
  size?: '38x25' | '50x30' | '100x150' | '80x25' | string;
  barcodeType?: 'barcode' | 'qrcode' | 'none';
  barcodeData?: string;
  showName?: boolean;
  showNameAr?: boolean;
  showPrice?: boolean;
  showBrand?: boolean;
  showSkuText?: boolean;
}

export const ProductLabel: React.FC<ProductLabelProps> = ({ 
  id, 
  name, 
  name_ar, 
  brand, 
  brand_ar, 
  sku, 
  price,
  size = '38x25',
  barcodeType = 'barcode',
  barcodeData,
  showName = true,
  showNameAr = true,
  showPrice = true,
  showBrand = true,
  showSkuText = true
}) => {
  const codeValue = barcodeData || sku || '00000';
  const isSmall = size === '38x25';

  return (
    <div 
      id={id}
      className="bg-white text-black p-2 flex flex-col items-center justify-center text-center overflow-hidden border border-gray-100"
      style={{ 
        width: size === '38x25' ? '143px' : (size === '50x30' ? '188px' : (size === '80x25' ? '302px' : '377px')),
        height: size === '38x25' ? '94px' : (size === '50x30' ? '113px' : (size === '80x25' ? '94px' : '566px')),
        fontFamily: "'Inter', 'Noto Sans Arabic', sans-serif"
      }}
    >
      {/* Brand Header */}
      {showBrand && (
        <div className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
          {brand || 'Retail Asset'} {brand_ar && `| ${brand_ar}`}
        </div>
      )}

      {/* Main Name */}
      {showName && (
        <div className="text-[9px] font-black uppercase leading-tight line-clamp-1">
          {name}
        </div>
      )}
      {showNameAr && name_ar && (
        <div className="text-[8px] font-bold text-gray-600 leading-tight line-clamp-1 mt-0.5" dir="rtl">
          {name_ar}
        </div>
      )}

      {/* Code Generation */}
      {barcodeType !== 'none' && (
        <div className="mt-1 flex flex-col items-center justify-center scale-90 origin-top">
          {barcodeType === 'qrcode' ? (
            <div className="bg-white p-0.5">
              <QRCode value={codeValue} size={isSmall ? 28 : 40} level="L" />
            </div>
          ) : (
            <Barcode 
              value={codeValue} 
              width={isSmall ? 1 : 1.5} 
              height={isSmall ? 20 : 30} 
              displayValue={false} 
              margin={0}
              background="transparent"
            />
          )}
          {showSkuText && (
            <div className="text-[6px] font-mono font-bold tracking-widest text-gray-500 mt-0.5">
              {codeValue}
            </div>
          )}
        </div>
      )}

      {/* Price if available */}
      {showPrice && price !== undefined && (
        <div className="text-[10px] font-black flex items-center gap-2 mt-auto pt-1">
          <span>{price.toFixed(3)} KD</span>
          <span className="text-[7px] text-gray-400 font-bold" dir="rtl">{toArabicNumerals(price.toFixed(3))} د.ك</span>
        </div>
      )}
    </div>
  );
};

