
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";
import ChatItem from "./ChatItem";
import { ChatWithUser } from "@/types/chat";

interface ChatListProps {
  chats: ChatWithUser[];
  loading: boolean;
  onNewChat: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, loading, onNewChat }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-medium mb-2">No messages yet</h2>
        <p className="text-gray-500 mb-4">
          Start a conversation with another user to see messages here
        </p>
        <Button onClick={onNewChat}>
          Start a conversation
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
};

export default ChatList;
