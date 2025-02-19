
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { FileText, Quote, Search } from "lucide-react"
import { CreateClientDialog } from "./CreateClientDialog"
import { EditClientDialog } from "./EditClientDialog"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ClientCard } from "./ClientCard"
import { Client } from "./types"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce"

export function ClientList() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("recent")
  const debouncedSearch = useDebounce(searchQuery, 300)
  const navigate = useNavigate()

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', debouncedSearch, sortBy],
    queryFn: async () => {
      console.log("Fetching clients...")
      let query = supabase
        .from('client_statistics')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone_number,
          address,
          created_at,
          updated_at,
          last_invoice_date,
          last_work_order_date,
          total_spent,
          total_invoices,
          total_work_orders
        `)

      // Apply search if present
      if (debouncedSearch) {
        query = query.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`)
      }

      // Apply sorting
      switch (sortBy) {
        case 'recent':
          query = query.order('last_invoice_date', { ascending: false, nullsFirst: false })
          break
        case 'name':
          query = query.order('first_name', { ascending: true })
          break
        case 'activity':
          query = query.order('last_work_order_date', { ascending: false, nullsFirst: false })
          break
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error("Error fetching clients:", error)
        throw error
      }

      console.log("Fetched clients:", data)

      return data.map(client => ({
        ...client,
        total_work_orders: client.total_work_orders || 0,
        total_invoices: client.total_invoices || 0,
        total_spent: client.total_spent || 0,
        updated_at: client.updated_at || client.created_at // Ensure updated_at is always present
      })) as Client[]
    }
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setEditDialogOpen(true)
  }

  const handleCreateQuote = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId)
    if (client) {
      navigate('/quotes/create', { 
        state: { 
          preselectedClient: client 
        }
      })
    }
  }

  const handleCreateInvoice = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId)
    if (client) {
      navigate('/invoices/create', { 
        state: { 
          preselectedClient: client 
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={setSortBy}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="activity">Recent Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients?.map((client) => (
          <ClientCard 
            key={client.id}
            client={client}
            onEdit={() => handleEdit(client)}
          />
        ))}
      </div>

      <CreateClientDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedClient && (
        <EditClientDialog
          client={selectedClient}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  )
}
