
import { Timestamp } from "firebase/firestore";

export interface VenueLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface VenueAvailability {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // 24-hour format: "09:00"
  endTime: string; // 24-hour format: "17:00"
}

export interface VenueRule {
  id: string;
  description: string;
}

export interface VenueAmenity {
  id: string;
  name: string;
  icon?: string;
}

export interface VenuePricing {
  hourlyRate: number;
  dailyRate?: number;
  minimumHours: number;
  cleaningFee?: number;
  securityDeposit?: number;
  currency: string;
}

export interface VenuePhoto {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  storagePath?: string;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  size: {
    value: number;
    unit: 'sqft' | 'sqm';
  };
  location: VenueLocation;
  amenities: VenueAmenity[];
  rules: VenueRule[];
  photos: VenuePhoto[];
  pricing: VenuePricing;
  availability: VenueAvailability[];
  ownerId: string;
  ownerName: string;
  ownerPhotoURL?: string;
  stripeConnectId?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  rating?: number;
  reviewCount?: number;
}

export interface VenueBooking {
  id: string;
  venueId: string;
  eventId?: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  totalAmount: number;
  platformFee: number;
  cleaningFee?: number;
  securityDeposit?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentIntentId?: string;
  stripeTransferId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VenueReport {
  id: string;
  venueId: string;
  userId: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
