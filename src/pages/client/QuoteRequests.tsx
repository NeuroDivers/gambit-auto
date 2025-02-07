
import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useQuoteRequestData } from "@/hooks/useQuoteRequestData"
import { useQuoteRequestActions } from "@/hooks/useQuoteRequestActions"
import { useMediaUpload } from "@/hooks/useMediaUpload"
import { QuoteRequestList } from "@/components/client/quotes/QuoteRequestList"

export default function QuoteRequests() {
  const navigate = useNavigate()
  const { services, quoteRequests, isLoading, queryClient } = useQuoteRequestData()
  const { handleResponseMutation } = useQuoteRequestActions()
  const { uploading, handleImageUpload, handleImageRemove } = useMediaUpload()

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
          event: 'UPDATE',
          schema: 'public',
          table: 'quote_requests'
        },
        () => {
          // Invalidate and refetch quotes when an update occurs
          queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">My Quote Requests</h1>
      <QuoteRequestList
        quoteRequests={quoteRequests}
        services={services}
        isLoading={isLoading}
        onAcceptEstimate={(id) => handleResponseMutation.mutate({ id, response: "accepted" })}
        onRejectEstimate={(id) => handleResponseMutation.mutate({ id, response: "rejected" })}
        onUploadImages={handleImageUpload}
        uploading={uploading}
        onImageRemove={handleImageRemove}
      />
    </div>
  )
}
