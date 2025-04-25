
import { Timestamp } from "firebase/firestore";

export interface CatererLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isSignature: boolean;
  category: string; // e.g., "Appetizers", "Main Course", "Desserts"
  dietaryOptions: string[]; // e.g., ["Vegetarian", "Gluten-Free"]
  photoUrl?: string;
}

export interface CateringService {
  id: string;
  name: string;
  description: string;
  minGuests: number;
  maxGuests: number;
  pricePerGuest: number;
  setupFee?: number;
  travelFee?: number;
  plateFee?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface CatererPhoto {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  storagePath?: string;
}

export interface CatererAvailability {
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface CatererPricing {
  currency: string;
  minimumOrderAmount: number;
  deliveryFee?: number;
  travelRadius?: number; // Distance in miles caterer is willing to travel
  serviceTypes: {
    pickup: boolean;
    delivery: boolean;
    fullService: boolean; // Includes servers, setup, cleanup
  };
}

export interface Caterer {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  ownerPhotoURL?: string;
  email: string;
  phone?: string;
  location: CatererLocation;
  photos: CatererPhoto[];
  specialties: string[];
  cuisineTypes: string[];
  menuCategories: MenuCategory[];
  services: CateringService[];
  availability: CatererAvailability[];
  pricing: CatererPricing;
  isVerified: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CatererReport {
  id?: string;
  catererId: string;
  userId: string;
  reason: string;
  description: string;
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CatererSearchParams {
  location?: {
    lat: number;
    lng: number;
  };
  radiusKm?: number;
  cuisineType?: string | null;
  priceMin?: number;
  priceMax?: number;
  minGuests?: number;
  maxGuests?: number;
  date?: Date;
  serviceType?: 'pickup' | 'delivery' | 'fullService' | null;
}
