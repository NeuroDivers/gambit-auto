
import { Card } from "@/components/ui/card"
import { BayCardHeader } from "./card/BayCardHeader"
import { BayCardContent } from "./card/BayCardContent"
import { useBayActions } from "./hooks/useBayActions"
import { useState } from "react"

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
  const [isExpanded, setIsExpanded] = useState(false)
  const activeServices = services.filter(s => s.is_active)

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <BayCardHeader 
        name={bay.name} 
        bayId={bay.id}
        status={bay.status}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        hasServices={activeServices.length > 0}
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
        isExpanded={isExpanded}
      />
    </Card>
  )
}
