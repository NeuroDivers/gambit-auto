import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { ClientCard } from "./ClientCard"
import { Client } from "./types"
import { useState } from "react"
import { Input } from "../ui/input"
import { CreateClientDialog } from "./CreateClientDialog"

export function ClientList() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      return data as Client[]
    }
  })

  const filteredClients = clients?.filter(client => {
    const searchTerm = searchQuery.toLowerCase()
    return (
      client.email.toLowerCase().includes(searchTerm) ||
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm)
    )
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <CreateClientDialog />
      </div>
      
      <div className="grid gap-4">
        {filteredClients?.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
        {filteredClients?.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">
            No clients found matching your search.
          </p>
        )}
      </div>
    </div>
  )
}