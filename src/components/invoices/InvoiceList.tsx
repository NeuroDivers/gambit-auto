
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { InvoiceListItem } from "./sections/InvoiceListItem"
import { LoadingState } from "./sections/LoadingState"

export function InvoiceList() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
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
