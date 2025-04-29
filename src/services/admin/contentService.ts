
import { supabase } from '@/integrations/supabase/client';

// Content management
export const updateContentPage = async (pageId: string, content: any) => {
  try {
    const { error } = await supabase
      .from('content')
      .upsert({
        id: pageId,
        ...content,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
};
