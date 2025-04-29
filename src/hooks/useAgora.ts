
import { useState, useEffect, useRef } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
} from "agora-rtc-sdk-ng";
import { generateAgoraToken } from "@/services/agoraService";
import { supabase } from "@/integrations/supabase/client";

export type MediaStatus = {
  audio: boolean;
  video: boolean;
};

export type AgoraClientConfig = {
  mode: "rtc" | "live";
  codec: "vp8" | "h264";
};

const defaultConfig: AgoraClientConfig = {
  mode: "rtc",
  codec: "vp8",
};

export const useAgora = (
  channelName: string,
  uid: string,
  config: AgoraClientConfig = defaultConfig
) => {
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [token, setToken] = useState<string>("");
  const [appId, setAppId] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>({ audio: true, video: true });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          setAppId(data.appId);
        } else {
          throw new Error("Failed to retrieve Agora App ID");
        }
      } catch (err) {
        console.error("Error fetching Agora App ID:", err);
        setError("Failed to fetch Agora configuration");
      }
    };

    // Get token from server
    const fetchToken = async () => {
      try {
        setLoading(true);
        await fetchAppId();
        const tokenValue = await generateAgoraToken(channelName, uid, "host");
        setToken(tokenValue);
        setLoading(false);
      } catch (err) {
        console.error("Token generation error:", err);
        setError("Failed to generate token. Please try again.");
        setLoading(false);
      }
    };

    fetchToken();

    // Clean up function
    return () => {
      // Make sure to leave the channel and release tracks when component unmounts
      leaveChannel();
    };
  }, [channelName, uid]);

  const joinChannel = async () => {
    try {
      if (!token || !channelName || !appId) {
        setError("Channel name, token, and App ID are required");
        return;
      }

      if (!clientRef.current) {
        setError("Agora client not initialized");
        return;
      }

      setLoading(true);
      setError(null);

      // Join the channel
      await clientRef.current.join(appId, channelName, token, uid);

      // Create and publish local audio and video tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      
      await clientRef.current.publish([audioTrack, videoTrack]);

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
      setIsJoined(true);

      // Set up event listeners
      clientRef.current.on("user-published", async (user, mediaType) => {
        await clientRef.current?.subscribe(user, mediaType);
        
        // Update remote users array
        setRemoteUsers(prevUsers => {
          const exists = prevUsers.findIndex(u => u.uid === user.uid) !== -1;
          if (exists) {
            return prevUsers.map(u => u.uid === user.uid ? user : u);
          } else {
            return [...prevUsers, user];
          }
        });
      });

      clientRef.current.on("user-unpublished", (user) => {
        // Update remote users array
        setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
      });

      clientRef.current.on("user-left", (user) => {
        // Update remote users array
        setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
      });

      setLoading(false);
    } catch (err: any) {
      console.error("Error joining channel:", err);
      setError(`Failed to join channel: ${err.message}`);
      setLoading(false);
    }
  };

  const leaveChannel = async () => {
    if (localAudioTrack) {
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.close();
    }

    // Leave the channel
    await clientRef.current?.leave();
    
    // Reset state
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setRemoteUsers([]);
    setIsJoined(false);
  };

  const toggleMute = async (type: "audio" | "video") => {
    try {
      if (type === "audio" && localAudioTrack) {
        if (mediaStatus.audio) {
          await localAudioTrack.setEnabled(false);
        } else {
          await localAudioTrack.setEnabled(true);
        }
        setMediaStatus(prev => ({ ...prev, audio: !prev.audio }));
      } else if (type === "video" && localVideoTrack) {
        if (mediaStatus.video) {
          await localVideoTrack.setEnabled(false);
        } else {
          await localVideoTrack.setEnabled(true);
        }
        setMediaStatus(prev => ({ ...prev, video: !prev.video }));
      }
    } catch (err: any) {
      console.error(`Error toggling ${type}:`, err);
      setError(`Failed to toggle ${type}: ${err.message}`);
    }
  };

  return {
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    isJoined,
    mediaStatus,
    loading,
    error,
    joinChannel,
    leaveChannel,
    toggleMute,
  };
};
