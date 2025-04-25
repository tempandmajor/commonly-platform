
import { 
  doc, 
  getDoc, 
  getDocs, 
  collection,
  query,
  where,
  limit,
  orderBy,
  startAfter 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserData, FollowStats } from "@/types/auth";
import { Event } from "@/types/event";

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Get multiple users by their IDs
export const getUsersByIds = async (userIds: string[]): Promise<UserData[]> => {
  if (!userIds.length) return [];
  
  try {
    const users: UserData[] = [];
    
    // Firebase doesn't support 'in' queries with too many values,
    // so we batch them
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      const q = query(
        collection(db, "users"),
        where("uid", "in", batch)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserData);
      });
    }
    
    return users;
  } catch (error) {
    console.error("Error fetching users by IDs:", error);
    throw error;
  }
};

// Get user's followers
export const getUserFollowers = async (userId: string): Promise<UserData[]> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data() as UserData;
    const followerIds = userData.followers || [];
    
    return await getUsersByIds(followerIds);
  } catch (error) {
    console.error("Error fetching user followers:", error);
    throw error;
  }
};

// Get users that a user is following
export const getUserFollowing = async (userId: string): Promise<UserData[]> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data() as UserData;
    const followingIds = userData.following || [];
    
    return await getUsersByIds(followingIds);
  } catch (error) {
    console.error("Error fetching user following:", error);
    throw error;
  }
};

// Get user's events feed (events from followed users)
export const getUserEventsFeed = async (
  userId: string, 
  lastEventDate?: Date,
  pageSize: number = 10
): Promise<Event[]> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data() as UserData;
    const followingIds = userData.following || [];
    
    if (!followingIds.length) {
      return [];
    }
    
    let eventsQuery = query(
      collection(db, "events"),
      where("organizerId", "in", followingIds.slice(0, 10)), // Firebase limits 'in' queries to 10 items
      where("published", "==", true),
      orderBy("date", "desc")
    );
    
    if (lastEventDate) {
      eventsQuery = query(eventsQuery, startAfter(lastEventDate));
    }
    
    eventsQuery = query(eventsQuery, limit(pageSize));
    
    const eventsSnap = await getDocs(eventsQuery);
    const events: Event[] = [];
    
    eventsSnap.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() } as Event);
    });
    
    // If there are more than 10 followingIds, we need to make additional queries
    if (followingIds.length > 10) {
      for (let i = 10; i < followingIds.length; i += 10) {
        const batch = followingIds.slice(i, i + 10);
        
        let batchQuery = query(
          collection(db, "events"),
          where("organizerId", "in", batch),
          where("published", "==", true),
          orderBy("date", "desc")
        );
        
        if (lastEventDate) {
          batchQuery = query(batchQuery, startAfter(lastEventDate));
        }
        
        batchQuery = query(batchQuery, limit(pageSize));
        
        const batchSnap = await getDocs(batchQuery);
        batchSnap.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() } as Event);
        });
      }
      
      // Sort combined results by date
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      // Limit to pageSize
      return events.slice(0, pageSize);
    }
    
    return events;
  } catch (error) {
    console.error("Error fetching user events feed:", error);
    throw error;
  }
};

// Get popular users (most followers)
export const getPopularUsers = async (limitCount: number = 10): Promise<UserData[]> => {
  try {
    const q = query(
      collection(db, "users"),
      orderBy("followerCount", "desc"),
      limit(limitCount)
    );
    
    const usersSnap = await getDocs(q);
    const users: UserData[] = [];
    
    usersSnap.forEach((doc) => {
      users.push({ ...doc.data() } as UserData);
    });
    
    return users;
  } catch (error) {
    console.error("Error fetching popular users:", error);
    throw error;
  }
};

// Search users by name
export const searchUsers = async (searchQuery: string, limitCount: number = 10): Promise<UserData[]> => {
  try {
    // Firebase doesn't support native text search, so we search by prefix
    const q = query(
      collection(db, "users"),
      where("displayName", ">=", searchQuery),
      where("displayName", "<=", searchQuery + '\uf8ff'),
      limit(limitCount)
    );
    
    const usersSnap = await getDocs(q);
    const users: UserData[] = [];
    
    usersSnap.forEach((doc) => {
      users.push({ ...doc.data() } as UserData);
    });
    
    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};
