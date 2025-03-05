
import { useEffect, useState } from "react";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSubscription } from "@/hooks/useNotificationSubscription";

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Add notification subscription
  useNotificationSubscription();

  const fetchNotifications = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
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

    // Format chat messages as notifications
    const chatNotifications = (chatMessagesResponse.data || []).map(msg => ({
      id: msg.id,
      title: "New Message",
      message: `${msg.profiles?.first_name || msg.profiles?.email || 'Someone'}: ${msg.message}`,
      created_at: msg.created_at,
      read: msg.read,
      type: 'chat_message',
      sender_id: msg.sender_id
    }));

    // Combine regular notifications with chat notifications
    const allNotifications = [
      ...(notificationsResponse.data || []),
      ...chatNotifications
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setNotifications(allNotifications);
    setIsLoading(false);
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
  }, [toast]);

  const markAsRead = async (notification: any) => {
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

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification);
    
    // Navigate to chat if it's a chat message
    if (notification.type === 'chat_message' && notification.sender_id) {
      window.location.href = `/chat?user=${notification.sender_id}`;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading notifications...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <PageBreadcrumbs />
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 ${!notification.read ? 'bg-primary/5 border-primary/30' : 'bg-card'} border rounded-lg hover:border-primary transition-colors cursor-pointer`}
            onClick={() => handleNotificationClick(notification)}
          >
            <h3 className="font-medium">{notification.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
            <span className="text-xs text-muted-foreground mt-2 block">
              {new Date(notification.created_at).toLocaleString()}
            </span>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No notifications to display
          </p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
