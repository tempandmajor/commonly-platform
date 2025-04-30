
import { supabase } from "@/integrations/supabase/client";

/**
 * Report a user
 */
export const reportUser = async (
  reportingUserId: string, 
  reportedUserId: string, 
  reason: string
): Promise<void> => {
  try {
    await supabase
      .from('reports')
      .insert({
        reporter_id: reportingUserId,
        reported_id: reportedUserId,
        reason,
        type: 'user',
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error reporting user:', error);
    throw error;
  }
};

/**
 * Report content (podcast, event, etc.)
 */
export const reportContent = async (
  reportingUserId: string, 
  contentId: string,
  contentType: 'podcast' | 'event' | 'comment' | 'message',
  reason: string
): Promise<void> => {
  try {
    await supabase
      .from('reports')
      .insert({
        reporter_id: reportingUserId,
        content_id: contentId,
        reason,
        type: contentType,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Error reporting content:', error);
    throw error;
  }
};
