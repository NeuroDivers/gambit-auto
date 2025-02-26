
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [accountFilter, setAccountFilter] = useState<string>("all")
  const debouncedSearch = useDebounce(searchQuery, 300)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', debouncedSearch, sortBy, accountFilter],
    queryFn: async () => {
      console.log("Fetching clients with search:", debouncedSearch, "sort:", sortBy, "account filter:", accountFilter)
      let query = supabase
        .from('clients')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone_number,
          address,
          created_at,
          updated_at,
          user_id,
          invoices (
            total,
            created_at
          ),
          work_orders!work_orders_client_id_fkey (
            created_at
          )
        `)

      // Apply search if present
      if (debouncedSearch) {
        query = query.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`)
      }

      // Apply account filter
      if (accountFilter === 'has_account') {
        query = query.not('user_id', 'is', null)
      } else if (accountFilter === 'no_account') {
        query = query.is('user_id', null)
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
          query = query.order('updated_at', { ascending: false })
          break
      }
      
      const { data: clientData, error } = await query
      
      if (error) {
        console.error("Error fetching clients:", error)
        throw error
      }

      console.log("Raw client data from database:", clientData)

      // Transform the data to include the calculated fields
      const transformedData = (clientData || []).map(client => {
        const invoices = client.invoices || []
        const workOrders = client.work_orders || []
        
        const transformed = {
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email,
          phone_number: client.phone_number,
          address: client.address,
          created_at: client.created_at,
          updated_at: client.updated_at,
          user_id: client.user_id,
          total_work_orders: workOrders.length,
          total_invoices: invoices.length,
          total_spent: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
          last_invoice_date: invoices.length > 0 
            ? Math.max(...invoices.map(inv => new Date(inv.created_at).getTime()))
            : null,
          last_work_order_date: workOrders.length > 0
            ? Math.max(...workOrders.map(wo => new Date(wo.created_at).getTime()))
            : null
        } as Client

        console.log("Transformed client data:", transformed)
        return transformed
      })

      return transformedData
    }
  })

  const deleteClient = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success("Client deleted successfully")
      setDeleteDialogOpen(false)
      setSelectedClient(null)
    },
    onError: (error) => {
      console.error('Error deleting client:', error)
      toast.error("Failed to delete client")
    }
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setEditDialogOpen(true)
  }

  const handleDelete = (client: Client) => {
    setSelectedClient(client)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedClient) {
      deleteClient.mutate(selectedClient.id)
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
        <Select
          value={accountFilter}
          onValueChange={setAccountFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Account status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="has_account">Has Account</SelectItem>
            <SelectItem value="no_account">No Account</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients?.map((client) => (
          <ClientCard 
            key={client.id}
            client={client}
            onEdit={() => handleEdit(client)}
            onDelete={() => handleDelete(client)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedClient?.first_name} {selectedClient?.last_name} and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
