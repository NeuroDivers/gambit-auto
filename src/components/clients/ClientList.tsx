
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
        .from('clients')
        .select(`
          *,
          total_spent:invoices(sum(total)),
          total_invoices:invoices(count(*)),
          total_work_orders:work_orders(count(*)),
          last_invoice_date:invoices(max(created_at)),
          last_work_order_date:work_orders(max(created_at))
        `)

      // Apply search if present
      if (debouncedSearch) {
        query = query.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`)
      }

      // Apply sorting
      switch (sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false })
          break
        case 'name':
          query = query.order('first_name', { ascending: true })
          break
        case 'activity':
          // Since we can't sort by a computed column directly,
          // we'll sort by updated_at as a fallback
          query = query.order('updated_at', { ascending: false })
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
        // Extract aggregated values from the nested objects
        total_work_orders: client.total_work_orders?.[0]?.count || 0,
        total_invoices: client.total_invoices?.[0]?.count || 0,
        total_spent: client.total_spent?.[0]?.sum || 0,
        last_invoice_date: client.last_invoice_date?.[0]?.max || null,
        last_work_order_date: client.last_work_order_date?.[0]?.max || null
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
