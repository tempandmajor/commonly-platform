
import { supabase } from '@/integrations/supabase/client';
import { Caterer, CatererPhoto, CatererLocation, CatererPricing, CateringService, CatererAvailability, MenuCategory, MenuItem } from '@/types/caterer';

// Mock caterer data for development purposes
const mockCaterers: Caterer[] = [
  {
    id: '1',
    name: 'Gourmet Delights',
    description: 'Luxury catering for all occasions with a focus on local ingredients',
    rating: 4.8,
    reviews: 124,
    ownerName: 'Julia Chen',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    email: 'contact@gourmetdelights.com',
    phone: '(555) 123-4567',
    location: {
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      lat: 37.7749,
      lng: -122.4194
    },
    photos: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        isPrimary: true
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
      }
    ],
    pricing: {
      tier: 'Premium',
      minPrice: 75,
      maxPrice: 150,
      minimumOrderAmount: 500,
      serviceTypes: {
        pickup: true,
        delivery: true,
        fullService: true
      },
      currency: 'USD'
    },
    services: [
      {
        id: '1',
        name: 'Wedding Catering',
        description: 'Full service catering for weddings',
        pricePerGuest: 120,
        minGuests: 50,
        maxGuests: 500
      },
      {
        id: '2',
        name: 'Corporate Events',
        description: 'Professional catering for business meetings',
        pricePerGuest: 85,
        minGuests: 25,
        maxGuests: 200
      }
    ],
    specialties: ['Farm-to-Table', 'International Cuisine', 'Vegan Options', 'Custom Menus'],
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" }
    ],
    menuCategories: [
      {
        id: '1',
        name: 'Appetizers',
        items: [
          { 
            id: '101',
            name: 'Bruschetta', 
            description: 'Toasted bread topped with tomatoes, garlic, and basil', 
            price: 12,
            dietaryOptions: ['vegetarian']
          },
          { 
            id: '102',
            name: 'Shrimp Cocktail', 
            description: 'Chilled shrimp with cocktail sauce', 
            price: 16,
            dietaryOptions: ['seafood'] 
          }
        ]
      },
      {
        id: '2',
        name: 'Main Courses',
        items: [
          { 
            id: '201',
            name: 'Filet Mignon', 
            description: '8oz filet with red wine reduction', 
            price: 32,
            dietaryOptions: ['meat'] 
          },
          { 
            id: '202',
            name: 'Grilled Salmon', 
            description: 'Atlantic salmon with lemon butter sauce', 
            price: 28,
            dietaryOptions: ['seafood', 'gluten-free'] 
          }
        ]
      }
    ],
    cuisineTypes: ['Italian', 'French', 'American'],
    isVerified: true,
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: '2023-05-20T12:30:00Z'
  },
  {
    id: '2',
    name: 'Festive Bites',
    description: 'Casual and fun catering solutions for parties and gatherings',
    rating: 4.5,
    reviews: 89,
    ownerName: 'Mark Johnson',
    ownerPhotoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    email: 'info@festivebites.com',
    phone: '(555) 987-6543',
    location: {
      address: '456 Market St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      lat: 34.0522,
      lng: -118.2437
    },
    photos: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        isPrimary: true
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
      }
    ],
    pricing: {
      tier: 'Standard',
      minPrice: 40,
      maxPrice: 85,
      minimumOrderAmount: 300,
      serviceTypes: {
        pickup: true,
        delivery: true,
        fullService: false
      },
      currency: 'USD'
    },
    services: [
      {
        id: '1',
        name: 'Birthday Parties',
        description: 'Fun food for celebrations',
        pricePerGuest: 45,
        minGuests: 15,
        maxGuests: 100
      },
      {
        id: '2',
        name: 'Office Lunches',
        description: 'Corporate catering',
        pricePerGuest: 30,
        minGuests: 10,
        maxGuests: 50
      }
    ],
    specialties: ['American Cuisine', 'BBQ', 'Finger Foods', 'Dessert Bars'],
    availability: [
      { dayOfWeek: 5, startTime: "16:00", endTime: "23:00" },
      { dayOfWeek: 6, startTime: "10:00", endTime: "23:00" }
    ],
    menuCategories: [
      {
        id: '1',
        name: 'Platters',
        items: [
          { 
            id: '101',
            name: 'Sliders Assortment',
            description: 'Beef, chicken, and veggie sliders', 
            price: 60,
            dietaryOptions: ['meat', 'vegetarian'] 
          },
          { 
            id: '102',
            name: 'Mediterranean Platter', 
            description: 'Hummus, falafel, and pita', 
            price: 45,
            dietaryOptions: ['vegetarian', 'vegan'] 
          }
        ]
      }
    ],
    cuisineTypes: ['American', 'Mediterranean', 'BBQ'],
    isVerified: false,
    createdAt: '2023-02-10T10:15:00Z',
    updatedAt: '2023-06-05T09:45:00Z'
  }
];

export const getCaterers = async (lastVisible: any = null) => {
  try {
    // In a real app, we would query Supabase here
    // For now, return mock data with pagination
    const start = lastVisible ? parseInt(lastVisible) : 0;
    const limit = 12;
    const end = start + limit;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const paginatedCaterers = mockCaterers.slice(start, end);
    
    return {
      caterers: paginatedCaterers,
      total: mockCaterers.length,
      lastVisible: end < mockCaterers.length ? end.toString() : null
    };
  } catch (error) {
    console.error("Error fetching caterers:", error);
    throw error;
  }
};

export const getCaterer = async (id: string) => {
  try {
    // In a real app, we would query Supabase here
    // For now, return mock data
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const caterer = mockCaterers.find(c => c.id === id);
    
    if (!caterer) {
      throw new Error("Caterer not found");
    }
    
    return caterer;
  } catch (error) {
    console.error(`Error fetching caterer with id ${id}:`, error);
    throw error;
  }
};

export const reportCaterer = async (catererId: string, reason: string, details: string) => {
  try {
    // In a real implementation, we'd send this to Supabase
    console.log(`Reporting caterer ${catererId} for reason: ${reason}`, { details });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Report submitted successfully' };
  } catch (error) {
    console.error("Error reporting caterer:", error);
    throw error;
  }
};
