
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Notification } from "@/types/notification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BellRing,
  Heart,
  MessageSquare,
  UserPlus,
  Calendar,
  Music,
  Dollar,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={16} className="text-red-500" />;
      case "comment":
        return <MessageSquare size={16} className="text-blue-500" />;
      case "follow":
      case "new_follower":
        return <UserPlus size={16} className="text-green-500" />;
      case "event":
      case "event_update":
        return <Calendar size={16} className="text-purple-500" />;
      case "podcast":
        return <Music size={16} className="text-indigo-500" />;
      case "referral_earnings":
      case "sponsorship":
        return <Dollar size={16} className="text-amber-500" />;
      default:
        return <BellRing size={16} className="text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "like":
        return "bg-red-50";
      case "comment":
        return "bg-blue-50";
      case "follow":
      case "new_follower":
        return "bg-green-50";
      case "event":
      case "event_update":
        return "bg-purple-50";
      case "podcast":
        return "bg-indigo-50";
      case "referral_earnings":
      case "sponsorship":
        return "bg-amber-50";
      default:
        return "bg-gray-50";
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
  };

  return (
    <Link
      to={notification.actionUrl || "#"}
      className={cn(
        "flex items-start p-4 border-b transition-colors hover:bg-gray-50",
        !notification.read && "bg-blue-50"
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mr-4">
        {notification.imageUrl ? (
          <Avatar>
            <AvatarImage src={notification.imageUrl} alt="Notification" />
            <AvatarFallback>
              {getNotificationIcon(notification.type)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              getBackgroundColor(notification.type)
            )}
          >
            {getNotificationIcon(notification.type)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{notification.title}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.body}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
      {!notification.read && (
        <div className="ml-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </Link>
  );
};

export default NotificationItem;
