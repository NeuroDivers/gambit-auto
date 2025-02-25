
import { useEffect } from "react";
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";

const Notifications = () => {
  useEffect(() => {
    // In a real app, you would fetch notifications here
    console.log("Fetching notifications...");
  }, []);

  // Mock notifications - In a real app, these would come from your backend
  const notifications = [
    {
      id: 1,
      title: "New Work Order",
      description: "A new work order has been assigned to you",
      time: "5 minutes ago",
      isRead: false
    },
    {
      id: 2,
      title: "Quote Request",
      description: "You have a new quote request pending review",
      time: "1 hour ago",
      isRead: false
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <PageBreadcrumbs />
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="p-4 bg-card border rounded-lg hover:border-primary transition-colors cursor-pointer"
          >
            <h3 className="font-medium">{notification.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.description}
            </p>
            <span className="text-xs text-muted-foreground mt-2 block">
              {notification.time}
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
