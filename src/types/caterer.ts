
export interface Caterer {
  id: string;
  name: string;
  description?: string;
  rating?: number;
  reviews?: number;
  ownerName: string;
  ownerPhotoURL?: string;
  email: string;
  phone?: string;
  location: string;
  photos: string[];
  price?: number;
  pricing: {
    tier: string;
    minPrice?: number;
    maxPrice?: number;
  };
  services: string[];
  specialties: string[];
  availability: string[];
  menuCategories: {
    name: string;
    items: {
      name: string;
      description?: string;
      price: number;
      image?: string;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CatererSearchParams {
  query?: string;
  location?: string;
  priceRange?: string;
  services?: string[];
  rating?: number;
  availability?: string;
}
