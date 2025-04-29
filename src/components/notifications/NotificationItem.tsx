
import React from "react";
import { Notification } from "@/types/auth";
import { format } from "date-fns";
import { Bell, User, DollarSign, MessageSquare, Calendar, BarChart } from "lucide-react";
import { markNotificationAsRead } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const formattedTime = notification.createdAt ? 
    format(notification.createdAt.toDate ? notification.createdAt.toDate() : new Date(notification.createdAt), "MMM d, p") : 
    "";
  
  const handleNotificationClick = async () => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    
    // Handle navigation based on notification type and data
    if (notification.data) {
      if (notification.type === 'event_update' && notification.data.eventId) {
        navigate(`/events/${notification.data.eventId}`);
      } else if (notification.type === 'message' && notification.data.chatId) {
        navigate(`/messages/${notification.data.chatId}`);
      } else if (notification.type === 'referral_earnings') {
        navigate('/wallet');
      } else if (notification.type === 'new_follower' && notification.data.followerId) {
        navigate(`/profile/${notification.data.followerId}`);
      }
    }
  };
  
  const getIcon = () => {
    switch (notification.type) {
      case 'event_update':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'new_follower':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'referral_earnings':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-pink-500" />;
      case 'sponsorship':
        return <BarChart className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div 
      className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start">
        <div className="mr-3">
          {notification.image ? (
            <div className="h-10 w-10 rounded-full overflow-hidden">
              <img src={notification.image} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              {getIcon()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
          <div className="text-xs text-gray-400 mt-1">{formattedTime}</div>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
