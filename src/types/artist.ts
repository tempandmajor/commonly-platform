
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
  createdAt: string;
  updatedAt: string;
}
