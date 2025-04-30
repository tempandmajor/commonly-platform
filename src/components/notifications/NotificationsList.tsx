
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import NotificationItem from "./NotificationItem";
import { Notification } from "@/types/notification";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationsListProps {
  notifications: Notification[];
  userId: string;
  onMarkAllAsRead: () => void;
  loading: boolean;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  userId,
  onMarkAllAsRead,
  loading
}) => {
  const { toast } = useToast();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to update notification status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {notifications.length > 0 ? (
        <>
          <div className="p-2 border-b flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Mark all as read
            </Button>
          </div>
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id}
                notification={notification}
                onRead={handleMarkAsRead}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="py-8 px-4 text-center">
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
