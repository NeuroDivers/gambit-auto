
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Notification, SenderProfile } from "@/hooks/useHeaderNotifications";

export function useNotificationsData() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      // Fetch both regular notifications and chat message notifications
      const [notificationsResponse, chatMessagesResponse] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false }),
          
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
          .is("read_at", null)  // Only get unread messages
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      if (notificationsResponse.error) {
        console.error("Error fetching notifications:", notificationsResponse.error);
        toast({
          title: "Error",
          description: "Failed to fetch notifications",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (chatMessagesResponse.error) {
        console.error("Error fetching chat messages:", chatMessagesResponse.error);
        setIsLoading(false);
        return;
      }

      // Transform chat messages to the correct type structure with proper typing
      const typedChatMessages = (chatMessagesResponse.data || []).map(msg => {
        // Convert to unknown first to satisfy TypeScript
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
        };
      });

      // Format chat messages as notifications
      const chatNotifications = typedChatMessages.map(msg => ({
        id: msg.id,
        title: "New Message",
        message: `${msg.profiles.first_name || msg.profiles.email || 'Someone'}: ${msg.message}`,
        created_at: msg.created_at,
        read: false,  // These are unread because we filtered by read_at IS NULL
        type: 'chat_message',
        sender_id: msg.sender_id
      }));

      // Combine regular notifications with chat notifications
      const allNotifications = [
        ...(notificationsResponse.data || []),
        ...chatNotifications
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications);
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notification: Notification) => {
    try {
      if (notification.type === 'chat_message') {
        // Mark chat message as read
        const { error } = await supabase
          .from("chat_messages")
          .update({ read: true })
          .eq("id", notification.id);

        if (error) {
          console.error("Error marking chat message as read:", error);
          toast({
            title: "Error",
            description: "Failed to mark message as read",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Mark regular notification as read
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", notification.id);

        if (error) {
          console.error("Error marking notification as read:", error);
          toast({
            title: "Error",
            description: "Failed to mark notification as read",
            variant: "destructive",
          });
          return;
        }
      }

      // Update the UI immediately without waiting for subscription
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error in markAsRead:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification);
    
    // Navigate to chat if it's a chat message
    if (notification.type === 'chat_message' && notification.sender_id) {
      window.location.href = `/chat?user=${notification.sender_id}`;
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscriptions for both notifications and chat messages
    const notificationsChannel = supabase
      .channel("notifications-page")
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
      .channel("chat-notifications-page")
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
    notifications,
    isLoading,
    handleNotificationClick
  };
}
