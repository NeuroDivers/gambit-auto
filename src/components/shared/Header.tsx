
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  firstName?: string | null;
  role?: {
    id: string;
    name: string;
    nicename: string;
  } | null;
  onLogout?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// Add interfaces for type safety
interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  read: boolean;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type?: string;
  read: boolean;
  sender_id?: string;
}

export function Header({ firstName, role, onLogout, className, children }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch both notifications and unread chat messages
      const [notificationsResponse, chatMessagesResponse] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .eq("profile_id", user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        
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
          .eq("read", false)
          .order('created_at', { ascending: false })
      ])

      const notifications = (notificationsResponse.data || []) as Notification[]
      
      // Fix the type casting for chat messages
      const chatMessages = (chatMessagesResponse.data || []).map(msg => ({
        ...msg,
        profiles: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles
      })) as ChatMessage[]

      // Convert chat messages to notification format
      const chatNotifications: Notification[] = chatMessages.map(msg => ({
        id: msg.id,
        title: "New Message",
        message: `${msg.profiles?.first_name || msg.profiles?.email || 'Someone'}: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`,
        created_at: msg.created_at,
        type: 'chat_message',
        read: false,
        sender_id: msg.sender_id
      }))

      // Combine and sort all notifications
      const allNotifications = [...notifications, ...chatNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setNotifications(allNotifications)
      setUnreadCount(allNotifications.filter(n => !n.read).length)
    }

    fetchNotifications()

    // Subscribe to new notifications and chat messages
    const notificationsChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    const chatChannel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(notificationsChannel)
      supabase.removeChannel(chatChannel)
    }
  }, [])

  const isAdmin = role?.name?.toLowerCase() === 'administrator';
  const initials = firstName ? firstName.charAt(0).toUpperCase() : '?';

  return (
    <header className={cn("flex h-16 items-center px-6 border-b", className)}>
      {children}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg">
          Welcome, {firstName || 'Guest'}
        </span>
        {role && (
          <Badge variant="default" className="capitalize bg-primary text-primary-foreground">
            {role.nicename}
          </Badge>
        )}
      </div>
      <nav className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white">
                  {unreadCount}
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
                className="flex flex-col items-start py-3 group"
                onClick={() => {
                  if (notification.type === 'chat_message' && notification.sender_id) {
                    // Navigate to chat with the sender
                    window.location.href = `/chat?user=${notification.sender_id}`;
                  }
                }}
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <NavLink to="/profile-settings" className="w-full">Profile Settings</NavLink>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem>
                <NavLink to="/users" className="w-full">Manage Users</NavLink>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}
