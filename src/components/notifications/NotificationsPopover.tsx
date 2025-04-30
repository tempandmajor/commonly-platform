
import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import NotificationsList from "./NotificationsList";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";

const NotificationsPopover: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // Initial fetch
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUser.uid)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        // Map to our notification type
        const notificationData: Notification[] = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          type: item.type,
          title: item.title,
          body: item.body,
          imageUrl: item.image_url,
          actionUrl: item.action_url,
          read: item.read,
          createdAt: item.created_at,
          data: item.data
        }));
        
        setNotifications(notificationData);
        
        // Count unread notifications
        const unreadItems = notificationData.filter(notification => !notification.read);
        setUnreadCount(unreadItems.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Subscribe to real-time notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', {
        event: 'INSERT', 
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUser.uid}`,
      }, (payload) => {
        const newNotification: Notification = {
          id: payload.new.id,
          userId: payload.new.user_id,
          type: payload.new.type,
          title: payload.new.title,
          body: payload.new.body,
          imageUrl: payload.new.image_url,
          actionUrl: payload.new.action_url,
          read: payload.new.read,
          createdAt: payload.new.created_at,
          data: payload.new.data
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    // Mark all as read when closing the popover
    if (!isOpen && unreadCount > 0 && currentUser?.uid) {
      // We don't await this as it's not critical for the UI flow
      markAllAsRead();
    }
  };
  
  const markAllAsRead = async () => {
    if (!currentUser?.uid) return;
    
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', currentUser.uid)
        .eq('read', false);
      
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          read: true
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="py-2 px-3 border-b">
          <h3 className="font-medium">Notifications</h3>
        </div>
        {currentUser?.uid && (
          <NotificationsList 
            notifications={notifications}
            userId={currentUser.uid}
            onMarkAllAsRead={markAllAsRead}
            loading={loading}
          />
        )}
        <div className="p-2 border-t text-center">
          <Button 
            variant="link" 
            size="sm" 
            asChild 
            className="text-xs text-gray-500"
          >
            <a href="/settings/notifications">Manage Notifications</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
