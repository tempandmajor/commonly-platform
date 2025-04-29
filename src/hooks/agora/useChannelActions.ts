
import AgoraRTC from "agora-rtc-sdk-ng";
import { AgoraState } from "@/types/agora";

export const useChannelActions = (
  clientRef: React.MutableRefObject<any>,
  state: AgoraState,
  setState: React.Dispatch<React.SetStateAction<AgoraState>>
) => {
  const joinChannel = async () => {
    try {
      const { token, appId } = state;
      
      if (!token || !appId) {
        setState(prev => ({ ...prev, error: "Channel name, token, and App ID are required" }));
        return;
      }

      if (!clientRef.current) {
        setState(prev => ({ ...prev, error: "Agora client not initialized" }));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      // Join the channel
      await clientRef.current.join(appId, state.token, "host");

      // Create and publish local audio and video tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      
      await clientRef.current.publish([audioTrack, videoTrack]);

      setState(prev => ({
        ...prev,
        localAudioTrack: audioTrack,
        localVideoTrack: videoTrack,
        isJoined: true,
        loading: false
      }));
    } catch (err: any) {
      console.error("Error joining channel:", err);
      setState(prev => ({
        ...prev, 
        error: `Failed to join channel: ${err.message}`,
        loading: false
      }));
    }
  };

  const leaveChannel = async () => {
    if (state.localAudioTrack) {
      state.localAudioTrack.close();
    }
    if (state.localVideoTrack) {
      state.localVideoTrack.close();
    }

    // Leave the channel
    await clientRef.current?.leave();
    
    // Reset state
    setState(prev => ({
      ...prev,
      localAudioTrack: null,
      localVideoTrack: null,
      remoteUsers: [],
      isJoined: false
    }));
  };

  const toggleMute = async (type: "audio" | "video") => {
    try {
      if (type === "audio" && state.localAudioTrack) {
        const newStatus = !state.mediaStatus.audio;
        await state.localAudioTrack.setEnabled(newStatus);
        setState(prev => ({ 
          ...prev, 
          mediaStatus: { ...prev.mediaStatus, audio: newStatus } 
        }));
      } else if (type === "video" && state.localVideoTrack) {
        const newStatus = !state.mediaStatus.video;
        await state.localVideoTrack.setEnabled(newStatus);
        setState(prev => ({ 
          ...prev, 
          mediaStatus: { ...prev.mediaStatus, video: newStatus } 
        }));
      }
    } catch (err: any) {
      console.error(`Error toggling ${type}:`, err);
      setState(prev => ({ ...prev, error: `Failed to toggle ${type}: ${err.message}` }));
    }
  };

  return {
    joinChannel,
    leaveChannel,
    toggleMute
  };
};
