
import { supabase } from "@/integrations/supabase/client";
import { Podcast } from "@/types/podcast";
import { PodcastCreateInput } from "@/types/chat";

// Fetch podcasts with pagination and filtering
export const getPodcasts = async (
  pageSize = 10,
  lastId?: string,
  category?: string,
  searchTerm?: string
): Promise<{ podcasts: Podcast[]; lastId: string | null }> => {
  try {
    let query = supabase
      .from('podcasts')
      .select('*, podcast_categories(*)')
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
      videoUrl: undefined, // Not in current schema
      thumbnailUrl: undefined, // Not in current schema
      duration: podcast.duration || 0,
      createdAt: podcast.created_at,
      userId: podcast.user_id,
      userName: "Unknown", // We'll need to fetch user data separately
      userPhotoUrl: undefined,
      categoryId: podcast.category_id || undefined,
      likeCount: podcast.like_count || 0,
      viewCount: podcast.view_count || 0,
      shareCount: podcast.share_count || 0,
      published: podcast.published || false,
      type: 'audio', // Default since not in schema
      visibility: 'public', // Default since not in schema
      listens: 0, // Default since not in schema
      tags: [] // Default since not in schema
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

// Fetch a single podcast by ID
export const getPodcast = async (id: string): Promise<Podcast | null> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*, podcast_categories(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Map to our Podcast type
    const podcast: Podcast = {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      imageUrl: data.image_url || undefined,
      audioUrl: data.audio_url || undefined,
      videoUrl: undefined, // Not in current schema
      thumbnailUrl: undefined, // Not in current schema
      duration: data.duration || 0,
      createdAt: data.created_at,
      userId: data.user_id,
      userName: "Unknown",
      userPhotoUrl: undefined,
      categoryId: data.category_id || undefined,
      likeCount: data.like_count || 0,
      viewCount: data.view_count || 0,
      shareCount: data.share_count || 0,
      published: data.published || false,
      type: 'audio', // Default since not in schema
      visibility: 'public', // Default since not in schema
      listens: 0, // Default since not in schema
      tags: [], // Default since not in schema
      creatorId: data.user_id,
      creatorName: "Unknown"
    };
    
    return podcast;
  } catch (error) {
    console.error("Error fetching podcast:", error);
    throw error;
  }
};

// Get podcasts by creator ID
export const getPodcastsByCreator = async (
  creatorId: string
): Promise<Podcast[]> => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*, podcast_categories(*)')
      .eq('user_id', creatorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map to our Podcast type
    const podcasts: Podcast[] = data.map(podcast => ({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description || undefined,
      imageUrl: podcast.image_url || undefined,
      audioUrl: podcast.audio_url || undefined,
      videoUrl: undefined, // Not in current schema
      thumbnailUrl: undefined, // Not in current schema
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
      type: 'audio', // Default since not in schema
      visibility: 'public', // Default since not in schema
      listens: 0, // Default since not in schema
      tags: [] // Default since not in schema
    }));
    
    return podcasts;
  } catch (error) {
    console.error("Error fetching creator podcasts:", error);
    throw error;
  }
};

// Upload a new podcast
export const createPodcast = async (
  podcastData: PodcastCreateInput,
  audioFile?: File,
  videoFile?: File,
  thumbnailFile?: File
): Promise<string> => {
  try {
    let audioUrl;
    let imageUrl;
    
    // Upload files to Supabase Storage
    if (thumbnailFile) {
      const filePath = `thumbnails/${podcastData.userId}/${Date.now()}_${thumbnailFile.name.replace(/\s/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('podcasts')
        .upload(filePath, thumbnailFile);
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('podcasts')
        .getPublicUrl(filePath);
        
      imageUrl = urlData.publicUrl;
    }

    if (audioFile) {
      const filePath = `audio/${podcastData.userId}/${Date.now()}_${audioFile.name.replace(/\s/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('podcasts')
        .upload(filePath, audioFile);
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('podcasts')
        .getPublicUrl(filePath);
        
      audioUrl = urlData.publicUrl;
    }

    // Insert podcast record - only use fields that exist in the database schema
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .insert({
        title: podcastData.title,
        description: podcastData.description,
        image_url: imageUrl || podcastData.imageUrl,
        audio_url: audioUrl || podcastData.audioUrl,
        duration: podcastData.duration || 0,
        user_id: podcastData.userId,
        category_id: podcastData.categoryId,
        published: podcastData.published,
        like_count: podcastData.likeCount || 0,
        view_count: podcastData.viewCount || 0,
        share_count: podcastData.shareCount || 0
      })
      .select()
      .single();

    if (error) throw error;

    return podcast.id;
  } catch (error) {
    console.error("Error creating podcast:", error);
    throw error;
  }
};

// Update an existing podcast
export const updatePodcast = async (
  id: string,
  podcastData: Partial<Podcast>,
  thumbnailFile?: File
): Promise<void> => {
  try {
    let imageUrl = podcastData.imageUrl;
    
    // Upload new thumbnail if provided
    if (thumbnailFile) {
      const filePath = `thumbnails/${podcastData.userId}/${Date.now()}_${thumbnailFile.name.replace(/\s/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('podcasts')
        .upload(filePath, thumbnailFile);
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('podcasts')
        .getPublicUrl(filePath);
        
      imageUrl = urlData.publicUrl;
    }

    // Map our Podcast type to database format - only include fields that exist in the database
    const updateData: Record<string, any> = {};
    
    if (podcastData.title !== undefined) updateData.title = podcastData.title;
    if (podcastData.description !== undefined) updateData.description = podcastData.description;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (podcastData.audioUrl !== undefined) updateData.audio_url = podcastData.audioUrl;
    if (podcastData.duration !== undefined) updateData.duration = podcastData.duration;
    if (podcastData.categoryId !== undefined) updateData.category_id = podcastData.categoryId;
    if (podcastData.published !== undefined) updateData.published = podcastData.published;
    if (podcastData.likeCount !== undefined) updateData.like_count = podcastData.likeCount;
    if (podcastData.viewCount !== undefined) updateData.view_count = podcastData.viewCount;
    if (podcastData.shareCount !== undefined) updateData.share_count = podcastData.shareCount;
    
    // Update the podcast record
    const { error } = await supabase
      .from('podcasts')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating podcast:", error);
    throw error;
  }
};

// Delete a podcast
export const deletePodcast = async (id: string): Promise<void> => {
  try {
    // Get podcast details first to delete storage files
    const { data: podcast, error: fetchError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete file from storage if exists
    if (podcast) {
      // Extract paths from URLs
      const getPathFromUrl = (url?: string) => {
        if (!url) return null;
        try {
          const storageUrl = supabase.storage.from('podcasts').getPublicUrl('').data.publicUrl;
          return url.replace(storageUrl, '');
        } catch (e) {
          return null;
        }
      };

      const promises = [];
      
      const audioPath = getPathFromUrl(podcast.audio_url);
      const imagePath = getPathFromUrl(podcast.image_url);
      
      if (audioPath) {
        promises.push(supabase.storage.from('podcasts').remove([audioPath]));
      }
      
      if (imagePath) {
        promises.push(supabase.storage.from('podcasts').remove([imagePath]));
      }
      
      // Wait for all storage operations to complete
      await Promise.all(promises);
    }
    
    // Delete podcast record
    const { error } = await supabase
      .from('podcasts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting podcast:", error);
    throw error;
  }
};
