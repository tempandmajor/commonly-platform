
import { supabase } from '@/integrations/supabase/client';
import { Caterer } from '@/types/caterer';

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
    location: 'San Francisco, CA',
    photos: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546833998-877b37c2e5c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    ],
    pricing: {
      tier: 'Premium',
      minPrice: 75,
      maxPrice: 150
    },
    services: ['Wedding Catering', 'Corporate Events', 'Private Parties', 'Cocktail Receptions'],
    specialties: ['Farm-to-Table', 'International Cuisine', 'Vegan Options', 'Custom Menus'],
    availability: ['Weekdays', 'Weekends', 'Holidays'],
    menuCategories: [
      {
        name: 'Appetizers',
        items: [
          { name: 'Bruschetta', description: 'Toasted bread topped with tomatoes, garlic, and basil', price: 12 },
          { name: 'Shrimp Cocktail', description: 'Chilled shrimp with cocktail sauce', price: 16 }
        ]
      },
      {
        name: 'Main Courses',
        items: [
          { name: 'Filet Mignon', description: '8oz filet with red wine reduction', price: 32 },
          { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter sauce', price: 28 }
        ]
      }
    ],
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
    location: 'Los Angeles, CA',
    photos: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    ],
    pricing: {
      tier: 'Standard',
      minPrice: 40,
      maxPrice: 85
    },
    services: ['Birthday Parties', 'Office Lunches', 'Family Gatherings', 'Picnics'],
    specialties: ['American Cuisine', 'BBQ', 'Finger Foods', 'Dessert Bars'],
    availability: ['Weekends', 'Evenings'],
    menuCategories: [
      {
        name: 'Platters',
        items: [
          { name: 'Sliders Assortment', description: 'Beef, chicken, and veggie sliders', price: 60 },
          { name: 'Mediterranean Platter', description: 'Hummus, falafel, and pita', price: 45 }
        ]
      }
    ],
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
