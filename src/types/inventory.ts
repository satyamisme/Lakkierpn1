export interface ProductVariant {
  id: string;
  sku: string;
  storeId?: string;
  color?: string;
  storage?: string;
  otherAttributes?: Record<string, string>;
  costPrice: number;
  retailPrice: number;
  stock: number;
  isImeiRequired?: boolean;
  isSerialRequired?: boolean;
}

export interface UniqueUnit {
  imei?: string;
  serial?: string;
  costPrice: number;
  retailPrice: number;
  variantId?: string;
  locationId: string;
  binLocation?: string; // Shelf, Rack, Zone
  status: 'available' | 'sold' | 'reserved' | 'repair' | 'transit';
  batchId: string;
  purchaseDate: string;
  month: string;
  year: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  orderDate: string;
  status: 'draft' | 'pending' | 'partially_received' | 'completed' | 'cancelled';
  items: POItem[];
  totalCost: number;
  notes?: string;
}

export interface POItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
  expectedImeis?: boolean;
  expectedSerials?: boolean;
}

export interface InventoryProduct {
  id: string;
  name: string;
  baseSku: string;
  category: string;
  brand?: string;
  model?: string;
  description?: string;
  isImeiRequired: boolean;
  isSerialRequired: boolean;
  variants: ProductVariant[];
  totalStock: number;
}
