
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Check, Trash2 } from "lucide-react";
import { Notification } from "@/types/notification";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface NotificationsListProps {
  limit?: number;
  showMarkAllRead?: boolean;
  showClear?: boolean;
  onClose?: () => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  limit,
  showMarkAllRead = true,
  showClear = true,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUser?.uid)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      const notificationsData = data.map((notification): Notification => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        body: notification.body || "",
        imageUrl: notification.image_url,
        actionUrl: notification.action_url,
        read: notification.read,
        createdAt: notification.created_at,
        data: notification.data,
      }));

      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", currentUser?.uid)
        .eq("read", false);

      if (error) throw error;

      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all notifications as read",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", currentUser?.uid);

      if (error) throw error;

      setNotifications([]);
      
      toast({
        title: "Success",
        description: "All notifications cleared",
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear notifications",
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Handle navigation if there's an action URL
    if (notification.actionUrl) {
      if (onClose) onClose();
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return "📨";
      case "like":
        return "❤️";
      case "follow":
        return "👤";
      case "comment":
        return "💬";
      case "podcast":
        return "🎙️";
      case "event":
        return "📅";
      default:
        return "🔔";
    }
  };

  const getAvatarFallback = (type: string) => {
    switch (type) {
      case "message":
        return "M";
      case "like":
        return "L";
      case "follow":
        return "F";
      case "comment":
        return "C";
      case "podcast":
        return "P";
      case "event":
        return "E";
      default:
        return "N";
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Loading Notifications...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Sign in to see your notifications</h3>
            <p className="text-sm text-gray-500 mb-4">
              You need to be logged in to view notifications
            </p>
            <Button onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="default" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {showMarkAllRead && unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={handleMarkAllAsRead}>
                <Check className="h-4 w-4 mr-1" /> Mark all read
              </Button>
            )}
            {showClear && (
              <Button size="sm" variant="outline" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-1" /> Clear all
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p className="text-sm text-gray-500">
              You're all caught up! No new notifications.
            </p>
          </div>
        ) : (
          <ScrollArea className={limit ? `h-[400px]` : "h-auto max-h-[600px]"}>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.read
                      ? "bg-background"
                      : "bg-primary/5"
                  } hover:bg-muted`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Avatar>
                    {notification.imageUrl ? (
                      <AvatarImage src={notification.imageUrl} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getAvatarFallback(notification.type)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">
                      {notification.title}{" "}
                      {!notification.read && (
                        <span className="inline-block w-2 h-2 bg-primary rounded-full ml-1"></span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{notification.body}</p>
                    <p className="text-xs text-gray-400">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      {limit && notifications.length > 0 && (
        <CardFooter className="flex justify-center border-t pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              if (onClose) onClose();
              navigate("/notifications");
            }}
          >
            View all notifications
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NotificationsList;
