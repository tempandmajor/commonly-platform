
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types/notification";
import { useToast } from "@/hooks/use-toast";
import NotificationItem from "./NotificationItem";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, CheckCircle2 } from "lucide-react";

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      
      // Setup real-time subscription
      const notificationsChannel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${currentUser.uid}`
          },
          (payload) => {
            const newNotification = mapNotification(payload.new as any);
            setNotifications(prev => [newNotification, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(notificationsChannel);
      };
    }
  }, [currentUser]);

  const mapNotification = (notification: any): Notification => {
    return {
      id: notification.id,
      userId: notification.user_id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      imageUrl: notification.image_url,
      actionUrl: notification.action_url,
      read: notification.read,
      createdAt: notification.created_at,
      data: notification.data
    };
  };

  const fetchNotifications = async (offset: number = 0) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.uid)
        .order('created_at', { ascending: false })
        .range(offset, offset + 14);
        
      if (error) throw error;
      
      const mappedNotifications = data.map(mapNotification);
      
      if (offset === 0) {
        setNotifications(mappedNotifications);
      } else {
        setNotifications(prev => [...prev, ...mappedNotifications]);
      }
      
      setHasMore(data.length === 15);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchNotifications(notifications.length);
  };

  const markAsRead = async (id: string) => {
    if (!currentUser) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
        
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser || notifications.every(n => n.read)) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', currentUser.uid)
        .eq('read', false);
        
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!loading && notifications.length === 0) {
    return (
      <div className="text-center p-8">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
        <h3 className="font-medium text-lg">No notifications</h3>
        <p className="text-muted-foreground">
          You don't have any notifications at the moment.
        </p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="flex justify-between items-center p-4 bg-background sticky top-0 z-10">
        <div>
          <h3 className="font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="flex items-center gap-1"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>
      <Separator />

      <div className="max-h-[70vh] overflow-y-auto">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={markAsRead}
          />
        ))}
        
        {hasMore && (
          <div className="p-4 text-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
