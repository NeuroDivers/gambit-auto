
import { useParams } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"

export default function QuoteDetails() {
  const { id } = useParams()

  const { data: quote, isLoading } = useQuery({
    queryKey: ["quote", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!quote) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Quote not found.</p>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <div className="px-6">
        <div className="mb-8">
          <PageBreadcrumbs />
          <h1 className="text-3xl font-bold">Quote Details</h1>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold">Customer Information</h2>
              <p>{quote.customer_first_name} {quote.customer_last_name}</p>
              <p>{quote.customer_email}</p>
              <p>{quote.customer_phone}</p>
            </div>
            <div>
              <h2 className="font-semibold">Vehicle Information</h2>
              <p>{quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}</p>
              {quote.vehicle_vin && <p>VIN: {quote.vehicle_vin}</p>}
            </div>
            <div>
              <h2 className="font-semibold">Quote Details</h2>
              <p>Status: {quote.status}</p>
              <p>Total: ${quote.total.toLocaleString()}</p>
              <p>Created: {new Date(quote.created_at).toLocaleDateString()}</p>
            </div>
            {quote.notes && (
              <div>
                <h2 className="font-semibold">Notes</h2>
                <p>{quote.notes}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
