
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { QuoteForm } from "@/components/quotes/QuoteForm"
import { useLocation, useNavigate } from "react-router-dom"
import { Client } from "@/components/clients/types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"

export default function CreateQuote() {
  const location = useLocation()
  const navigate = useNavigate()
  const preselectedClient = location.state?.preselectedClient as Client | undefined

  const { data: defaultVehicle, isLoading } = useQuery({
    queryKey: ['client-default-vehicle', preselectedClient?.id],
    enabled: !!preselectedClient?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('client_id', preselectedClient?.id)
        .eq('is_primary', true)
        .single()

      if (error) throw error
      return data
    }
  })

  const handleSuccess = () => {
    navigate('/quotes')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="px-6">
          <div className="mb-8">
            <PageBreadcrumbs />
            <h1 className="text-3xl font-bold">Create Quote</h1>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto">
          <QuoteForm 
            onSuccess={handleSuccess}
            defaultValues={preselectedClient ? {
              customer_first_name: preselectedClient.first_name,
              customer_last_name: preselectedClient.last_name,
              customer_email: preselectedClient.email,
              customer_phone: preselectedClient.phone_number || '',
              customer_address: preselectedClient.address || '',
              vehicle_make: defaultVehicle?.make || '',
              vehicle_model: defaultVehicle?.model || '',
              vehicle_year: defaultVehicle?.year || new Date().getFullYear(),
              vehicle_vin: defaultVehicle?.vin || '',
              notes: '',
              service_items: [],
              status: 'draft'
            } : undefined}
          />
        </div>
      </div>
    </div>
  )
}
