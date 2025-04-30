
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "./storageService";
import { Podcast, PodcastCategory } from "@/types/podcast";

export interface PodcastInput {
  title: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  type: "audio" | "video";
  category: string;
  duration: number;
  isExternal: boolean;
  visibility: "public" | "private" | "unlisted";
  tags?: string[];
  videoUrl?: string;
  audioUrl?: string;
}

/**
 * Create a new podcast in Supabase
 */
export const createPodcast = async (
  podcastData: PodcastInput,
  audioFile?: File,
  videoFile?: File,
  thumbnailFile?: File
): Promise<string> => {
  try {
    let imageUrl = "";
    let audioUrl = "";
    let videoUrl = "";

    // Upload thumbnail if provided
    if (thumbnailFile) {
      imageUrl = await uploadFile(thumbnailFile, "podcasts", "thumbnails");
    }

    // Upload audio file if provided
    if (audioFile) {
      audioUrl = await uploadFile(audioFile, "podcasts", "audio");
    } else if (podcastData.audioUrl) {
      audioUrl = podcastData.audioUrl;
    }

    // Upload video file if provided
    if (videoFile) {
      videoUrl = await uploadFile(videoFile, "podcasts", "video");
    } else if (podcastData.videoUrl) {
      videoUrl = podcastData.videoUrl;
    }

    // Insert into Supabase
    const { data, error } = await supabase.from("podcasts").insert({
      title: podcastData.title,
      description: podcastData.description,
      image_url: imageUrl,
      audio_url: audioUrl || null,
      video_url: videoUrl || null,
      duration: podcastData.duration,
      user_id: podcastData.creatorId,
      category_id: podcastData.category,
      published: podcastData.visibility === "public",
      tags: podcastData.tags || [],
    }).select('id').single();

    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error("Error creating podcast:", error);
    throw error;
  }
};

/**
 * Create a podcast recording session
 */
export const createPodcastSession = async (sessionData: {
  hostId: string;
  title: string;
  description?: string;
  scheduledFor: Date;
  duration: number;
  participants: string[];
  status: string;
  agoraChannelName: string;
}): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("podcast_sessions")
      .insert({
        host_id: sessionData.hostId,
        title: sessionData.title,
        description: sessionData.description,
        scheduled_for: sessionData.scheduledFor.toISOString(),
        duration: sessionData.duration,
        participants: sessionData.participants,
        status: sessionData.status,
        agora_channel_name: sessionData.agoraChannelName,
      })
      .select('id')
      .single();

    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error("Error creating podcast session:", error);
    throw error;
  }
};

/**
 * Get podcast categories
 */
export const getPodcastCategories = async (): Promise<PodcastCategory[]> => {
  try {
    const { data, error } = await supabase
      .from("podcast_categories")
      .select("*");

    if (error) throw error;

    return data.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon
    }));
  } catch (error) {
    console.error("Error fetching podcast categories:", error);
    throw error;
  }
};

/**
 * Get podcasts with pagination and filtering
 */
export const getPodcasts = async (
  limit = 12,
  lastId: string | null = null,
  categoryId = "",
  searchTerm = ""
): Promise<{ podcasts: Podcast[]; lastId: string | null }> => {
  try {
    let query = supabase
      .from("podcasts")
      .select(`
        id,
        title,
        description,
        image_url,
        audio_url,
        duration,
        user_id,
        users!inner(display_name),
        category_id,
        created_at,
        updated_at,
        published,
        view_count,
        like_count,
        share_count,
        featured,
        tags
      `)
      .eq("published", true);

    // Apply filters
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    
    if (searchTerm) {
      query = query.ilike("title", `%${searchTerm}%`);
    }
    
    // Add pagination
    if (lastId) {
      query = query.gt("id", lastId);
    }
    
    // Order and limit
    query = query.order("created_at", { ascending: false }).limit(limit);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const podcasts = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      imageUrl: item.image_url || "",
      audioUrl: item.audio_url || "",
      duration: item.duration || 0,
      creatorId: item.user_id,
      creatorName: item.users?.display_name || "Unknown Creator",
      type: item.audio_url ? "audio" : "video",
      category: item.category_id,
      categoryId: item.category_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      published: item.published,
      viewCount: item.view_count || 0,
      likeCount: item.like_count || 0,
      shareCount: item.share_count || 0,
      featured: item.featured || false,
      tags: item.tags || [],
      visibility: item.published ? "public" : "private",
      userId: item.user_id
    }));
    
    return {
      podcasts,
      lastId: data.length > 0 ? data[data.length - 1].id : null,
    };
  } catch (error) {
    console.error("Error getting podcasts:", error);
    throw error;
  }
};
