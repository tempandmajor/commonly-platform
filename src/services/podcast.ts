
import { supabase } from "@/integrations/supabase/client";
import { Podcast, PodcastCategory, PodcastComment } from "@/types/podcast";

export const getPodcasts = async (
  limit: number = 12,
  lastId: string | null = null,
  category: string | null = null,
  searchTerm: string | null = null
): Promise<{ podcasts: Podcast[]; lastId: string | null }> => {
  try {
    let query = supabase
      .from('podcasts')
      .select('*, users!podcasts_user_id_fkey(display_name, photo_url)')
      .eq('published', true)
      .order('created_at', { ascending: false });
      
    if (category) {
      query = query.eq('category_id', category);
    }
    
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    if (lastId) {
      const { data: lastPodcast } = await supabase
        .from('podcasts')
        .select('created_at')
        .eq('id', lastId)
        .single();
      
      if (lastPodcast) {
        query = query.lt('created_at', lastPodcast.created_at);
      }
    }
    
    query = query.limit(limit);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const formattedPodcasts: Podcast[] = data.map(podcast => ({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description || undefined,
      imageUrl: podcast.image_url || undefined,
      audioUrl: podcast.audio_url || undefined,
      duration: podcast.duration || 0,
      createdAt: podcast.created_at,
      userId: podcast.user_id,
      userName: podcast.users?.display_name || "Unknown",
      userPhotoUrl: podcast.users?.photo_url || undefined,
      categoryId: podcast.category_id || undefined,
      likeCount: podcast.like_count || 0,
      viewCount: podcast.view_count || 0,
      shareCount: podcast.share_count || 0,
      published: podcast.published || false,
    }));
    
    const newLastId = data.length > 0 ? data[data.length - 1].id : null;
    
    return { podcasts: formattedPodcasts, lastId: newLastId };
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    throw error;
  }
};

export const getPodcast = async (podcastId: string): Promise<Podcast> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*, users!podcasts_user_id_fkey(display_name, photo_url)')
      .eq('id', podcastId)
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('Podcast not found');
    
    const podcast: Podcast = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      imageUrl: data.image_url || undefined,
      audioUrl: data.audio_url || undefined,
      duration: data.duration || 0,
      createdAt: data.created_at,
      userId: data.user_id,
      userName: data.users?.display_name || "Unknown",
      userPhotoUrl: data.users?.photo_url || undefined,
      categoryId: data.category_id || undefined,
      likeCount: data.like_count || 0,
      viewCount: data.view_count || 0,
      shareCount: data.share_count || 0,
      published: data.published || false,
    };
    
    return podcast;
  } catch (error) {
    console.error("Error fetching podcast:", error);
    throw error;
  }
};

export const getPodcastsByCreator = async (userId: string): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*, users!podcasts_user_id_fkey(display_name, photo_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    const podcasts: Podcast[] = data.map(podcast => ({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description || undefined,
      imageUrl: podcast.image_url || undefined,
      audioUrl: podcast.audio_url || undefined,
      duration: podcast.duration || 0,
      createdAt: podcast.created_at,
      userId: podcast.user_id,
      userName: podcast.users?.display_name || "Unknown",
      userPhotoUrl: podcast.users?.photo_url || undefined,
      categoryId: podcast.category_id || undefined,
      likeCount: podcast.like_count || 0,
      viewCount: podcast.view_count || 0,
      shareCount: podcast.share_count || 0,
      published: podcast.published || false,
    }));
    
    return podcasts;
  } catch (error) {
    console.error("Error fetching creator podcasts:", error);
    throw error;
  }
};

export const getPodcastCategories = async (): Promise<PodcastCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('podcast_categories')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    return data.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      icon: category.icon || undefined,
    }));
  } catch (error) {
    console.error("Error fetching podcast categories:", error);
    throw error;
  }
};

