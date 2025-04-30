
import { formatDistanceToNow } from "date-fns";
import { Notification, NotificationType } from "@/types/notification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  // Format the relative time (e.g., "5 minutes ago")
  const relativeTime = notification.createdAt ? 
    formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 
    "recently";

  // Generate appropriate icon or content based on notification type
  const renderIcon = () => {
    switch (notification.type as NotificationType) {
      case "message":
        return "💬";
      case "event":
      case "event_update":
        return notification.data?.eventTitle ? `🎟 ${notification.data.eventTitle}` : "🎟";
      case "like":
        return "❤️";
      case "follow":
      case "new_follower":
        return notification.data?.senderName ? `👤 ${notification.data.senderName}` : "👤";
      case "comment":
        return "💬";
      case "podcast":
        return "🎙";
      case "referral_earnings":
        return "💰";
      case "sponsorship":
        return "🤝";
      case "system":
      default:
        return "🔔";
    }
  };

  // Generate appropriate background color based on notification type
  const getBgColor = () => {
    switch (notification.type as NotificationType) {
      case "event":
      case "event_update":
        return "bg-blue-50";
      case "podcast":
        return "bg-purple-50";
      case "message":
        return "bg-green-50";
      case "new_follower":
        return "bg-yellow-50";
      case "referral_earnings":
        return "bg-emerald-50";
      case "sponsorship":
        return "bg-amber-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-4 p-4 rounded-lg transition-colors border mb-3",
        getBgColor(),
        notification.read ? "border-gray-200" : "border-blue-300",
        onClick && "cursor-pointer hover:bg-gray-100"
      )}
    >
      <div className="shrink-0">
        {notification.image ? (
          <Avatar>
            <AvatarImage src={notification.image} alt="" />
            <AvatarFallback>{renderIcon()}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
            {renderIcon()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900">{notification.title}</div>
        <div className="text-sm text-gray-600 line-clamp-2 mt-0.5">
          {notification.body || notification.data?.message || "You have a new notification"}
        </div>
        <div className="text-xs text-gray-500 mt-1">{relativeTime}</div>
      </div>
    </div>
  );
};

export default NotificationItem;
