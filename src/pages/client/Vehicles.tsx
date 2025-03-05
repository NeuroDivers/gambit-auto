import { VehicleList } from "@/components/clients/vehicles/VehicleList"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { useParams } from "react-router-dom"

export default function ClientVehicles() {
  const { customerId } = useParams()
  const { isAdmin } = useAdminStatus()
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['customer-profile', customerId],
    queryFn: async () => {
      if (isAdmin && customerId) {
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single()
          
        if (!customer) throw new Error('Customer not found')
        return customer
      } 
      else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!customer) throw new Error('Customer not found')
        return customer
      }
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return <div className="p-6">Unable to load customer profile</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <PageBreadcrumbs />
        <h1 className="text-2xl md:text-3xl font-bold">
          {isAdmin && customerId ? `${profile.first_name}'s Vehicles` : 'My Vehicles'}
        </h1>
      </div>
      <VehicleList clientId={profile.id} />
    </div>
  )
}
