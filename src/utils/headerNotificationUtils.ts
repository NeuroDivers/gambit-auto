
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
  console.log("Setting up header notification subscriptions");
  
  // Create a unique channel name to avoid conflicts
  const timestamp = new Date().getTime();
  
  const notificationsChannel = supabase
    .channel(`notifications-header-${timestamp}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        console.log("Header notification change detected:", payload);
        
        // Show toast for new notifications
        if (payload.eventType === 'INSERT') {
          console.log("Showing toast for new notification:", payload.new);
          toast(payload.new.title, {
            description: payload.new.message,
            duration: 5000,
          });
        }
        onUpdate();
      }
    )
    .subscribe((status) => {
      console.log("Header notifications subscription status:", status);
    });

  const chatChannel = supabase
    .channel(`chat-messages-header-${timestamp}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_messages",
      },
      (payload) => {
        console.log("Chat message change detected in header:", payload);
        // We don't show toast here since it's handled by useNotificationSubscription
        onUpdate();
      }
    )
    .subscribe((status) => {
      console.log("Header chat messages subscription status:", status);
    });

  return () => {
    console.log("Cleaning up header notification subscriptions");
    supabase.removeChannel(notificationsChannel);
    supabase.removeChannel(chatChannel);
  };
};
