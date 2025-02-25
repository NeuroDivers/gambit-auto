
import { useState } from "react"
import { ChatUser } from "@/types/chat"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ["chat-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, role:role_id(name, nicename), avatar_url")
        .order("role_id")
      
      if (error) throw error
      // Ensure the role field is properly structured
      return (profiles || []).map(profile => ({
        ...profile,
        role: Array.isArray(profile.role) ? profile.role[0] : profile.role
      })) as ChatUser[]
    },
  })

  // Group users by role
  const groupedUsers = users?.reduce((acc, user) => {
    const roleName = user.role?.nicename || "Other"
    if (!acc[roleName]) {
      acc[roleName] = []
    }
    acc[roleName].push(user)
    return acc
  }, {} as Record<string, typeof users>)

  if (isLoading) {
    return <div>Loading...</div>
  }

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
                      className={`w-full text-left p-2 rounded-lg transition-colors text-gray-700 ${
                        selectedUser === user.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-primary hover:text-primary-foreground"
                      }`}
                    >
                      {getUserDisplayName(user)}
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
