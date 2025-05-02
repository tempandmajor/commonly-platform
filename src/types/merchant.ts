
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
  category?: string; // Added this field as it's used in StoreProducts.tsx
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  customerName: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}
