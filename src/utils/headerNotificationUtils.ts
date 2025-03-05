
import { supabase } from "@/integrations/supabase/client";
import { Notification, SenderProfile, ChatMessage } from "@/hooks/useHeaderNotifications";
import { toast } from "sonner";

/**
 * Fetches a limited number of latest notifications for the header display
 */
export const fetchHeaderNotifications = async (userId: string) => {
  return supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", userId)
    .order('created_at', { ascending: false })
    .limit(5);
};

/**
 * Fetches unread chat messages for the header display
 */
export const fetchHeaderChatMessages = async (userId: string) => {
  return supabase
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
    .eq("recipient_id", userId)
    .eq("read", false)
    .order('created_at', { ascending: false });
};

/**
 * Transforms chat messages to notification format for display
 */
export const transformChatMessagesToNotifications = (chatMessages: any[]): Notification[] => {
  return chatMessages.map(msg => {
    // The profiles property is an object, not an array
    const profileData = typeof msg.profiles === 'object' ? msg.profiles as unknown as SenderProfile : null;
    
    return {
      id: msg.id,
      title: "New Message",
      message: `${profileData?.first_name || profileData?.email || 'Someone'}: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`,
      created_at: msg.created_at,
      type: 'chat_message',
      read: false,
      sender_id: msg.sender_id
    };
  });
};

/**
 * Marks a notification as read in the appropriate table
 */
export const markNotificationAsRead = async (notification: Notification) => {
  try {
    if (notification.type === 'chat_message') {
      return await supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("id", notification.id);
    } else {
      return await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);
    }
  } catch (error) {
    console.error("Error marking as read:", error);
    throw error;
  }
};

/**
 * Sets up realtime subscriptions for notifications
 */
export const setupHeaderNotificationSubscriptions = (onUpdate: () => void) => {
  const notificationsChannel = supabase
    .channel("notifications-header")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        // Show toast for new notifications
        if (payload.eventType === 'INSERT') {
          toast(payload.new.title, {
            description: payload.new.message,
          });
        }
        onUpdate();
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
      (payload) => {
        // We don't show toast here since it's handled by useNotificationSubscription
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(notificationsChannel);
    supabase.removeChannel(chatChannel);
  };
};
