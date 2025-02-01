import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface ServiceBay {
  id: string
  name: string
}

export function ServiceBaysList() {
  const { data: serviceBays } = useQuery<ServiceBay[]>({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("id, name")

      if (error) throw error
      return data || []
    },
  })

  if (!serviceBays) {
    return <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
  }

  return (
    <div className="space-y-4">
      {serviceBays.map((bay) => (
        <div key={bay.id} className="p-4 border rounded">
          <h3 className="font-semibold">{bay.name}</h3>
        </div>
      ))}
    </div>
  )
}
