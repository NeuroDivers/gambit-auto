
import { Card } from "@/components/ui/card"
import { BayCardHeader } from "./card/BayCardHeader"
import { BayCardContent } from "./card/BayCardContent"
import { useBayActions } from "./hooks/useBayActions"

type ServiceBayCardProps = {
  bay: {
    id: string
    name: string
    status: 'available' | 'in_use' | 'maintenance'
    assigned_profile_id?: string | null
    notes?: string | null
  }
  services: {
    service_id: string
    name: string
    is_active: boolean
  }[]
  availableServices: {
    id: string
    name: string
    status?: 'active' | 'inactive'
  }[]
}

export function ServiceBayCard({ bay, services, availableServices }: ServiceBayCardProps) {
  const { updateBayStatus, updateBayNotes, toggleService } = useBayActions(bay.id)

  return (
    <Card className="overflow-hidden border border-border/40 hover:border-border/60 transition-all shadow-sm hover:shadow-md rounded-xl h-full flex flex-col">
      <BayCardHeader 
        name={bay.name} 
        bayId={bay.id}
        status={bay.status}
      />
      <BayCardContent
        bayId={bay.id}
        status={bay.status}
        assignedProfileId={bay.assigned_profile_id}
        notes={bay.notes}
        services={services}
        availableServices={availableServices}
        onStatusChange={updateBayStatus}
        onNotesChange={updateBayNotes}
        onToggleService={toggleService}
      />
    </Card>
  )
}
