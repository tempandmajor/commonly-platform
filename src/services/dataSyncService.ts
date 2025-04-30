
import { supabase } from "@/integrations/supabase/client";

/**
 * Service to help with synchronizing data between Firebase and Supabase
 * during the parallel running period
 */
export class DataSyncService {
  /**
   * Sync a podcast from Firebase to Supabase
   * @param firebasePodcast The podcast data from Firebase
   */
  static async syncPodcast(firebasePodcast: any): Promise<string | null> {
    try {
      // Check if podcast already exists in Supabase
      const { data: existingPodcast } = await supabase
        .from('podcasts')
        .select('id')
        .eq('id', firebasePodcast.id)
        .single();
      
      if (existingPodcast) {
        // Update existing podcast
        const { error } = await supabase
          .from('podcasts')
          .update({
            title: firebasePodcast.title,
            description: firebasePodcast.description,
            image_url: firebasePodcast.imageUrl,
            audio_url: firebasePodcast.audioUrl,
            video_url: firebasePodcast.videoUrl,
            duration: firebasePodcast.duration,
            user_id: firebasePodcast.userId,
            category_id: firebasePodcast.categoryId,
            published: firebasePodcast.published,
            type: firebasePodcast.type || 'audio',
            visibility: firebasePodcast.visibility || 'public',
            listens: firebasePodcast.listens || 0,
            tags: firebasePodcast.tags || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', firebasePodcast.id);
        
        if (error) throw error;
        return firebasePodcast.id;
      } else {
        // Insert new podcast
        const { data, error } = await supabase
          .from('podcasts')
          .insert({
            id: firebasePodcast.id, // Use the same ID for consistency
            title: firebasePodcast.title,
            description: firebasePodcast.description,
            image_url: firebasePodcast.imageUrl,
            audio_url: firebasePodcast.audioUrl,
            video_url: firebasePodcast.videoUrl,
            duration: firebasePodcast.duration,
            user_id: firebasePodcast.userId,
            category_id: firebasePodcast.categoryId,
            published: firebasePodcast.published,
            type: firebasePodcast.type || 'audio',
            visibility: firebasePodcast.visibility || 'public',
            listens: firebasePodcast.listens || 0,
            tags: firebasePodcast.tags || [],
            created_at: firebasePodcast.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      console.error("Error syncing podcast:", error);
      return null;
    }
  }

  /**
   * Sync a user from Firebase to Supabase
   * @param firebaseUser The user data from Firebase
   */
  static async syncUser(firebaseUser: any): Promise<string | null> {
    try {
      // Check if user already exists in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', firebaseUser.uid)
        .single();
      
      if (existingUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            display_name: firebaseUser.displayName,
            email: firebaseUser.email,
            photo_url: firebaseUser.photoURL,
            updated_at: new Date().toISOString()
          })
          .eq('id', firebaseUser.uid);
        
        if (error) throw error;
        return firebaseUser.uid;
      } else {
        // Insert new user
        const { data, error } = await supabase
          .from('users')
          .insert({
            id: firebaseUser.uid, // Use the same ID for consistency
            display_name: firebaseUser.displayName,
            email: firebaseUser.email,
            photo_url: firebaseUser.photoURL,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      console.error("Error syncing user:", error);
      return null;
    }
  }

  /**
   * Sync an event from Firebase to Supabase
   * @param firebaseEvent The event data from Firebase
   */
  static async syncEvent(firebaseEvent: any): Promise<string | null> {
    try {
      // Check if event already exists in Supabase
      const { data: existingEvent } = await supabase
        .from('events')
        .select('id')
        .eq('id', firebaseEvent.id)
        .single();
      
      // Prepare location data
      const location_lat = firebaseEvent.location?.latitude || null;
      const location_lng = firebaseEvent.location?.longitude || null;
      
      if (existingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title: firebaseEvent.title,
            description: firebaseEvent.description,
            date: firebaseEvent.date,
            location: firebaseEvent.locationName,
            location_lat,
            location_lng,
            created_by: firebaseEvent.createdBy,
            published: firebaseEvent.published,
            image_url: firebaseEvent.imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', firebaseEvent.id);
        
        if (error) throw error;
        return firebaseEvent.id;
      } else {
        // Insert new event
        const { data, error } = await supabase
          .from('events')
          .insert({
            id: firebaseEvent.id, // Use the same ID for consistency
            title: firebaseEvent.title,
            description: firebaseEvent.description,
            date: firebaseEvent.date,
            location: firebaseEvent.locationName,
            location_lat,
            location_lng,
            created_by: firebaseEvent.createdBy,
            published: firebaseEvent.published,
            image_url: firebaseEvent.imageUrl,
            created_at: firebaseEvent.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      console.error("Error syncing event:", error);
      return null;
    }
  }
}
