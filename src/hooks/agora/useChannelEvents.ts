
import { useEffect } from "react";
import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { AgoraState } from "@/types/agora";

export const useChannelEvents = (
  client: IAgoraRTCClient | null,
  setState: React.Dispatch<React.SetStateAction<AgoraState>>
) => {
  useEffect(() => {
    if (!client) return;

    // Set up event listeners
    const handleUserPublished = async (user: any, mediaType: any) => {
      await client?.subscribe(user, mediaType);
      
      // Update remote users array
      setState(prev => {
        const exists = prev.remoteUsers.findIndex(u => u.uid === user.uid) !== -1;
        if (exists) {
          return {
            ...prev,
            remoteUsers: prev.remoteUsers.map(u => u.uid === user.uid ? user : u)
          };
        } else {
          return {
            ...prev,
            remoteUsers: [...prev.remoteUsers, user]
          };
        }
      });
    };

    const handleUserUnpublished = (user: any) => {
      // Update remote users array
      setState(prev => ({
        ...prev,
        remoteUsers: prev.remoteUsers.filter(u => u.uid !== user.uid)
      }));
    };

    const handleUserLeft = (user: any) => {
      // Update remote users array
      setState(prev => ({
        ...prev,
        remoteUsers: prev.remoteUsers.filter(u => u.uid !== user.uid)
      }));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    // Clean up event listeners
    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
    };
  }, [client, setState]);
};
