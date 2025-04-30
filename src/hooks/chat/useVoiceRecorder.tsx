
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVoice, setRecordedVoice] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
      }
      
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        
        // Stop all audio tracks if available
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getAudioTracks().forEach(track => track.stop());
        }
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // Reset recording state
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setRecordedVoice(audioBlob);
        
        // Stop all audio tracks
        stream.getAudioTracks().forEach(track => track.stop());
        
        // Clear the timer
        if (timerIntervalRef.current !== null) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        
        setIsRecording(false);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access error",
        description: "Please allow microphone access to record voice messages",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };
  
  const clearRecording = () => {
    setRecordedVoice(null);
  };
  
  return {
    isRecording,
    recordingTime,
    recordedVoice,
    startRecording,
    stopRecording,
    clearRecording
  };
};
