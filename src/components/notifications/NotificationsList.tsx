
import React from "react";
import { Notification } from "@/types/auth";
import NotificationItem from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { markAllNotificationsAsRead } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";

interface NotificationsListProps {
  notifications: Notification[];
  userId: string;
  onMarkAllAsRead: () => void;
  loading?: boolean;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ 
  notifications,
  userId,
  onMarkAllAsRead,
  loading = false
}) => {
  const { toast } = useToast();
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId);
      onMarkAllAsRead();
      toast({ 
        title: "Success", 
        description: "All notifications marked as read" 
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };
  
  // Check if there are any unread notifications
  const hasUnread = notifications.some(notification => !notification.read);
  
  return (
    <div className="w-full">
      {notifications.length > 0 && hasUnread && (
        <div className="p-2 border-b flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </div>
      )}
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No notifications yet
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
