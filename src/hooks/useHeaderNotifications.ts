
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import {
  fetchHeaderNotifications,
  fetchHeaderChatMessages,
  transformChatMessagesToNotifications,
  markNotificationAsRead,
  setupHeaderNotificationSubscriptions
} from "@/utils/headerNotificationUtils";

// Define interfaces for our data types
export interface SenderProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  read: boolean;
  profiles: SenderProfile;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type?: string;
  read: boolean;
  sender_id?: string;
}

export function useHeaderNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch both notifications and chat messages in parallel
      const [notificationsResponse, chatMessagesResponse] = await Promise.all([
        fetchHeaderNotifications(user.id),
        fetchHeaderChatMessages(user.id)
      ]);

      // Process regular notifications
      const regularNotifications = (notificationsResponse.data || []) as Notification[];
      
      // Process chat messages
      const chatNotifications = transformChatMessagesToNotifications(chatMessagesResponse.data || []);

      // Combine and sort all notifications by date
      const allNotifications = [...regularNotifications, ...chatNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
      
      // Get total counts for both types
      const { count: totalNotificationCount } = await supabase
        .from("notifications")
        .select("*", { count: 'exact', head: true })
        .eq("profile_id", user.id)
        .eq("read", false);
      
      const { count: totalChatCount } = await supabase
        .from("chat_messages")
        .select("*", { count: 'exact', head: true })
        .eq("recipient_id", user.id)
        .eq("read", false);
      
      setTotalUnreadCount((totalNotificationCount || 0) + (totalChatCount || 0));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification);
    
    if (notification.type === 'chat_message' && notification.sender_id) {
      window.location.href = `/chat?user=${notification.sender_id}`;
    }
  };

  const markAsRead = async (notification: Notification) => {
    try {
      const { error } = await markNotificationAsRead(notification);
      
      if (error) throw error;

      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      setTotalUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up subscriptions for real-time updates
    const cleanup = setupHeaderNotificationSubscriptions(fetchNotifications);
    
    return cleanup;
  }, []);

  return {
    unreadCount,
    totalUnreadCount,
    notifications,
    isLoading,
    handleNotificationClick,
    markAsRead
  };
}
