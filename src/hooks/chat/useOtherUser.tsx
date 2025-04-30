
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/services/userService";
import { UserData } from "@/types/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useOtherUser = (messages: any[]) => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState<UserData | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  // Get other user data and status
  useEffect(() => {
    if (!currentUser || !chatId || messages.length === 0) return;

    const fetchOtherUser = async () => {
      // Get the other user's ID from the messages
      const otherUserId = messages[0].senderId === currentUser.uid
        ? messages[0].recipientId
        : messages[0].senderId;
      
      // Get the other user's data
      const userData = await getUserProfile(otherUserId);
      setOtherUser(userData);
      
      // Subscribe to user's online status
      if (userData) {
        const userStatusRef = doc(db, "userStatus", userData.uid);
        const unsubscribeStatus = onSnapshot(userStatusRef, (doc) => {
          if (doc.exists()) {
            const statusData = doc.data();
            setIsOnline(statusData.isOnline || false);
            setLastSeen(statusData.lastSeen ? new Date(statusData.lastSeen) : null);
          } else {
            setIsOnline(false);
            setLastSeen(null);
          }
        });
        
        return () => {
          unsubscribeStatus();
        };
      }
    };

    fetchOtherUser();
  }, [chatId, currentUser, messages]);

  return {
    otherUser,
    isOnline,
    lastSeen
  };
};
