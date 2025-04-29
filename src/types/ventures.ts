
export interface ArtistProfile {
  id: string;
  name: string;
  bio: string;
  imageUrl?: string;
  category: 'management' | 'records' | 'studios';
  featured: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    spotify?: string;
    youtube?: string;
    website?: string;
  };
  createdAt: any;
  updatedAt: any;
}

export interface VenturesContent {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  heroImage?: string;
  sections?: {
    title: string;
    content: string;
    imageUrl?: string;
  }[];
  updatedAt: any;
}
