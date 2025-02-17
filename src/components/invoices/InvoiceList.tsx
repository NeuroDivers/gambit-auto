
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { InvoiceListItem } from "./sections/InvoiceListItem"
import { LoadingState } from "./sections/LoadingState"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function InvoiceList() {
  const navigate = useNavigate()

  // First get the current user's role
  const { data: isClient } = useQuery({
    queryKey: ["isClient"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'client'
      })
      
      return !!data
    }
  })

  // Fetch invoices based on user role
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      if (isClient) {
        // Get client ID first
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()

        if (clientError) throw clientError
        if (!clientData) {
          // Handle case where no client is found
          toast.error("No client account found. Please contact support.")
          navigate("/auth")
          return []
        }

        // Then get client's invoices
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("client_id", clientData.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        return data || []
      } else {
        // Admin view - get all invoices
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        return data || []
      }
    },
    enabled: isClient !== undefined
  })

  if (isLoading) {
    return <LoadingState />
  }

  if (!invoices?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No invoices found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <InvoiceListItem
          key={invoice.id}
          invoice={invoice}
        />
      ))}
    </div>
  )
}
