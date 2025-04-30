
import { Chat, UserData } from "./auth";

// Extended chat type with user data and unread count
export interface ChatWithUser extends Chat {
  user: UserData;
  unreadCount?: number;
}
