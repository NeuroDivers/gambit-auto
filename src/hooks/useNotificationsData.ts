
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/hooks/useHeaderNotifications";
import { 
  fetchRegularNotifications, 
  fetchChatNotifications, 
  transformChatToNotifications,
  markNotificationAsRead,
  setupNotificationSubscriptions 
} from "@/utils/notificationUtils";

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
      const [regularNotifications, chatMessages] = await Promise.all([
        fetchRegularNotifications(user.id),
        fetchChatNotifications(user.id)
      ]);

      // Transform chat messages into notification format
      const chatNotifications = transformChatToNotifications(chatMessages);

      // Combine and sort all notifications by date
      const allNotifications = [
        ...regularNotifications,
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

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification)
      .then(success => {
        if (success) {
          // Update the UI immediately without waiting for subscription
          setNotifications(prevNotifications => 
            prevNotifications.map(n => 
              n.id === notification.id ? { ...n, read: true } : n
            )
          );
        }
      });
    
    // Navigate to chat if it's a chat message
    if (notification.type === 'chat_message' && notification.sender_id) {
      window.location.href = `/chat?user=${notification.sender_id}`;
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscriptions for both notifications and chat messages
    const cleanupSubscriptions = setupNotificationSubscriptions(fetchNotifications);

    return cleanupSubscriptions;
  }, []);

  return {
    notifications,
    isLoading,
    handleNotificationClick
  };
}
