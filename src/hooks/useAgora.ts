
import { useInitializeAgora } from './agora/useInitialize';
import { useChannelEvents } from './agora/useChannelEvents';
import { useChannelActions } from './agora/useChannelActions';
import { AgoraClientConfig, AgoraHookReturn } from '@/types/agora';

export type { MediaStatus, AgoraClientConfig } from '@/types/agora';

export const useAgora = (
  channelName: string,
  uid: string,
  config?: AgoraClientConfig
): AgoraHookReturn => {
  const { clientRef, state, setState } = useInitializeAgora(channelName, uid, config);

  // Set up event handlers for user join/leave
  useChannelEvents(clientRef.current, setState);

  // Get action methods
  const { joinChannel, leaveChannel, toggleMute } = useChannelActions(clientRef, state, setState);

  return {
    ...state,
    joinChannel,
    leaveChannel,
    toggleMute,
  };
};
