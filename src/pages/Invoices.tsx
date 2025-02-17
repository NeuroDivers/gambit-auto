
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { useNavigate } from "react-router-dom"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export default function Invoices() {
  const navigate = useNavigate()

  // Check if user is an admin
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'administrator'
      })
      
      return !!data
    }
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageBreadcrumbs />
        {isAdmin && (
          <Button onClick={() => navigate("/invoices/create")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        )}
      </div>
      <InvoiceList />
    </div>
  )
}
