
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useChatUserList() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const messageChannelRef = useRef<any>(null);
  const readStatusChannelRef = useRef<any>(null);

  const { 
    data: users, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["chat-users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      console.log("Fetching chat users for:", user.id);
      
      // First get all profiles except current user
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role:role_id(name, nicename), avatar_url, last_seen_at")
        .neq('id', user.id) // Exclude current user
        .order("role_id");
      
      if (error) {
        console.error("Error fetching profiles for chat:", error);
        throw error;
      }
      
      console.log("Fetched profiles for chat:", profiles?.length || 0);

      // Get unread message counts for each user
      const unreadCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from("chat_messages")
            .select("*", { count: 'exact', head: true })
            .eq("recipient_id", user.id)
            .eq("sender_id", profile.id)
            .is("read_at", null);

          return {
            userId: profile.id,
            count: count || 0
          };
        })
      );

      // Function to determine if a user is online based on last_seen_at
      const isUserOnline = (lastSeenAt: string | null): boolean => {
        if (!lastSeenAt) return false;
        
        // Consider users online if they've been active in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return new Date(lastSeenAt) > fiveMinutesAgo;
      };

      // Combine profiles with unread counts and set online status based on last_seen_at
      const usersWithCounts = (profiles || []).map(profile => ({
        ...profile,
        role: Array.isArray(profile.role) ? profile.role[0] : profile.role,
        unread_count: unreadCounts.find(c => c.userId === profile.id)?.count || 0,
        is_online: isUserOnline(profile.last_seen_at)
      }));

      return usersWithCounts;
    },
  });

  // Update current user's last_seen_at periodically
  useEffect(() => {
    const updateLastSeen = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update the user's last_seen_at timestamp
      await supabase.from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', user.id);
    };

    // Update last_seen_at when the component mounts
    updateLastSeen();

    // Set up a timer to update last_seen_at every minute
    const interval = setInterval(updateLastSeen, 60000);

    return () => clearInterval(interval);
  }, []);

  // Log error if any
  useEffect(() => {
    if (isError && error) {
      console.error("Error fetching chat users:", error);
      toast.error("Couldn't load chat users", {
        description: "Please try refreshing the page"
      });
    }
  }, [isError, error]);

  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Clean up previous subscriptions if they exist
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
      if (readStatusChannelRef.current) {
        supabase.removeChannel(readStatusChannelRef.current);
      }

      // Create a channel for message updates
      const messageChannel = supabase.channel('chat-message-updates');
      
      messageChannel.on('broadcast', { event: 'new-chat-message' }, () => {
        console.log('New message received, refreshing chat users');
        queryClient.invalidateQueries({ queryKey: ["chat-users"] });
      }).subscribe();
      
      messageChannelRef.current = messageChannel;

      // Create a channel for read status updates
      const readStatusChannel = supabase.channel('chat-read-status-updates');
      
      readStatusChannel.on('broadcast', { event: 'chat-read-status' }, () => {
        console.log('Message read status updated, refreshing chat users');
        queryClient.invalidateQueries({ queryKey: ["chat-users"] });
      }).subscribe();
      
      readStatusChannelRef.current = readStatusChannel;

      return () => {
        if (messageChannelRef.current) {
          supabase.removeChannel(messageChannelRef.current);
        }
        if (readStatusChannelRef.current) {
          supabase.removeChannel(readStatusChannelRef.current);
        }
      };
    };

    setupSubscription();

    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
      if (readStatusChannelRef.current) {
        supabase.removeChannel(readStatusChannelRef.current);
      }
    };
  }, [queryClient]);

  const handleRefreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["chat-users"] });
    toast.success("Refreshing user list...");
  };

  return {
    users,
    isLoading,
    isError, 
    error,
    selectedUser,
    setSelectedUser,
    searchTerm,
    setSearchTerm,
    handleRefreshUsers
  };
}
