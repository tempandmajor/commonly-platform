
import { supabase } from '@/integrations/supabase/client';

export const updateContentPage = async (
  pageId: string,
  title: string,
  content: Record<string, any>
) => {
  try {
    // Check if content page exists
    const { data: existing, error: checkError } = await supabase
      .from('content')
      .select('*')
      .eq('id', pageId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // Not found error
      throw checkError;
    }
    
    if (existing) {
      // Update existing page
      const { error: updateError } = await supabase
        .from('content')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', pageId);
      
      if (updateError) throw updateError;
    } else {
      // Create new page
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          id: pageId,
          title,
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating content page:", error);
    throw error;
  }
};
