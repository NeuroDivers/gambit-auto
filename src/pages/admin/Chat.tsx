
import { useState, useEffect } from "react"
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
        .select("id, first_name, last_name, avatar_url")
      
      if (error) throw error
      return profiles as ChatUser[]
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-6">
      <Card className="w-64">
        <CardContent className="p-4">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-2">
              {users?.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  className={`w-full text-left p-2 rounded-lg hover:bg-accent ${
                    selectedUser === user.id ? "bg-accent" : ""
                  }`}
                >
                  {user.first_name} {user.last_name}
                </button>
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
