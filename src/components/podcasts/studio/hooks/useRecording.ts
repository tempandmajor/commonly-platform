
import { useState, useRef } from 'react';
import { generateAgoraToken, startCloudRecording, stopCloudRecording } from '@/services/agoraService';
import { useToast } from '@/hooks/use-toast';

export function useRecording(
  channelName: string,
  uid: string,
  isJoined: boolean,
  onRecordingCompleted: (recordingUrl: string, duration: number) => void
) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  const recordingTimerRef = useRef<number | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    if (!isJoined) {
      toast({
        title: "Cannot start recording",
        description: "Please join the channel first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessingRecording(true);
      // Generate a recording token using our edge function
      const token = await generateAgoraToken(channelName, uid, "host");
      const resId = await startCloudRecording(channelName, uid, token);
      setResourceId(resId);
      setIsRecording(true);
      
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Your podcast recording has started",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description: "Could not start recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!isRecording || !resourceId) {
      return;
    }

    try {
      setIsProcessingRecording(true);
      
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      const recordingUrl = await stopCloudRecording(channelName, uid, resourceId);
      setIsRecording(false);
      onRecordingCompleted(recordingUrl, recordingDuration);
      
      toast({
        title: "Recording completed",
        description: "Your podcast has been recorded successfully",
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
      toast({
        title: "Recording error",
        description: "There was a problem finishing the recording",
        variant: "destructive",
      });
    } finally {
      setIsProcessingRecording(false);
    }
  };

  return {
    isRecording,
    recordingDuration,
    isProcessingRecording,
    startRecording,
    stopRecording
  };
}
