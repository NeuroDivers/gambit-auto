
import { useState, useEffect, useRef } from "react"
import { ChatUser } from "@/types/chat"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const channelRef = useRef<any>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ["chat-users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // First get all profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role:role_id(name, nicename), avatar_url")
        .order("role_id")
      
      if (error) throw error

      // Get unread message counts for each user
      const unreadCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from("chat_messages")
            .select("*", { count: 'exact', head: true })
            .eq("recipient_id", user?.id)
            .eq("sender_id", profile.id)
            .eq("read", false)

          return {
            userId: profile.id,
            count: count || 0
          }
        })
      )

      // Combine profiles with unread counts
      const usersWithCounts = (profiles || []).map(profile => ({
        ...profile,
        role: Array.isArray(profile.role) ? profile.role[0] : profile.role,
        unreadCount: unreadCounts.find(c => c.userId === profile.id)?.count || 0
      })) as (ChatUser & { unreadCount: number })[]

      return usersWithCounts
    },
  })

  // Set up real-time subscription for new messages
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Clean up previous subscription if it exists
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      // Subscribe to new messages
      channelRef.current = supabase
        .channel('chat_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `recipient_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('New message received, updating counts:', payload)
            // Invalidate the query to trigger a refresh of the user list with new counts
            queryClient.invalidateQueries({ queryKey: ["chat-users"] })
          }
        )
        .subscribe((status) => {
          console.log("Chat updates subscription status:", status)
        })

      // Also subscribe to message read status changes
      channelRef.current = supabase
        .channel('read_status_updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
            filter: `recipient_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('Message read status updated:', payload)
            // Invalidate the query to trigger a refresh
            queryClient.invalidateQueries({ queryKey: ["chat-users"] })
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up chat updates subscription")
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [queryClient])

  if (isLoading) {
    return <div>Loading...</div>
  }

  // Group users by role
  const groupedUsers = users?.reduce((acc, user) => {
    const roleName = user.role?.nicename || "Other"
    if (!acc[roleName]) {
      acc[roleName] = []
    }
    acc[roleName].push(user)
    return acc
  }, {} as Record<string, typeof users>)

  const getUserDisplayName = (user: ChatUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.email || "Unknown User"
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-6">
      <Card className="w-64">
        <CardContent className="p-4">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-6">
              {groupedUsers && Object.entries(groupedUsers).map(([role, users]) => (
                <div key={role} className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">{role}</h3>
                  {users?.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user.id)}
                      className={`w-full text-left p-2 rounded-lg transition-colors text-gray-700 flex items-center justify-between ${
                        selectedUser === user.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-primary hover:text-primary-foreground"
                      }`}
                    >
                      <span>{getUserDisplayName(user)}</span>
                      {(user as any).unreadCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className={`${
                            selectedUser === user.id 
                              ? "bg-primary-foreground text-primary" 
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {(user as any).unreadCount}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="flex-1">
        {selectedUser ? (
          <ChatWindow recipientId={selectedUser} />
        ) : (
          <Card className="h-full flex items-center justify-center text-muted-foreground">
            Select a user to start chatting
          </Card>
        )}
      </div>
    </div>
  )
}
