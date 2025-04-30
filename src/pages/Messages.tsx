
import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useChat } from "@/hooks/chat";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import the components
import ChatHeader from "@/components/messages/ChatHeader";
import MessageDisplay from "@/components/messages/MessageDisplay";
import MessageInput from "@/components/messages/MessageInput";
import EmojiPicker from "@/components/messages/EmojiPicker";

const Messages = () => {
  const {
    messages,
    otherUser,
    loading,
    sending,
    isOnline,
    lastSeen,
    isUploading,
    uploadProgress,
    showEmojiPicker,
    isOtherUserTyping,
    setShowEmojiPicker,
    handleSendMessage,
    handleEmojiSelect,
    handleMarkMessagesAsRead,
    handleUserTyping
  } = useChat();

  const [newMessage, setNewMessage] = useState<string>("");

  const addEmojiToMessage = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Chat header with user info */}
          <ChatHeader 
            otherUser={otherUser}
            isOnline={isOnline}
            lastSeen={lastSeen ? new Date(lastSeen) : undefined}
            isTyping={isOtherUserTyping}
          />
          
          {/* Message display area */}
          <MessageDisplay 
            messages={messages}
            loading={loading}
            otherUser={otherUser}
            onMessagesRead={handleMarkMessagesAsRead}
          />

          {/* Emoji button - separate from input to control state */}
          <div className="border-t px-3 pt-3 pb-0">
            <Button
              type="button"
              variant="ghost"
              className="p-2"
              onClick={() => setShowEmojiPicker(true)}
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
          
          {/* Message input with file upload */}
          <MessageInput 
            onSendMessage={(e, text, file, voiceBlob) => {
              setNewMessage("");
              handleSendMessage(e, text, file, voiceBlob);
            }}
            onTyping={handleUserTyping}
            sending={sending}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </div>
      </div>
      
      {/* Emoji picker dialog */}
      <EmojiPicker 
        open={showEmojiPicker}
        onOpenChange={setShowEmojiPicker}
        onEmojiSelect={addEmojiToMessage}
      />
    </>
  );
};

export default Messages;
