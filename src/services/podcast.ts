
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Podcast, PodcastComment } from "@/types/podcast";

// Get a single podcast by ID
export const getPodcast = async (id: string): Promise<Podcast> => {
  const { data, error } = await supabase
    .from("podcasts")
    .select("*, users(display_name, photo_url)")
    .eq("id", id)
    .single();

  if (error) throw error;

  // Increment listen count
  await supabase.rpc("increment_podcast_listens", { podcast_id_param: id });

  return {
    id: data.id,
    title: data.title,
    description: data.description || undefined,
    imageUrl: data.image_url,
    audioUrl: data.audio_url,
    videoUrl: data.video_url,
    thumbnailUrl: data.thumbnailUrl,
    duration: data.duration,
    createdAt: data.created_at,
    userId: data.user_id,
    userName: data.users?.display_name,
    userPhotoUrl: data.users?.photo_url,
    categoryId: data.category_id,
    likeCount: data.like_count,
    viewCount: data.view_count,
    shareCount: data.share_count,
    published: data.published,
    type: data.type || "audio",
    visibility: data.visibility || "public",
    listens: data.listens,
    tags: data.tags,
    creatorId: data.user_id,
    creatorName: data.users?.display_name,
  };
};

// Get podcasts by creator
export const getPodcastsByCreator = async (creatorId: string): Promise<Podcast[]> => {
  const { data, error } = await supabase
    .from("podcasts")
    .select("*")
    .eq("user_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((podcast) => ({
    id: podcast.id,
    title: podcast.title,
    description: podcast.description,
    imageUrl: podcast.image_url,
    audioUrl: podcast.audio_url,
    videoUrl: podcast.video_url,
    thumbnailUrl: podcast.thumbnailUrl,
    duration: podcast.duration,
    createdAt: podcast.created_at,
    userId: podcast.user_id,
    categoryId: podcast.category_id,
    likeCount: podcast.like_count,
    viewCount: podcast.view_count,
    shareCount: podcast.share_count,
    published: podcast.published,
    type: podcast.type || "audio",
    visibility: podcast.visibility || "public",
    listens: podcast.listens,
    tags: podcast.tags,
  }));
};

// Create a new podcast
export const createPodcast = async (
  podcastData: Partial<Podcast>,
  audioFile?: File,
  imageFile?: File
): Promise<Podcast> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("User not authenticated");

  let audioUrl = podcastData.audioUrl;
  let imageUrl = podcastData.imageUrl;

  // Upload audio file if provided
  if (audioFile) {
    const audioFileName = `${userId}/${uuidv4()}-${audioFile.name}`;
    const { data: audioData, error: audioError } = await supabase.storage
      .from("podcasts")
      .upload(audioFileName, audioFile);

    if (audioError) throw audioError;

    // Get public URL for audio
    const { data: audioUrlData } = await supabase.storage
      .from("podcasts")
      .getPublicUrl(audioFileName);

    audioUrl = audioUrlData.publicUrl;
  }

  // Upload image file if provided
  if (imageFile) {
    const imageFileName = `images/${userId}/${uuidv4()}-${imageFile.name}`;
    const { data: imageData, error: imageError } = await supabase.storage
      .from("podcasts")
      .upload(imageFileName, imageFile);

    if (imageError) throw imageError;

    // Get public URL for image
    const { data: imageUrlData } = await supabase.storage
      .from("podcasts")
      .getPublicUrl(imageFileName);

    imageUrl = imageUrlData.publicUrl;
  }

  // Create podcast record in database
  const { data, error } = await supabase
    .from("podcasts")
    .insert([
      {
        title: podcastData.title,
        description: podcastData.description,
        audio_url: audioUrl,
        video_url: podcastData.videoUrl,
        image_url: imageUrl,
        duration: podcastData.duration || 0,
        user_id: userId,
        category_id: podcastData.categoryId,
        published: podcastData.published || false,
        type: podcastData.type || "audio",
        visibility: podcastData.visibility || "public",
        tags: podcastData.tags || [],
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    imageUrl: data.image_url,
    audioUrl: data.audio_url,
    videoUrl: data.video_url,
    thumbnailUrl: data.thumbnailUrl,
    duration: data.duration,
    createdAt: data.created_at,
    userId: data.user_id,
    categoryId: data.category_id,
    likeCount: data.like_count || 0,
    viewCount: data.view_count || 0,
    shareCount: data.share_count || 0,
    published: data.published,
    type: data.type || "audio",
    visibility: data.visibility || "public",
    listens: data.listens || 0,
    tags: data.tags,
  };
};

// Create podcast session (for live recording)
export const createPodcastSession = async (title: string): Promise<{ sessionId: string }> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("User not authenticated");
  
  // Create a unique session ID
  const sessionId = uuidv4();
  
  // Save session to database
  const { error } = await supabase
    .from("podcast_sessions")
    .insert([{
      id: sessionId,
      user_id: userId,
      title,
      status: "created",
      created_at: new Date().toISOString()
    }]);
  
  if (error) throw error;
  
  return { sessionId };
};

// Get podcast comments
export const getPodcastComments = async (podcastId: string): Promise<PodcastComment[]> => {
  const { data, error } = await supabase
    .from("podcast_comments")
    .select("*, users(display_name, photo_url)")
    .eq("podcast_id", podcastId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((comment) => ({
    id: comment.id,
    podcastId: comment.podcast_id,
    userId: comment.user_id,
    userName: comment.users?.display_name || "Anonymous",
    userPhotoUrl: comment.users?.photo_url,
    content: comment.content,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
  }));
};

// Add a comment to a podcast
export const addPodcastComment = async (
  podcastId: string,
  content: string
): Promise<PodcastComment> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("podcast_comments")
    .insert([
      {
        podcast_id: podcastId,
        user_id: userId,
        content,
      },
    ])
    .select("*, users(display_name, photo_url)")
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
};

// Like or unlike a podcast
export const togglePodcastLike = async (podcastId: string): Promise<{ liked: boolean }> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("User not authenticated");

  // Check if already liked
  const { data: existingLike, error: checkError } = await supabase
    .from("podcast_likes")
    .select()
    .eq("podcast_id", podcastId)
    .eq("user_id", userId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw checkError;
  }

  if (existingLike) {
    // Unlike
    const { error: unlikeError } = await supabase
      .from("podcast_likes")
      .delete()
      .eq("podcast_id", podcastId)
      .eq("user_id", userId);

    if (unlikeError) throw unlikeError;

    return { liked: false };
  } else {
    // Like
    const { error: likeError } = await supabase
      .from("podcast_likes")
      .insert([
        {
          podcast_id: podcastId,
          user_id: userId,
        },
      ]);

    if (likeError) throw likeError;

    return { liked: true };
  }
};

// Check if user has liked a podcast
export const checkPodcastLike = async (podcastId: string): Promise<boolean> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return false;

  const { data, error } = await supabase
    .from("podcast_likes")
    .select()
    .eq("podcast_id", podcastId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking podcast like:", error);
  }

  return !!data;
};
