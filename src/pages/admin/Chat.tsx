import { useState, useEffect, useRef } from "react"
import { ChatUser } from "@/types/chat"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Circle, CircleCheck, User, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ChatUserFilter } from "@/components/chat/ChatUserFilter"

type UserFilterOption = "all" | "staff" | "clients";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState<UserFilterOption>("all")
  const queryClient = useQueryClient()
  const messageChannelRef = useRef<any>(null)
  const readStatusChannelRef = useRef<any>(null)

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ["chat-users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      
      console.log("Fetching chat users for:", user.id)
      
      // First get all profiles except current user
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role:role_id(name, nicename), avatar_url, last_seen_at")
        .neq('id', user.id) // Exclude current user
        .order("role_id")
      
      if (error) {
        console.error("Error fetching profiles for chat:", error)
        throw error
      }
      
      console.log("Fetched profiles for chat:", profiles?.length || 0)

      // Get unread message counts for each user
      const unreadCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from("chat_messages")
            .select("*", { count: 'exact', head: true })
            .eq("recipient_id", user.id)
            .eq("sender_id", profile.id)
            .is("read_at", null)

          return {
            userId: profile.id,
            count: count || 0
          }
        })
      )

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
      })) as (ChatUser & { unread_count: number, is_online: boolean })[]

      return usersWithCounts
    },
  })

  // Update current user's last_seen_at periodically
  useEffect(() => {
    const updateLastSeen = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update the user's last_seen_at timestamp
      await supabase.from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    // Update last_seen_at when the component mounts
    updateLastSeen()

    // Set up a timer to update last_seen_at every minute
    const interval = setInterval(updateLastSeen, 60000)

    return () => clearInterval(interval)
  }, [])

  // Log error if any
  useEffect(() => {
    if (isError && error) {
      console.error("Error fetching chat users:", error)
      toast.error("Couldn't load chat users", {
        description: "Please try refreshing the page"
      })
    }
  }, [isError, error])

  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Clean up previous subscriptions if they exist
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current)
      }
      if (readStatusChannelRef.current) {
        supabase.removeChannel(readStatusChannelRef.current)
      }

      // Create a channel for message updates
      const messageChannel = supabase.channel('chat-message-updates')
      
      messageChannel.on('broadcast', { event: 'new-chat-message' }, () => {
        console.log('New message received, refreshing chat users')
        queryClient.invalidateQueries({ queryKey: ["chat-users"] })
      }).subscribe()
      
      messageChannelRef.current = messageChannel

      // Create a channel for read status updates
      const readStatusChannel = supabase.channel('chat-read-status-updates')
      
      readStatusChannel.on('broadcast', { event: 'chat-read-status' }, () => {
        console.log('Message read status updated, refreshing chat users')
        queryClient.invalidateQueries({ queryKey: ["chat-users"] })
      }).subscribe()
      
      readStatusChannelRef.current = readStatusChannel

      return () => {
        if (messageChannelRef.current) {
          supabase.removeChannel(messageChannelRef.current)
        }
        if (readStatusChannelRef.current) {
          supabase.removeChannel(readStatusChannelRef.current)
        }
      }
    }

    setupSubscription()

    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current)
      }
      if (readStatusChannelRef.current) {
        supabase.removeChannel(readStatusChannelRef.current)
      }
    }
  }, [queryClient])

  const getUserDisplayName = (user: ChatUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.email || "Unknown User"
  }

  // Filter users by search term and user type
  const getFilteredUsers = () => {
    if (!users) return { unreadUsers: [], otherUsers: [] };
    
    // First filter by search term
    const searchFiltered = users.filter(user => {
      const displayName = getUserDisplayName(user).toLowerCase();
      const email = (user.email || "").toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return displayName.includes(searchLower) || email.includes(searchLower);
    });
    
    // Then apply role filter
    const roleFiltered = searchFiltered.filter(user => {
      if (userFilter === "all") return true;
      
      const isClient = user.role?.name === "client" || 
                      user.role?.nicename?.toLowerCase() === "client";
      
      return userFilter === "clients" ? isClient : !isClient;
    });
    
    // Separate users with unread messages
    const unreadUsers = roleFiltered.filter(user => user.unread_count > 0) || [];
    const otherUsers = roleFiltered.filter(user => !user.unread_count) || [];
    
    return { unreadUsers, otherUsers };
  }

  const { unreadUsers, otherUsers } = getFilteredUsers();

  // Then group remaining users by role
  const groupedUsers = otherUsers.reduce((acc, user) => {
    const roleName = user.role?.nicename || "Other";
    if (!acc[roleName]) {
      acc[roleName] = [];
    }
    acc[roleName].push(user);
    return acc;
  }, {} as Record<string, typeof users>);

  const handleRefreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["chat-users"] })
    toast.success("Refreshing user list...")
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      <Card className="w-72 flex flex-col">
        <div className="p-3 border-b space-y-2">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <ChatUserFilter 
            currentFilter={userFilter}
            onFilterChange={setUserFilter}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleRefreshUsers}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh Users"}
          </Button>
        </div>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full py-2">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Unread Messages Section */}
                {unreadUsers.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <div className="px-3 pb-1">
                      <h3 className="text-sm font-semibold text-destructive">Unread Messages</h3>
                    </div>
                    {unreadUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user.id)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                          selectedUser === user.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{getUserDisplayName(user).substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {user.is_online && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="truncate font-medium">{getUserDisplayName(user)}</p>
                            <Badge 
                              variant="destructive" 
                              className="ml-2 text-xs"
                            >
                              {user.unread_count}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.role?.nicename || "User"}
                          </p>
                        </div>
                      </button>
                    ))}
                    <Separator className="my-2" />
                  </div>
                )}

                {/* Other Users Grouped by Role */}
                {Object.entries(groupedUsers).map(([role, users]) => (
                  <div key={role} className="space-y-1 pt-2">
                    <div className="px-3 pb-1">
                      <h3 className="text-sm font-semibold text-muted-foreground">{role}</h3>
                    </div>
                    {users?.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user.id)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                          selectedUser === user.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>{getUserDisplayName(user).substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {user.is_online && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-background"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{getUserDisplayName(user)}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.role?.nicename || "User"}
                          </p>
                        </div>
                      </button>
                    ))}
                    {users && users.length > 0 && <Separator className="my-2" />}
                  </div>
                ))}

                {unreadUsers.length === 0 && Object.keys(groupedUsers).length === 0 && (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <AlertCircle className="h-10 w-10 mb-2 text-muted-foreground" />
                    <h3 className="font-medium">
                      {isError ? "Failed to load users" : "No users found"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm 
                        ? "Try a different search term" 
                        : isError 
                          ? "There was an error loading the user list"
                          : userFilter !== "all"
                            ? `No ${userFilter === "clients" ? "clients" : "staff members"} found`
                            : users && users.length === 0 
                              ? "No other users exist yet in the system" 
                              : "Try refreshing the user list"}
                    </p>
                    {(isError || users?.length === 0) && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshUsers}
                        className="mt-4"
                      >
                        Refresh Users
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="flex-1 h-[calc(100vh-5rem)]">
        {selectedUser ? (
          <ChatWindow recipientId={selectedUser} />
        ) : (
          <Card className="h-full flex items-center justify-center text-center">
            <div className="max-w-md p-6">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Select a conversation</h2>
              <p className="text-muted-foreground mt-2">
                Choose a person from the sidebar to start or continue a conversation
              </p>
              {users?.length === 0 && !isLoading && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium mb-1">No users available</p>
                  <p>There are no other users in the system yet. Once other users sign up, they will appear here.</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
