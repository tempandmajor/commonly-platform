
import { supabase } from "@/integrations/supabase/client";
// Import types directly to avoid circular references
import type { Podcast } from "@/types/podcast";

/**
 * Get featured podcasts
 */
export const getFeaturedPodcasts = async (limit = 6): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return (data || []).map(convertDbPodcastToPodcast);
  } catch (error) {
    console.error("Error fetching featured podcasts:", error);
    return [];
  }
};

/**
 * Convert DB format to app format
 */
const convertDbPodcastToPodcast = (dbPodcast: any): Podcast => {
  return {
    id: dbPodcast.id,
    title: dbPodcast.title,
    description: dbPodcast.description || '',
    imageUrl: dbPodcast.image_url,
    audioUrl: dbPodcast.audio_url,
    videoUrl: dbPodcast.video_url,
    thumbnailUrl: dbPodcast.thumbnail_url,
    duration: dbPodcast.duration || 0,
    createdAt: dbPodcast.created_at,
    userId: dbPodcast.user_id,
    userName: "Unknown", // We'll need to fetch user data separately
    userPhotoUrl: undefined,
    categoryId: dbPodcast.category_id,
    likeCount: dbPodcast.like_count || 0,
    viewCount: dbPodcast.view_count || 0,
    shareCount: dbPodcast.share_count || 0,
    published: dbPodcast.published,
    // Convert string types to proper enum values
    type: (dbPodcast.type as "audio" | "video") || "audio",
    visibility: (dbPodcast.visibility as "public" | "private" | "unlisted") || "public",
    listens: dbPodcast.listens || 0,
    tags: dbPodcast.tags || [],
    creatorId: dbPodcast.creator_id,
    creatorName: dbPodcast.creator_name,
    isExternal: dbPodcast.is_external || false,
  };
};

/**
 * Create a new podcast
 */
export const createPodcast = async (podcastData: any): Promise<Podcast | null> => {
  try {
    // Convert to DB format
    const dbPodcast = {
      title: podcastData.title,
      description: podcastData.description,
      user_id: podcastData.userId,
      user_name: podcastData.userName,
      user_photo_url: podcastData.userPhotoUrl,
      category_id: podcastData.categoryId,
      type: podcastData.type,
      duration: podcastData.duration || 0,
      published: podcastData.published,
      visibility: podcastData.visibility,
      tags: podcastData.tags,
      audio_url: podcastData.audioUrl,
      video_url: podcastData.videoUrl,
      image_url: podcastData.imageUrl,
      like_count: podcastData.likeCount || 0,
      view_count: podcastData.viewCount || 0,
      share_count: podcastData.shareCount || 0,
      creator_id: podcastData.creatorId,
      creator_name: podcastData.creatorName,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('podcasts')
      .insert(dbPodcast)
      .select()
      .single();
    
    if (error) throw error;
    
    return convertDbPodcastToPodcast(data);
  } catch (error) {
    console.error("Error creating podcast:", error);
    return null;
  }
};

/**
 * Increments the listen count for a podcast
 */
export const incrementListenCount = async (podcastId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('increment_podcast_listens', {
      podcast_id_param: podcastId
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error incrementing podcast listen count:", error);
    return false;
  }
};

// Re-export other services from podcast subdirectory for backward compatibility
export * from './podcast/categoryService';
export * from './podcast/podcastCrudService';
export * from './podcast/commentService';
export * from './podcast/sessionService';
export * from './podcast/statsService';
