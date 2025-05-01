
import { supabase } from "@/integrations/supabase/client";
import { Podcast, PodcastComment, PodcastCategory } from "@/types/podcast";

export const getPodcastById = async (podcastId: string): Promise<Podcast | null> => {
  try {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("id", podcastId)
      .single();

    if (error) throw error;
    if (!data) return null;
    
    // Get user info separately since the join might be failing
    const { data: userData } = await supabase
      .from("users")
      .select("display_name, photo_url")
      .eq("id", data.user_id)
      .single();

    // Map database fields to our interface
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      audioUrl: data.audio_url,
      videoUrl: data.video_url || undefined,
      thumbnailUrl: data.thumbnail_url || undefined,
      duration: data.duration || 0,
      createdAt: data.created_at,
      userId: data.user_id,
      userName: userData?.display_name || "Unknown",
      userPhotoUrl: userData?.photo_url || undefined,
      categoryId: data.category_id,
      likeCount: data.like_count || 0,
      viewCount: data.view_count || 0,
      shareCount: data.share_count || 0,
      published: data.published || false,
      type: data.type || 'audio',
      visibility: data.visibility || 'public',
      listens: data.listens || 0,
      tags: data.tags || [],
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
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get user info for all podcasts
    const userIds = [...new Set(data.map(podcast => podcast.user_id))];
    const { data: usersData } = await supabase
      .from("users")
      .select("id, display_name, photo_url")
      .in("id", userIds);

    // Create a user lookup map
    const userMap = (usersData || []).reduce((map: Record<string, any>, user) => {
      map[user.id] = user;
      return map;
    }, {});

    return data.map(podcast => ({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      imageUrl: podcast.image_url,
      audioUrl: podcast.audio_url,
      videoUrl: podcast.video_url || undefined,
      thumbnailUrl: podcast.thumbnail_url || undefined,
      duration: podcast.duration || 0,
      createdAt: podcast.created_at,
      userId: podcast.user_id,
      userName: userMap[podcast.user_id]?.display_name || "Unknown",
      userPhotoUrl: userMap[podcast.user_id]?.photo_url,
      categoryId: podcast.category_id,
      likeCount: podcast.like_count || 0,
      viewCount: podcast.view_count || 0,
      shareCount: podcast.share_count || 0,
      published: podcast.published,
      type: podcast.type || 'audio',
      visibility: podcast.visibility || 'public',
      listens: podcast.listens || 0,
      tags: podcast.tags || [],
    }));
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

    // Get creator info
    const { data: userData } = await supabase
      .from("users")
      .select("display_name, photo_url")
      .eq("id", creatorId)
      .single();

    return data.map(podcast => ({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      imageUrl: podcast.image_url,
      audioUrl: podcast.audio_url,
      videoUrl: podcast.video_url || undefined,
      thumbnailUrl: podcast.thumbnail_url || undefined,
      duration: podcast.duration || 0,
      createdAt: podcast.created_at,
      userId: podcast.user_id,
      userName: userData?.display_name || "Unknown",
      userPhotoUrl: userData?.photo_url,
      categoryId: podcast.category_id,
      likeCount: podcast.like_count || 0,
      viewCount: podcast.view_count || 0,
      shareCount: podcast.share_count || 0,
      published: podcast.published,
      type: podcast.type || 'audio',
      visibility: podcast.visibility || 'public',
      listens: podcast.listens || 0,
      tags: podcast.tags || [],
    }));
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
      .select("*")
      .eq("podcast_id", podcastId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get user data for all comments
    const userIds = [...new Set(data.map(comment => comment.user_id))];
    const { data: usersData } = await supabase
      .from("users")
      .select("id, display_name, photo_url")
      .in("id", userIds);

    // Create a user lookup map
    const userMap = (usersData || []).reduce((map: Record<string, any>, user) => {
      map[user.id] = user;
      return map;
    }, {});

    return data.map(comment => {
      const userName = userMap[comment.user_id]?.display_name || "User";
      const userPhotoUrl = userMap[comment.user_id]?.photo_url;
      
      return {
        id: comment.id,
        podcastId: comment.podcast_id,
        userId: comment.user_id,
        userName,
        userPhotoUrl,
        content: comment.content,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
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
    return [];
  }
};

// Helper function to create a podcast
export const createPodcast = async (
  podcastData: PodcastCreateInput,
  audioFile?: File,
  videoFile?: File,
  thumbnailFile?: File
): Promise<string> => {
  try {
    // Placeholder for actual implementation
    console.log("Creating podcast with data:", podcastData);
    console.log("Files:", { audioFile, videoFile, thumbnailFile });
    return "new-podcast-id";
  } catch (error) {
    console.error("Error creating podcast:", error);
    throw error;
  }
};
