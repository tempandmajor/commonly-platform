
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserData } from "@/types/auth";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: () => Promise<void>;  // Changed this to match the implementation
  onStartChat: (userId: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: UserData[];
  searching: boolean;
}

const NewChatDialog: React.FC<NewChatDialogProps> = ({
  open,
  onOpenChange,
  onSearch,
  onStartChat,
  searchQuery,
  setSearchQuery,
  searchResults,
  searching
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
            <Button 
              onClick={() => onSearch()}  // Fixed this to make it a function call
              disabled={searching || !searchQuery.trim()}
            >
              Search
            </Button>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {searching ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                {searchQuery.trim() 
                  ? "No users found. Try a different search." 
                  : "Search for users to start a conversation"}
              </p>
            ) : (
              <ul className="divide-y">
                {searchResults.map((user) => {
                  const userInitials = user.displayName
                    ? user.displayName
                        .split(" ")
                        .map(name => name[0])
                        .join("")
                        .toUpperCase()
                    : "?";
                    
                  return (
                    <li 
                      key={user.uid} 
                      className="py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onStartChat(user.uid)}
                    >
                      <div className="flex items-center px-2 py-1">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src={user.photoURL || undefined} />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <span>{user.displayName}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;
