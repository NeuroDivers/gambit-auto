import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { InvoiceView } from "@/components/invoices/InvoiceView"
import { InvoiceEmailVerification } from "@/components/invoices/sections/InvoiceEmailVerification"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default function InvoiceDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isPublicView = !location.pathname.startsWith('/invoices')
  const [isVerified, setIsVerified] = useState(false)
  const { isAdmin, isLoading: isAdminLoading } = useAdminStatus()

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

  if (isLoading || isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    )
  }

  // Determine what content to show based on user status and verification
  const renderContent = () => {
    if (isPublicView && !isVerified && !isAdmin) {
      return (
        <InvoiceEmailVerification 
          invoiceId={id!} 
          onVerified={() => setIsVerified(true)} 
        />
      )
    }

    return (
      <InvoiceView 
        invoiceId={id} 
        showEmailButton={!isPublicView} 
      />
    )
  }

  // Wrap content in appropriate layout based on view type
  if (isPublicView) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto py-12">
          <div className="max-w-[1000px] mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout onLogout={() => navigate("/auth")}>
      <div className="container mx-auto py-12">
        <div className="px-6">
          <PageBreadcrumbs />
        </div>
        <div className="max-w-[1000px] mx-auto">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  )
}