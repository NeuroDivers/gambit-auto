
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText } from "lucide-react"
import { CreateClientDialog } from "./CreateClientDialog"
import { EditClientDialog } from "./EditClientDialog"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ClientCard } from "./ClientCard"

export function ClientList() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const navigate = useNavigate()

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleEdit = (clientId: string) => {
    setSelectedClientId(clientId)
    setEditDialogOpen(true)
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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients?.map((client) => (
          <ClientCard 
            key={client.id}
            client={client}
            onEdit={() => handleEdit(client.id)}
            actions={
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleCreateInvoice(client.id)}
              >
                <FileText className="h-4 w-4" />
                Create Invoice
              </Button>
            }
          />
        ))}
      </div>

      <CreateClientDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />

      <EditClientDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        clientId={selectedClientId}
      />
    </div>
  )
}
