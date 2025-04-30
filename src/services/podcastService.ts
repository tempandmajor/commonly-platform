
import { supabase } from "@/integrations/supabase/client";
import { Podcast, PodcastCategory, PodcastComment } from "@/types/podcast";
import { uploadFile } from "@/services/storageService";

// Re-export functions from podcast/index.ts
export * from "@/services/podcast";

// Add missing functions
export const incrementListenCount = async (podcastId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_podcast_listens', { podcast_id_param: podcastId });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error incrementing listen count:", error);
    throw error;
  }
};

export const getPodcastsByCategory = async (categoryId: string): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('category_id', categoryId)
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as Podcast[];
  } catch (error) {
    console.error("Error fetching podcasts by category:", error);
    return [];
  }
};

export const getFeaturedPodcasts = async (): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('featured', true)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    return data as Podcast[];
  } catch (error) {
    console.error("Error fetching featured podcasts:", error);
    return [];
  }
};

export const addPodcastComment = async (
  podcastId: string,
  userId: string,
  userName: string,
  userPhotoUrl: string | undefined,
  content: string
): Promise<PodcastComment | null> => {
  try {
    const { data, error } = await supabase
      .from('podcast_comments')
      .insert({
        podcast_id: podcastId,
        user_id: userId,
        user_name: userName,
        user_photo_url: userPhotoUrl,
        content,
        created_at: new Date()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data as PodcastComment;
  } catch (error) {
    console.error("Error adding podcast comment:", error);
    return null;
  }
};

export const getPodcastComments = async (podcastId: string): Promise<PodcastComment[]> => {
  try {
    const { data, error } = await supabase
      .from('podcast_comments')
      .select('*')
      .eq('podcast_id', podcastId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as PodcastComment[];
  } catch (error) {
    console.error("Error fetching podcast comments:", error);
    return [];
  }
};
