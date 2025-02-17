
import { VehicleList } from "@/components/clients/vehicles/VehicleList"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"

export default function ClientVehicles() {
  const { data: client, isLoading } = useQuery({
    queryKey: ['client-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!client) throw new Error('Client not found')
      return client
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!client) {
    return <div>Unable to load client profile</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Vehicles</h1>
      <VehicleList clientId={client.id} />
    </div>
  )
}
