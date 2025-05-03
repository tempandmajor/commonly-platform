import { supabase } from "@/integrations/supabase/client";
import { Podcast, PodcastCategory } from "@/types/podcast";

interface ApiPodcast {
  id: string;
  user_id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string;
  category_id: string;
  duration: number;
  published: boolean;
  featured: boolean;
  view_count: number;
  like_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  // Optional fields that might not be present
  video_url?: string;
  thumbnail_url?: string;
  type?: string;
  visibility?: string;
  listens?: number;
  tags?: string[];
}

// Function to adapt API podcast format to application format
function adaptPodcast(podcast: ApiPodcast): Podcast {
  return {
    id: podcast.id,
    userId: podcast.user_id,
    title: podcast.title,
    description: podcast.description,
    audioUrl: podcast.audio_url,
    videoUrl: podcast.video_url || null,
    imageUrl: podcast.image_url,
    thumbnailUrl: podcast.thumbnail_url || podcast.image_url,
    categoryId: podcast.category_id,
    category: null, // Will be populated separately if needed
    duration: podcast.duration,
    published: podcast.published,
    featured: podcast.featured,
    views: podcast.view_count,
    likes: podcast.like_count,
    shares: podcast.share_count,
    createdAt: podcast.created_at,
    updatedAt: podcast.updated_at,
    type: podcast.type || 'audio',
    visibility: podcast.visibility || 'public',
    listens: podcast.listens || 0,
    tags: podcast.tags || []
  };
}

// Get all podcasts
export const getAllPodcasts = async (): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching podcasts:", error);
      throw error;
    }

    return (data || []).map(adaptPodcast);
  } catch (error) {
    console.error("Error in getAllPodcasts:", error);
    return [];
  }
};

// Get featured podcasts
export const getFeaturedPodcasts = async (limit = 6): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching featured podcasts:", error);
      throw error;
    }

    return (data || []).map(adaptPodcast);
  } catch (error) {
    console.error("Error in getFeaturedPodcasts:", error);
    return [];
  }
};

// Get podcasts by category
export const getPodcastsByCategory = async (categoryId: string): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('published', true)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching podcasts by category:", error);
      throw error;
    }

    return (data || []).map(adaptPodcast);
  } catch (error) {
    console.error("Error in getPodcastsByCategory:", error);
    return [];
  }
};

// Get a specific podcast by ID
export const getPodcastById = async (podcastId: string): Promise<Podcast | null> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', podcastId)
      .single();

    if (error) {
      console.error("Error fetching podcast by ID:", error);
      throw error;
    }

    if (!data) return null;
    return adaptPodcast(data);
  } catch (error) {
    console.error("Error in getPodcastById:", error);
    return null;
  }
};

// Create a new podcast
export const createPodcast = async (podcastData: Omit<Podcast, 'id' | 'createdAt' | 'updatedAt'>): Promise<Podcast | null> => {
  try {
    // Convert to snake_case for the database
    const dbPodcast = {
      user_id: podcastData.userId,
      title: podcastData.title,
      description: podcastData.description,
      audio_url: podcastData.audioUrl,
      video_url: podcastData.videoUrl,
      image_url: podcastData.imageUrl,
      thumbnail_url: podcastData.thumbnailUrl,
      category_id: podcastData.categoryId,
      duration: podcastData.duration,
      published: podcastData.published,
      featured: podcastData.featured || false,
      view_count: 0,
      like_count: 0,
      share_count: 0,
      type: podcastData.type || 'audio',
      visibility: podcastData.visibility || 'public',
      tags: podcastData.tags || []
    };

    const { data, error } = await supabase
      .from('podcasts')
      .insert(dbPodcast)
      .select()
      .single();

    if (error) {
      console.error("Error creating podcast:", error);
      throw error;
    }

    return adaptPodcast(data);
  } catch (error) {
    console.error("Error in createPodcast:", error);
    return null;
  }
};

// Get categories for podcasts
export const getPodcastCategories = async (): Promise<PodcastCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('podcast_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching podcast categories:", error);
      throw error;
    }

    return data.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      imageUrl: category.image_url || null
    }));
  } catch (error) {
    console.error("Error in getPodcastCategories:", error);
    return [];
  }
};

// Update podcast view count
export const incrementPodcastViews = async (podcastId: string): Promise<void> => {
  try {
    await supabase
      .from('podcasts')
      .update({ view_count: supabase.rpc('increment', { row_id: podcastId, table_name: 'podcasts', column_name: 'view_count' }) })
      .eq('id', podcastId);
  } catch (error) {
    console.error("Error incrementing podcast views:", error);
  }
};

// Define interface for podcast creation input
export interface PodcastCreateInput {
  userId: string;
  title: string;
  description: string;
  audioUrl: string;
  videoUrl?: string | null;
  imageUrl: string;
  thumbnailUrl?: string | null;
  categoryId: string;
  duration: number;
  published?: boolean;
  type?: 'audio' | 'video';
  visibility?: 'public' | 'private' | 'unlisted';
  tags?: string[];
}
