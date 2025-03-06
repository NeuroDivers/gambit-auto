
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

  const getStatusColor = () => {
    switch (bay.status) {
      case 'available': return 'border-green-200 hover:border-green-300'
      case 'in_use': return 'border-purple-200 hover:border-purple-300'
      case 'maintenance': return 'border-amber-200 hover:border-amber-300'
      default: return 'border-border/50 hover:border-border/80'
    }
  }

  return (
    <Card 
      className={`overflow-hidden border-2 ${getStatusColor()} transition-all shadow-md hover:shadow-lg flex flex-col h-full rounded-xl group bg-white dark:bg-card`}
    >
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