export const uploadPodcast = async (
  userId: string,
  podcastData: Partial<Podcast>,
  audioFile: File,
  imageFile?: File
): Promise<Podcast> => {
  try {
    // Upload audio file
    const audioFileName = `podcasts/${userId}/${Date.now()}-${audioFile.name.replace(/\s+/g, '-')}`;
    const { error: audioUploadError, data: audioData } = await supabase.storage
      .from('media')
      .upload(audioFileName, audioFile);
    
    if (audioUploadError) throw audioUploadError;
    
    // Get audio URL
    const { data: audioUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(audioFileName);
    
    const audioUrl = audioUrlData.publicUrl;
    
    // Upload image if provided
    let imageUrl;
    if (imageFile) {
      const imageFileName = `podcasts/${userId}/${Date.now()}-${imageFile.name.replace(/\s+/g, '-')}`;
      const { error: imageUploadError } = await supabase.storage
        .from('media')
        .upload(imageFileName, imageFile);
      
      if (imageUploadError) throw imageUploadError;
      
      const { data: imageUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(imageFileName);
      
      imageUrl = imageUrlData.publicUrl;
    }
    
    // Insert podcast record
    const { data: podcast, error: insertError } = await supabase
      .from('podcasts')
      .insert({
        title: podcastData.title || 'Untitled Podcast',
        description: podcastData.description,
        image_url: imageUrl,
        audio_url: audioUrl,
        user_id: userId,
        category_id: podcastData.categoryId,
        duration: podcastData.duration || 0,
        published: podcastData.published ?? false,
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    return {
      id: podcast.id,
      title: podcast.title,
      description: podcast.description || undefined,
      imageUrl: podcast.image_url || undefined,
      audioUrl: podcast.audio_url || undefined,
      duration: podcast.duration || 0,
      createdAt: podcast.created_at,
      userId: podcast.user_id,
      categoryId: podcast.category_id || undefined,
      published: podcast.published || false,
      likeCount: 0,
      viewCount: 0,
      shareCount: 0,
    };
  } catch (error) {
    console.error("Error uploading podcast:", error);
    throw error;
  }
};

export const getPodcastComments = async (podcastId: string): Promise<PodcastComment[]> => {
  try {
    const { data, error } = await supabase
      .from('podcast_comments')
      .select('*, users!podcast_comments_user_id_fkey(display_name, photo_url)')
      .eq('podcast_id', podcastId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(comment => ({
      id: comment.id,
      podcastId: comment.podcast_id,
      userId: comment.user_id,
      userName: comment.users?.display_name || "Anonymous",
      userPhotoUrl: comment.users?.photo_url,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching podcast comments:", error);
    throw error;
  }
};

export const addPodcastComment = async (
  podcastId: string,
  userId: string,
  content: string
): Promise<PodcastComment> => {
  try {
    const { data, error } = await supabase
      .from('podcast_comments')
      .insert({
        podcast_id: podcastId,
        user_id: userId,
        content,
      })
      .select('*, users!podcast_comments_user_id_fkey(display_name, photo_url)')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      podcastId: data.podcast_id,
      userId: data.user_id,
      userName: data.users?.display_name || "Anonymous",
      userPhotoUrl: data.users?.photo_url,
      content: data.content,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error("Error adding podcast comment:", error);
    throw error;
  }
};

export const incrementPodcastViews = async (podcastId: string): Promise<void> => {
  try {
    await supabase.rpc('increment_podcast_listens', { podcast_id_param: podcastId });
  } catch (error) {
    console.error("Error incrementing podcast views:", error);
    throw error;
  }
};

export const togglePodcastLike = async (podcastId: string, userId: string): Promise<{ liked: boolean }> => {
  try {
    // Check if the user already likes the podcast
    const { data: existingLike, error: checkError } = await supabase
      .from('podcast_likes')
      .select()
      .eq('podcast_id', podcastId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is the error code for "no rows returned"
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike if already liked
      const { error: deleteError } = await supabase
        .from('podcast_likes')
        .delete()
        .eq('podcast_id', podcastId)
        .eq('user_id', userId);
      
      if (deleteError) throw deleteError;
      
      // Decrement like count
      await supabase
        .from('podcasts')
        .update({ like_count: supabase.rpc('decrement', { row_id: podcastId }) })
        .eq('id', podcastId);
      
      return { liked: false };
    } else {
      // Like if not already liked
      const { error: insertError } = await supabase
        .from('podcast_likes')
        .insert({ podcast_id: podcastId, user_id: userId });
      
      if (insertError) throw insertError;
      
      // Increment like count
      await supabase
        .from('podcasts')
        .update({ like_count: supabase.rpc('increment', { row_id: podcastId }) })
        .eq('id', podcastId);
      
      return { liked: true };
    }
  } catch (error) {
    console.error("Error toggling podcast like:", error);
    throw error;
  }
};
