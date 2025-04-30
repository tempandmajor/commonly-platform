
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { updateTypingStatus } from "@/services/chat";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useTypingStatus = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useAuth();
  const [isOtherUserTyping, setIsOtherUserTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<number | null>(null);

  // Subscribe to typing status
  useEffect(() => {
    if (!chatId || !currentUser) return;

    const typingQuery = query(collection(db, "chats", chatId, "typing"));
    
    const unsubscribeTyping = onSnapshot(typingQuery, (snapshot) => {
      const typingData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Find if other user is typing
      const otherUserTypingData = typingData.find(data => 
        data.id !== currentUser.uid && data.userId !== currentUser.uid && data.isTyping === true
      );
      
      if (otherUserTypingData) {
        setIsOtherUserTyping(true);
      } else {
        setIsOtherUserTyping(false);
      }
    });
    
    return () => {
      unsubscribeTyping();
    };
  }, [chatId, currentUser]);

  // Handle user typing
  const handleUserTyping = useCallback((isTyping: boolean) => {
    if (!currentUser || !chatId) return;
    
    // Update typing status
    updateTypingStatus(chatId, currentUser.uid, isTyping);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // If user is typing, set a timeout to automatically set typing to false
    if (isTyping) {
      typingTimeoutRef.current = window.setTimeout(() => {
        updateTypingStatus(chatId, currentUser.uid, false);
        typingTimeoutRef.current = null;
      }, 5000); // Stop typing indicator after 5 seconds of inactivity
    }
  }, [chatId, currentUser]);

  return {
    isOtherUserTyping,
    handleUserTyping
  };
};
