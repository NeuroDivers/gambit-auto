
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { InvoiceListItem } from "./sections/InvoiceListItem"
import { LoadingState } from "./sections/LoadingState"

export function InvoiceList() {
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
        const { data: clientData } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (!clientData) throw new Error("No client found")

        // Then get client's invoices
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("client_id", clientData.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        return data
      } else {
        // Admin view - get all invoices
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        return data
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
