import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { InvoiceView } from "@/components/invoices/InvoiceView"
import { useParams, useLocation } from "react-router-dom"
import { useAdminStatus } from "@/hooks/useAdminStatus"

export default function InvoiceDetails() {
  const { id } = useParams()
  const location = useLocation()
  const isPublicView = !location.pathname.startsWith('/invoices')
  const { isAdmin } = useAdminStatus()

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
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    )
  }

  // If it's a public view and not an admin, use the public wrapper
  if (isPublicView && !isAdmin) {
    return (
      <InvoiceView 
        invoiceId={id} 
        showEmailButton={false}
      />
    )
  }

  // For authenticated users and admins
  return (
    <div className="container mx-auto py-12">
      <div className="px-6">
        <PageBreadcrumbs />
      </div>
      <div className="max-w-[1000px] mx-auto">
        <InvoiceView 
          invoiceId={id} 
          showEmailButton={true}
        />
      </div>
    </div>
  )
}