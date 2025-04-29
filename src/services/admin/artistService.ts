
import { supabase } from '@/integrations/supabase/client';

// Ventures content
export const addArtistProfile = async (profile: any) => {
  try {
    const { data, error } = await supabase
      .from('artists')
      .insert({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error adding artist profile:", error);
    throw error;
  }
};

export const uploadArtistImage = async (artistId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `artists/${artistId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase
      .storage
      .from('artists')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('artists')
      .getPublicUrl(filePath);
    
    const downloadURL = urlData.publicUrl;
    
    // Update artist with image URL
    const { error: updateError } = await supabase
      .from('artists')
      .update({
        image_url: downloadURL,
        updated_at: new Date().toISOString()
      })
      .eq('id', artistId);
    
    if (updateError) throw updateError;
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading artist image:", error);
    throw error;
  }
};
