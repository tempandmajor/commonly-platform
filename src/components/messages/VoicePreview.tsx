
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, Pause } from 'lucide-react';

export interface VoicePreviewProps {
  voiceUrl?: string;
  voiceBlob?: Blob;
  onCancel: () => void;
}

const VoicePreview: React.FC<VoicePreviewProps> = ({ voiceUrl, voiceBlob, onCancel }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (voiceUrl) {
      setPreviewUrl(voiceUrl);
    } else if (voiceBlob) {
      const url = URL.createObjectURL(voiceBlob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [voiceUrl, voiceBlob]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="relative p-4 border rounded-md bg-gray-50 mb-4 flex items-center">
      <audio 
        ref={audioRef} 
        src={previewUrl} 
        onEnded={handleAudioEnded}
        className="hidden"
      />
      
      <Button
        type="button"
        size="icon"
        className="h-8 w-8 mr-3 rounded-full"
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      
      <span className="text-sm text-gray-500">Voice message</span>
      
      <Button 
        type="button" 
        size="icon" 
        variant="ghost" 
        className="absolute top-2 right-2 h-6 w-6"
        onClick={onCancel}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default VoicePreview;
