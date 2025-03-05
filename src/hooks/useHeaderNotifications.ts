
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

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

      const [notificationsResponse, chatMessagesResponse] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .eq("profile_id", user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        
        supabase
          .from("chat_messages")
          .select(`
            id,
            message,
            created_at,
            sender_id,
            read,
            profiles:sender_id (
              first_name,
              last_name,
              email
            )
          `)
          .eq("recipient_id", user.id)
          .eq("read", false)
          .order('created_at', { ascending: false })
      ]);

      const notifications = (notificationsResponse.data || []) as Notification[];
      
      // Process chat messages with correct typing for profiles
      const typedChatMessages = (chatMessagesResponse.data || []).map(msg => {
        // The profiles property is an object, not an array
        // Only extract if it's not null or undefined
        const profileData = typeof msg.profiles === 'object' ? msg.profiles as unknown as SenderProfile : null;
        
        return {
          id: msg.id,
          message: msg.message,
          created_at: msg.created_at,
          sender_id: msg.sender_id,
          read: msg.read,
          profiles: {
            first_name: profileData?.first_name || null,
            last_name: profileData?.last_name || null,
            email: profileData?.email || null
          }
        } as ChatMessage;
      });

      const chatNotifications: Notification[] = typedChatMessages.map(msg => ({
        id: msg.id,
        title: "New Message",
        message: `${msg.profiles.first_name || msg.profiles.email || 'Someone'}: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`,
        created_at: msg.created_at,
        type: 'chat_message',
        read: false,
        sender_id: msg.sender_id
      }));

      const allNotifications = [...notifications, ...chatNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setIsLoading(false);
    }
  };

  const markAsRead = async (notification: Notification) => {
    try {
      if (notification.type === 'chat_message') {
        const { error } = await supabase
          .from("chat_messages")
          .update({ read: true })
          .eq("id", notification.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", notification.id);

        if (error) throw error;
      }

      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification);
    
    if (notification.type === 'chat_message' && notification.sender_id) {
      window.location.href = `/chat?user=${notification.sender_id}`;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const notificationsChannel = supabase
      .channel("notifications-header")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    const chatChannel = supabase
      .channel("chat-messages-header")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(chatChannel);
    };
  }, []);

  return {
    unreadCount,
    notifications,
    isLoading,
    handleNotificationClick,
    markAsRead
  };
}
