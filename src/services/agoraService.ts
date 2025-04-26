
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

// Agora SDK configurations
export const APP_ID = "YOUR_AGORA_APP_ID"; // Replace with actual Agora App ID

// Generate token for joining a channel (this would typically be done via a backend)
export const generateAgoraToken = async (
  channelName: string,
  uid: string,
  role: "host" | "audience"
): Promise<string> => {
  try {
    const generateToken = httpsCallable(functions, "generateAgoraToken");
    const result = await generateToken({ channelName, uid, role });
    return (result.data as { token: string }).token;
  } catch (error) {
    console.error("Error generating Agora token:", error);
    throw error;
  }
};

// Start cloud recording
export const startCloudRecording = async (
  channelName: string,
  uid: string,
  token: string
): Promise<string> => {
  try {
    const startRecording = httpsCallable(functions, "startAgoraRecording");
    const result = await startRecording({ channelName, uid, token });
    return (result.data as { resourceId: string }).resourceId;
  } catch (error) {
    console.error("Error starting cloud recording:", error);
    throw error;
  }
};

// Stop cloud recording
export const stopCloudRecording = async (
  channelName: string,
  uid: string,
  resourceId: string
): Promise<string> => {
  try {
    const stopRecording = httpsCallable(functions, "stopAgoraRecording");
    const result = await stopRecording({ channelName, uid, resourceId });
    return (result.data as { recordingUrl: string }).recordingUrl;
  } catch (error) {
    console.error("Error stopping cloud recording:", error);
    throw error;
  }
};
