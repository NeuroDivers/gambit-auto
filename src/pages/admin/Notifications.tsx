
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

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description: "Failed to fetch notifications",
          variant: "destructive",
        });
        return;
      }

      setNotifications(data || []);
      setIsLoading(false);
    };

    fetchNotifications();

    const channel = supabase
      .channel("notifications-list")
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
      return;
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
            className="p-4 bg-card border rounded-lg hover:border-primary transition-colors cursor-pointer"
            onClick={() => markAsRead(notification.id)}
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
