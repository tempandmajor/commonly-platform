
import { supabase } from "@/integrations/supabase/client";
import { Podcast, PodcastCategory, PodcastComment } from "@/types/podcast";
import { uploadFile } from "@/services/storageService";

// Re-export functions from podcast/index.ts
export * from "@/services/podcast";

// Add missing getPodcasts function that's required by Podcasts.tsx
export const getPodcasts = async (
  pageSize = 10,
  lastId?: string,
  category?: string,
  searchTerm?: string
): Promise<{ podcasts: Podcast[]; lastId: string | null }> => {
  try {
    let query = supabase
      .from('podcasts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category_id', category);
    }
    
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    if (lastId) {
      const { data: lastPodcast, error: lastPodcastError } = await supabase
        .from('podcasts')
        .select('created_at')
        .eq('id', lastId)
        .single();

      if (lastPodcastError) throw lastPodcastError;
      
      if (lastPodcast) {
        query = query.lt('created_at', lastPodcast.created_at);
      }
    }
    
    query = query.limit(pageSize);
    
    const { data, error } = await query;
    
    if (error) throw error;

    // Map to our Podcast type
    const podcasts: Podcast[] = data.map(podcast => ({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description || undefined,
      imageUrl: podcast.image_url || undefined,
      audioUrl: podcast.audio_url || undefined,
      videoUrl: undefined,
      thumbnailUrl: undefined,
      duration: podcast.duration || 0,
      createdAt: podcast.created_at,
      userId: podcast.user_id,
      userName: "Unknown", // We don't have user data here
      userPhotoUrl: undefined,
      categoryId: podcast.category_id || undefined,
      likeCount: podcast.like_count || 0,
      viewCount: podcast.view_count || 0,
      shareCount: podcast.share_count || 0,
      published: podcast.published || false,
      type: 'audio', // Default type
      visibility: 'public', // Default visibility
      listens: 0,
      tags: []
    }));

    return {
      podcasts,
      lastId: data.length > 0 ? data[data.length - 1].id : null
    };
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    throw error;
  }
};

// Additional missing functions
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
    
    // Map to our Podcast type
    return data.map(podcast => ({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description || undefined,
      imageUrl: podcast.image_url || undefined,
      audioUrl: podcast.audio_url || undefined,
      videoUrl: undefined,
      thumbnailUrl: undefined,
      duration: podcast.duration || 0,
      createdAt: podcast.created_at,
      userId: podcast.user_id,
      userName: "Unknown",
      userPhotoUrl: undefined,
      categoryId: podcast.category_id || undefined,
      likeCount: podcast.like_count || 0,
      viewCount: podcast.view_count || 0,
      shareCount: podcast.share_count || 0,
      published: podcast.published || false,
      type: 'audio',
      visibility: 'public',
      listens: 0,
      tags: []
    }));
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
    
    // Map to our Podcast type
    return data.map(podcast => ({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description || undefined,
      imageUrl: podcast.image_url || undefined,
      audioUrl: podcast.audio_url || undefined,
      videoUrl: undefined,
      thumbnailUrl: undefined,
      duration: podcast.duration || 0,
      createdAt: podcast.created_at,
      userId: podcast.user_id,
      userName: "Unknown",
      userPhotoUrl: undefined,
      categoryId: podcast.category_id || undefined,
      likeCount: podcast.like_count || 0,
      viewCount: podcast.view_count || 0,
      shareCount: podcast.share_count || 0,
      published: podcast.published || false,
      type: 'audio',
      visibility: 'public',
      listens: 0,
      tags: []
    }));
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
        content
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Map to our PodcastComment type
    return {
      id: data.id,
      podcastId: data.podcast_id,
      userId: data.user_id,
      userName: userName, // Use the provided userName
      userPhotoUrl: userPhotoUrl, // Use the provided userPhotoUrl
      content: data.content,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error adding podcast comment:", error);
    return null;
  }
};

export const getPodcastComments = async (podcastId: string): Promise<PodcastComment[]> => {
  try {
    const { data, error } = await supabase
      .from('podcast_comments')
      .select('*, users:user_id(display_name, photo_url)')
      .eq('podcast_id', podcastId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map to our PodcastComment type
    return data.map(comment => ({
      id: comment.id,
      podcastId: comment.podcast_id,
      userId: comment.user_id,
      userName: comment.users?.display_name || "Unknown User",
      userPhotoUrl: comment.users?.photo_url,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at
    }));
  } catch (error) {
    console.error("Error fetching podcast comments:", error);
    return [];
  }
};
