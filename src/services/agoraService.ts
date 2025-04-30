
import { supabase } from "@/integrations/supabase/client";

// Generate token for joining a channel
export const generateAgoraToken = async (
  channelName: string,
  uid: string,
  role: "host" | "audience"
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-agora-token', {
      body: { channelName, uid, role }
    });
    
    if (error) throw error;
    return data.token;
  } catch (error) {
    console.error("Error generating Agora token:", error);
    throw error;
  }
};

// Start cloud recording
export const startCloudRecording = async (
  channelName: string,
  uid: string,
  token: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('start-agora-recording', {
      body: { channelName, uid, token }
    });
    
    if (error) throw error;
    return data.resourceId;
  } catch (error) {
    console.error("Error starting cloud recording:", error);
    throw error;
  }
};

// Stop cloud recording
export const stopCloudRecording = async (
  channelName: string,
  uid: string,
  resourceId: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('stop-agora-recording', {
      body: { channelName, uid, resourceId }
    });
    
    if (error) throw error;
    return data.recordingUrl;
  } catch (error) {
    console.error("Error stopping cloud recording:", error);
    throw error;
  }
};
