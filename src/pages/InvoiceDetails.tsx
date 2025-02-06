
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { InvoiceView } from "@/components/invoices/InvoiceView"
import { useParams } from "react-router-dom"
import { LoadingState } from "@/components/invoices/sections/LoadingState"

export default function InvoiceDetails() {
  const { id } = useParams()

  const { isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          work_order:work_orders (
            *,
            work_order_services (
              service:service_types (
                name,
                price
              )
            )
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <PageBreadcrumbs />
        </div>
        <div className="max-w-[1000px] mx-auto">
          <InvoiceView invoiceId={id} />
        </div>
      </div>
    </div>
  )
}
