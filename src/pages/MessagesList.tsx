
import React from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ChatList from "@/components/messages/ChatList";
import NewChatDialog from "@/components/messages/NewChatDialog";
import { useChatList } from "@/hooks/useChatList";
import { useNewChat } from "@/hooks/useNewChat";

const MessagesList = () => {
  const { chats, loading } = useChatList();
  const {
    newChatOpen,
    setNewChatOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    handleSearch,
    handleStartChat
  } = useNewChat();

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button onClick={() => setNewChatOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
        
        <ChatList 
          chats={chats} 
          loading={loading} 
          onNewChat={() => setNewChatOpen(true)}
        />
      </div>
      
      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onSearch={handleSearch}
        onStartChat={handleStartChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        searching={searching}
      />
    </>
  );
};

export default MessagesList;
