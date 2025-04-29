
import { useEffect, useState, useRef } from "react";
import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { AgoraClientConfig, AgoraState } from "@/types/agora";
import { generateAgoraToken } from "@/services/agoraService";
import { supabase } from "@/integrations/supabase/client";

const defaultConfig: AgoraClientConfig = {
  mode: "rtc",
  codec: "vp8",
};

export const useInitializeAgora = (
  channelName: string,
  uid: string,
  config: AgoraClientConfig = defaultConfig
): { clientRef: React.MutableRefObject<IAgoraRTCClient | null>; state: AgoraState; setState: React.Dispatch<React.SetStateAction<AgoraState>> } => {
  const [state, setState] = useState<AgoraState>({
    localAudioTrack: null,
    localVideoTrack: null,
    remoteUsers: [],
    token: "",
    appId: "",
    isJoined: false,
    mediaStatus: { audio: true, video: true },
    loading: true,
    error: null,
  });

  const clientRef = useRef<IAgoraRTCClient | null>(null);

  useEffect(() => {
    // Initialize Agora client
    clientRef.current = AgoraRTC.createClient(config);

    // Get the App ID from edge function
    const fetchAppId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-agora-config');
        
        if (error) {
          throw error;
        }
        
        if (data && data.appId) {
          setState(prev => ({ ...prev, appId: data.appId }));
        } else {
          throw new Error("Failed to retrieve Agora App ID");
        }
      } catch (err) {
        console.error("Error fetching Agora App ID:", err);
        setState(prev => ({ ...prev, error: "Failed to fetch Agora configuration" }));
      }
    };

    // Get token from server
    const fetchToken = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        await fetchAppId();
        const tokenValue = await generateAgoraToken(channelName, uid, "host");
        setState(prev => ({ ...prev, token: tokenValue, loading: false }));
      } catch (err) {
        console.error("Token generation error:", err);
        setState(prev => ({
          ...prev,
          error: "Failed to generate token. Please try again.",
          loading: false
        }));
      }
    };

    fetchToken();

    // Clean up function - handled in useAgora.ts

  }, [channelName, uid]);

  return { clientRef, state, setState };
};
