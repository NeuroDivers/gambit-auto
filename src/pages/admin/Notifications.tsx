
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs";
import { useNotificationSubscription } from "@/hooks/useNotificationSubscription";
import { useNotificationsData } from "@/hooks/useNotificationsData";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { EmptyNotifications } from "@/components/notifications/EmptyNotifications";
import { LoadingState } from "@/components/notifications/LoadingState";

const Notifications = () => {
  const { notifications, isLoading, handleNotificationClick } = useNotificationsData();
  
  // Add notification subscription
  useNotificationSubscription();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto p-6">
      <PageBreadcrumbs />
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onClick={handleNotificationClick}
          />
        ))}
        {notifications.length === 0 && <EmptyNotifications />}
      </div>
    </div>
  );
};

export default Notifications;
