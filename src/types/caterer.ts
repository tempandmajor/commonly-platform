
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
  location: CatererLocation;
  photos: CatererPhoto[];
  price?: number;
  pricing: CatererPricing;
  services: CateringService[];
  specialties: string[];
  availability: CatererAvailability[];
  menuCategories: MenuCategory[];
  cuisineTypes: string[];
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CatererPhoto {
  id: string;
  url: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface CatererLocation {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
}

export interface CatererPricing {
  tier: string;
  minPrice?: number;
  maxPrice?: number;
  minimumOrderAmount: number;
  deliveryFee?: number;
  serviceTypes: {
    pickup: boolean;
    delivery: boolean;
    fullService: boolean;
  };
  currency: string;
}

export interface CateringService {
  id: string;
  name: string;
  description: string;
  pricePerGuest: number;
  minGuests: number;
  maxGuests: number;
  setupFee?: number;
}

export interface CatererAvailability {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  photoUrl?: string;
  dietaryOptions: string[];
}

export interface CatererSearchParams {
  query?: string;
  location?: string | { lat: number; lng: number };
  priceRange?: string;
  services?: string[];
  rating?: number;
  availability?: string;
  cuisineType?: string | null;
  priceMin?: number;
  priceMax?: number;
  minGuests?: number;
  maxGuests?: number;
  serviceType?: 'pickup' | 'delivery' | 'fullService' | null;
}
