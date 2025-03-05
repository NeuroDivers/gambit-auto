
import { Notification } from "@/hooks/useHeaderNotifications";

interface NotificationCardProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  return (
    <div
      className={`p-4 ${!notification.read ? 'bg-primary/5 border-primary/30' : 'bg-card'} border rounded-lg hover:border-primary transition-colors cursor-pointer`}
      onClick={() => onClick(notification)}
    >
      <h3 className="font-medium">{notification.title}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {notification.message}
      </p>
      <span className="text-xs text-muted-foreground mt-2 block">
        {new Date(notification.created_at).toLocaleString()}
      </span>
    </div>
  );
}
