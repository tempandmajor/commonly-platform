
import React from 'react';
import VideoPreview from './VideoPreview';
import { IAgoraRTCRemoteUser, ICameraVideoTrack } from "agora-rtc-sdk-ng";

interface VideoGridProps {
  localVideoTrack: ICameraVideoTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ localVideoTrack, remoteUsers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <VideoPreview videoTrack={localVideoTrack} name="You (Host)" />
      
      {remoteUsers.length > 0 ? (
        remoteUsers.map(user => (
          <VideoPreview
            key={user.uid.toString()}
            videoTrack={user.videoTrack}
            name="Guest"
          />
        ))
      ) : (
        <div className="bg-gray-800 rounded-md overflow-hidden aspect-video flex items-center justify-center text-gray-500">
          <p>No guests have joined yet</p>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
