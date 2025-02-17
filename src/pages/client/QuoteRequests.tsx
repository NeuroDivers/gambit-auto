
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useQuoteRequestData } from "@/hooks/useQuoteRequestData"
import { useQuoteRequestActions } from "@/hooks/useQuoteRequestActions"
import { QuoteRequestList } from "@/components/client/quotes/QuoteRequestList"
import { QuoteRequestFormDialog } from "@/components/client/quotes/QuoteRequestFormDialog"
import { ClientQuoteStats } from "@/components/client/quotes/ClientQuoteStats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function QuoteRequests() {
  const navigate = useNavigate()
  const { services, quoteRequests, isLoading, queryClient } = useQuoteRequestData()
  const { handleResponseMutation } = useQuoteRequestActions()
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        toast.error("Please sign in to view your quotes")
        navigate("/auth")
      }
    }
    
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth")
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  // Set up real-time subscription for quote updates
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_requests'
        },
        (payload) => {
          // Invalidate and refetch quotes when any change occurs
          queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <PageBreadcrumbs />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">My Quote Requests</h1>
          <Button onClick={() => setFormDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Quote Request
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <ClientQuoteStats />
        
        <QuoteRequestList
          quoteRequests={quoteRequests}
          services={services}
          isLoading={isLoading}
          onAcceptEstimate={(id) => handleResponseMutation.mutate({ id, response: "accepted" })}
          onRejectEstimate={(id) => handleResponseMutation.mutate({ id, response: "rejected" })}
        />
      </div>

      <QuoteRequestFormDialog 
        open={formDialogOpen} 
        onOpenChange={setFormDialogOpen} 
      />
    </div>
  )
}
