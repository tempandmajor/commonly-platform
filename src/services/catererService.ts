
import { supabase } from "@/integrations/supabase/client";

// Define the Caterer interface
export interface Caterer {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cuisineTypes: string[];
  rating: number;
  reviewCount: number;
  priceRange: string;
  minimumOrder: number;
  maxGuests: number;
  createdAt: string;
  ownerId: string;
  isVerified: boolean;
}

// Get caterer by ID
export const getCaterer = async (catererId: string): Promise<Caterer | null> => {
  try {
    // Since there's no caterers table yet, we'll mock this
    console.log(`Fetching caterer with ID: ${catererId}`);
    
    // Mock data for development
    return {
      id: catererId,
      name: "Gourmet Delights Catering",
      description: "Premium catering service for all occasions",
      imageUrl: "/placeholder.svg",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      cuisineTypes: ["Italian", "French", "Mediterranean"],
      rating: 4.8,
      reviewCount: 124,
      priceRange: "$$",
      minimumOrder: 200,
      maxGuests: 500,
      createdAt: new Date().toISOString(),
      ownerId: "mock-owner-id",
      isVerified: true
    };
  } catch (error) {
    console.error("Error fetching caterer:", error);
    return null;
  }
};

// Get all caterers
export const getCaterers = async (
  filters?: {
    cuisineType?: string;
    priceRange?: string;
    city?: string;
    minGuests?: number;
  },
  limit: number = 10,
  offset: number = 0
): Promise<{ caterers: Caterer[]; total: number }> => {
  try {
    // Mock data since there's no caterers table yet
    const mockCaterers: Caterer[] = [
      {
        id: "1",
        name: "Gourmet Delights Catering",
        description: "Premium catering service for all occasions",
        imageUrl: "/placeholder.svg",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        cuisineTypes: ["Italian", "French", "Mediterranean"],
        rating: 4.8,
        reviewCount: 124,
        priceRange: "$$",
        minimumOrder: 200,
        maxGuests: 500,
        createdAt: new Date().toISOString(),
        ownerId: "mock-owner-id-1",
        isVerified: true
      },
      {
        id: "2",
        name: "Taste of Asia",
        description: "Authentic Asian cuisine for events of all sizes",
        imageUrl: "/placeholder.svg",
        address: "456 Park Ave",
        city: "San Francisco",
        state: "CA",
        zipCode: "94107",
        cuisineTypes: ["Chinese", "Japanese", "Thai"],
        rating: 4.6,
        reviewCount: 98,
        priceRange: "$$$",
        minimumOrder: 300,
        maxGuests: 350,
        createdAt: new Date().toISOString(),
        ownerId: "mock-owner-id-2",
        isVerified: true
      },
      {
        id: "3",
        name: "Southern Comfort Catering",
        description: "Homestyle southern cooking for your special events",
        imageUrl: "/placeholder.svg",
        address: "789 Oak St",
        city: "Atlanta",
        state: "GA",
        zipCode: "30301",
        cuisineTypes: ["Southern", "BBQ", "Comfort Food"],
        rating: 4.9,
        reviewCount: 145,
        priceRange: "$$",
        minimumOrder: 150,
        maxGuests: 200,
        createdAt: new Date().toISOString(),
        ownerId: "mock-owner-id-3",
        isVerified: true
      }
    ];

    // Apply filters if provided
    let filtered = [...mockCaterers];
    if (filters) {
      if (filters.cuisineType) {
        filtered = filtered.filter(c => c.cuisineTypes.includes(filters.cuisineType!));
      }
      if (filters.priceRange) {
        filtered = filtered.filter(c => c.priceRange === filters.priceRange);
      }
      if (filters.city) {
        filtered = filtered.filter(c => c.city.toLowerCase().includes(filters.city!.toLowerCase()));
      }
      if (filters.minGuests) {
        filtered = filtered.filter(c => c.maxGuests >= filters.minGuests!);
      }
    }

    // Apply pagination
    const paginatedResults = filtered.slice(offset, offset + limit);

    return {
      caterers: paginatedResults,
      total: filtered.length
    };
  } catch (error) {
    console.error("Error fetching caterers:", error);
    return { caterers: [], total: 0 };
  }
};

// For compatibility with the ReportCatererDialog component
export { reportCaterer } from "@/services/reportService";
