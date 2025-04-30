
export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  inventoryCount: number;
  isDigital: boolean;
  digitalFileUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isMainImage: boolean;
  createdAt: string;
}
