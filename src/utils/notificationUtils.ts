
import { supabase } from "@/integrations/supabase/client";
import { Notification, SenderProfile } from "@/hooks/useHeaderNotifications";
import { toast } from "sonner";

// Fetch regular notifications from the database
export const fetchRegularNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }

  return data || [];
};

// Fetch chat messages that can be displayed as notifications
export const fetchChatNotifications = async (userId: string) => {
  const { data, error } = await supabase
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
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }

  return data || [];
};

// Transform chat messages into notification format
export const transformChatToNotifications = (chatMessages: any[]): Notification[] => {
  return chatMessages.map(msg => {
    // Convert to unknown first to satisfy TypeScript
    const profileData = typeof msg.profiles === 'object' ? msg.profiles as unknown as SenderProfile : null;
    
    return {
      id: msg.id,
      title: "New Message",
      message: `${profileData?.first_name || profileData?.email || 'Someone'}: ${msg.message}`,
      created_at: msg.created_at,
      read: false,
      type: 'chat_message',
      sender_id: msg.sender_id
    };
  });
};

// Mark a notification as read in the database
export const markNotificationAsRead = async (notification: Notification) => {
  try {
    if (notification.type === 'chat_message') {
      // Mark chat message as read
      const { error } = await supabase
        .from("chat_messages")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("id", notification.id);

      if (error) {
        console.error("Error marking chat message as read:", error);
        toast.error("Failed to mark message as read");
        return false;
      }
    } else {
      // Mark regular notification as read
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);

      if (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Failed to mark notification as read");
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    return false;
  }
};

// Set up realtime subscriptions for notifications and chat messages
export const setupNotificationSubscriptions = (onUpdate: () => void) => {
  console.log("Setting up notification page subscriptions");
  
  // Create unique channel names with timestamp to avoid conflicts
  const timestamp = new Date().getTime();
  
  const notificationsChannel = supabase
    .channel(`notifications-page-${timestamp}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        console.log("Notification page change detected:", payload);
        onUpdate();
      }
    )
    .subscribe((status) => {
      console.log("Notification page subscription status:", status);
    });

  const chatChannel = supabase
    .channel(`chat-notifications-page-${timestamp}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_messages",
      },
      (payload) => {
        console.log("Chat message page change detected:", payload);
        onUpdate();
      }
    )
    .subscribe((status) => {
      console.log("Chat notification page subscription status:", status);
    });

  return () => {
    console.log("Cleaning up notification page subscriptions");
    supabase.removeChannel(notificationsChannel);
    supabase.removeChannel(chatChannel);
  };
};
