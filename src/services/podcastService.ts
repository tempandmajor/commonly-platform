
import { supabase } from "@/integrations/supabase/client";
import { Podcast, PodcastComment, PodcastCategory } from "@/types/podcast";

export const getPodcastById = async (podcastId: string): Promise<Podcast | null> => {
  try {
    const { data, error } = await supabase
      .from("podcasts")
      .select(`
        *,
        users:user_id (*)
      `)
      .eq("id", podcastId)
      .single();

    if (error) throw error;
    if (!data) return null;

    const { users, ...podcast } = data;
    
    return {
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      imageUrl: podcast.image_url,
      audioUrl: podcast.audio_url,
      videoUrl: podcast.video_url || undefined,
      thumbnailUrl: podcast.thumbnail_url || undefined,
      duration: podcast.duration,
      createdAt: podcast.created_at,
      userId: podcast.user_id,
      userName: users.display_name,
      userPhotoUrl: users.photo_url,
      categoryId: podcast.category_id,
      likeCount: podcast.like_count,
      viewCount: podcast.view_count,
      shareCount: podcast.share_count,
      published: podcast.published,
      type: podcast.type || 'audio',
      visibility: podcast.visibility || 'public',
      listens: podcast.listens || 0,
      tags: podcast.tags,
    };
  } catch (error) {
    console.error("Error fetching podcast:", error);
    return null;
  }
};

export const getRecentPodcasts = async (limit = 6): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from("podcasts")
      .select(`
        *,
        users:user_id (*)
      `)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(item => {
      const { users, ...podcast } = item;
      
      return {
        id: podcast.id,
        title: podcast.title,
        description: podcast.description,
        imageUrl: podcast.image_url,
        audioUrl: podcast.audio_url,
        duration: podcast.duration,
        createdAt: podcast.created_at,
        userId: podcast.user_id,
        userName: users?.display_name,
        userPhotoUrl: users?.photo_url,
        categoryId: podcast.category_id,
        likeCount: podcast.like_count,
        viewCount: podcast.view_count,
        shareCount: podcast.share_count,
        published: podcast.published,
        type: podcast.type || 'audio',
        visibility: podcast.visibility || 'public',
      };
    });
  } catch (error) {
    console.error("Error fetching recent podcasts:", error);
    return [];
  }
};

export const getPodcastsByCreator = async (creatorId: string): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("user_id", creatorId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(podcast => {
      return {
        id: podcast.id,
        title: podcast.title,
        description: podcast.description,
        imageUrl: podcast.image_url,
        audioUrl: podcast.audio_url,
        duration: podcast.duration,
        createdAt: podcast.created_at,
        userId: podcast.user_id,
        categoryId: podcast.category_id,
        likeCount: podcast.like_count,
        viewCount: podcast.view_count,
        shareCount: podcast.share_count,
        published: podcast.published,
        type: podcast.type || 'audio',
        visibility: podcast.visibility || 'public',
      };
    });
  } catch (error) {
    console.error("Error fetching podcasts by creator:", error);
    return [];
  }
};

export const addPodcastComment = async (
  podcastId: string,
  userId: string,
  content: string
): Promise<PodcastComment | null> => {
  try {
    const { data, error } = await supabase
      .from("podcast_comments")
      .insert({
        podcast_id: podcastId,
        user_id: userId,
        content: content,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Fetch the user information to populate the userName and userPhotoUrl fields
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("display_name, photo_url")
      .eq("id", userId)
      .single();
    
    if (userError) throw userError;

    return {
      id: data.id,
      podcastId: data.podcast_id,
      userId: data.user_id,
      userName: userData.display_name || "User",
      userPhotoUrl: userData.photo_url || undefined,
      content: data.content,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error("Error adding podcast comment:", error);
    return null;
  }
};

export const getPodcastComments = async (
  podcastId: string
): Promise<PodcastComment[]> => {
  try {
    const { data, error } = await supabase
      .from("podcast_comments")
      .select(`
        *,
        users:user_id (*)
      `)
      .eq("podcast_id", podcastId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(item => {
      const userName = item.users?.display_name || "User";
      const userPhotoUrl = item.users?.photo_url;
      
      return {
        id: item.id,
        podcastId: item.podcast_id,
        userId: item.user_id,
        userName,
        userPhotoUrl,
        content: item.content,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      };
    });
  } catch (error) {
    console.error("Error fetching podcast comments:", error);
    return [];
  }
};

export const incrementListenCount = async (podcastId: string): Promise<boolean> => {
  try {
    // Using the RPC function we defined in the database
    const { error } = await supabase.rpc('increment_podcast_listens', {
      podcast_id_param: podcastId
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error incrementing listen count:", error);
    return false;
  }
};
