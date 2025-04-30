
export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  inventoryCount: number;
  isDigital: boolean;
  digitalFileUrl?: string;
  category?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
}

export interface Order {
  id: string;
  userId: string;
  merchantId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentIntentId?: string;
  shippingAddress?: any;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantStore {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  shippingPolicy?: string;
  returnPolicy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  logo?: File; // Added for form handling
  banner?: File; // Added for form handling
}
