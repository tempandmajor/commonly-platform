
export interface MerchantStore {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
  active?: boolean; // Some code uses this property instead of isActive
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inventoryCount: number;
  isDigital: boolean;
  digitalFileUrl?: string;
  createdAt: string;
  updatedAt: string;
}
