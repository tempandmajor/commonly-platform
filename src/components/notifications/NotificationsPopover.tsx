
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationsList from "./NotificationsList";
import { getNotifications, markAllAsRead, getUnreadCount, subscribeToNotifications, subscribeToUnreadCount } from "@/services/notificationService";

const NotificationsPopover = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    const fetchNotifications = async () => {
      try {
        const notificationsData = await getNotifications(currentUser.uid);
        setNotifications(notificationsData);
        
        const count = await getUnreadCount(currentUser.uid);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const unsubscribeNotifications = subscribeToNotifications(currentUser.uid, (updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    // Subscribe to unread count updates
    const unsubscribeUnreadCount = subscribeToUnreadCount(currentUser.uid, (count) => {
      setUnreadCount(count);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeUnreadCount();
    };
  }, [currentUser]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    // When opening the popover, mark notifications as read
    if (open && unreadCount > 0 && currentUser) {
      handleMarkAllAsRead();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      await markAllAsRead(currentUser.uid);
      
      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          read: true
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <NotificationsList 
          notifications={notifications}
          loading={loading}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
