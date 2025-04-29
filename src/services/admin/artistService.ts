
import { supabase } from '@/integrations/supabase/client';
import { ArtistProfile } from '@/types/artist';

export const addArtistProfile = async (artistData: Omit<ArtistProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Prepare data for insertion
    const newArtist = {
      name: artistData.name,
      bio: artistData.bio,
      image_url: artistData.imageUrl,
      category: artistData.category,
      social_links: artistData.socialLinks,
      featured: artistData.featured || false
    };
    
    const { data, error } = await supabase
      .from('artists')
      .insert(newArtist)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      bio: data.bio,
      imageUrl: data.image_url,
      category: data.category,
      socialLinks: data.social_links,
      featured: data.featured,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error adding artist profile:", error);
    throw error;
  }
};

export const uploadArtistImage = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `artists/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('artists')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage.from('artists').getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading artist image:", error);
    throw error;
  }
};
