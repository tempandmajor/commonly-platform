
import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/types/auth";
import { Chat, ChatWithUser } from "@/types/chat";

export const fetchChatParticipants = async (chatId: string): Promise<UserData[]> => {
  try {
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('participants')
      .eq('id', chatId)
      .single();
    
    if (chatError || !chatData) {
      throw new Error(`Failed to fetch chat data: ${chatError?.message || 'Unknown error'}`);
    }
    
    // Fetch all participants' user data
    const participantIds = chatData.participants || [];
    if (participantIds.length === 0) {
      return [];
    }
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .in('id', participantIds);
      
    if (userError) {
      throw new Error(`Failed to fetch participant data: ${userError.message}`);
    }
    
    return (userData || []).map(user => ({
      uid: user.id,
      displayName: user.display_name,
      photoURL: user.photo_url,
      isOnline: user.is_online || false,
      lastSeen: user.last_seen,
      email: user.email
    }));
  } catch (error) {
    console.error('Error fetching chat participants:', error);
    return [];
  }
};
