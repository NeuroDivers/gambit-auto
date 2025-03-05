
import React from "react";
import { NavLink } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification, useHeaderNotifications } from "@/hooks/useHeaderNotifications";

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { unreadCount, totalUnreadCount, notifications, handleNotificationClick } = useHeaderNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white">
              {totalUnreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification) => (
          <DropdownMenuItem 
            key={notification.id} 
            className="flex flex-col items-start py-3 group cursor-pointer"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="font-medium group-hover:text-white">{notification.title}</div>
            <div className="text-sm text-muted-foreground group-hover:text-white">{notification.message}</div>
            <div className="text-xs text-muted-foreground group-hover:text-white mt-1">
              {new Date(notification.created_at).toLocaleString()}
            </div>
          </DropdownMenuItem>
        ))}
        {notifications.length === 0 && (
          <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center justify-center">
          <NavLink to="/notifications" className="w-full text-center">View all notifications</NavLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
