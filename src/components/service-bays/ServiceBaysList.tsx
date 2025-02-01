import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BayHeader } from "./BayHeader"
import { useState } from "react"
import { CreateServiceBayDialog } from "./CreateServiceBayDialog"

interface ServiceBay {
  id: string
  name: string
  status: 'available' | 'occupied' | 'maintenance'
  assigned_sidekick_id: string | null
}

export function ServiceBaysList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: serviceBays, isLoading } = useQuery<ServiceBay[]>({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")

      if (error) throw error
      return data || []
    },
  })

  if (isLoading) {
    return <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <BayHeader onAddBay={() => setIsDialogOpen(true)} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceBays?.map((bay) => (
          <div 
            key={bay.id} 
            className="bg-[#242424] border border-white/12 rounded-lg p-6 transition-all duration-200 hover:border-[#BB86FC]/50"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white/[0.87]">{bay.name}</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-sm">
                {bay.status === 'available' ? (
                  <span className="flex items-center text-[#03DAC5]">
                    Available
                  </span>
                ) : bay.status === 'occupied' ? (
                  <span className="flex items-center text-yellow-500">
                    Occupied
                  </span>
                ) : (
                  <span className="flex items-center text-red-500">
                    Maintenance
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateServiceBayDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}