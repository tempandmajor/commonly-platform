
import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import NotificationsList from "./NotificationsList";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getUserNotifications,
  subscribeToNotifications,
  subscribeToUnreadNotificationCount,
  markAllNotificationsAsRead
} from "@/services/notificationService";
import { Notification } from "@/types/auth";

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
        const notificationData = await getUserNotifications(currentUser.uid);
        setNotifications(notificationData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Subscribe to real-time updates
    const unsubscribeNotifications = subscribeToNotifications(
      currentUser.uid,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
      }
    );
    
    // Subscribe to unread count
    const unsubscribeCount = subscribeToUnreadNotificationCount(
      currentUser.uid,
      (count) => {
        setUnreadCount(count);
      }
    );
    
    return () => {
      unsubscribeNotifications();
      unsubscribeCount();
    };
  }, [currentUser]);
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    // Mark all as read when closing the popover
    if (!isOpen && unreadCount > 0 && currentUser?.uid) {
      markAllNotificationsAsRead(currentUser.uid).catch(console.error);
      setUnreadCount(0);
    }
  };
  
  const handleMarkAllAsRead = () => {
    setUnreadCount(0);
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({
        ...notification,
        read: true
      }))
    );
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
            onMarkAllAsRead={handleMarkAllAsRead}
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
            <a href="/settings">Manage Notifications</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
