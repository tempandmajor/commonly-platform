
import {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
} from "agora-rtc-sdk-ng";

export type MediaStatus = {
  audio: boolean;
  video: boolean;
};

export type AgoraClientConfig = {
  mode: "rtc" | "live";
  codec: "vp8" | "h264";
};

export interface AgoraState {
  localAudioTrack: IMicrophoneAudioTrack | null;
  localVideoTrack: ICameraVideoTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  token: string;
  appId: string;
  isJoined: boolean;
  mediaStatus: MediaStatus;
  loading: boolean;
  error: string | null;
}

export interface AgoraHookReturn extends AgoraState {
  joinChannel: () => Promise<void>;
  leaveChannel: () => Promise<void>;
  toggleMute: (type: "audio" | "video") => Promise<void>;
}
