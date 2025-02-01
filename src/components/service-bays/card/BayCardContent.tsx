import { CardContent } from "@/components/ui/card"
import { BayStatusToggle } from "../BayStatusToggle"
import { SidekickAssignment } from "../SidekickAssignment"
import { BayServiceToggles } from "../BayServiceToggles"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type BayCardContentProps = {
  bayId: string
  status: 'available' | 'in_use' | 'maintenance'
  assignedSidekickId: string | null
  notes: string | null
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
  onStatusChange: (status: 'available' | 'in_use' | 'maintenance') => void
  onNotesChange: (notes: string) => void
  onToggleService: (serviceId: string, isActive: boolean) => void
}

export function BayCardContent({
  bayId,
  status,
  assignedSidekickId,
  notes,
  services,
  availableServices,
  onStatusChange,
  onNotesChange,
  onToggleService,
}: BayCardContentProps) {
  return (
    <CardContent className="space-y-6">
      <BayStatusToggle 
        status={status} 
        onStatusChange={onStatusChange} 
      />
      <SidekickAssignment 
        bayId={bayId}
        currentSidekickId={assignedSidekickId}
      />
      <div className="space-y-2">
        <Label htmlFor={`notes-${bayId}`}>Notes</Label>
        <Textarea
          id={`notes-${bayId}`}
          placeholder="Add notes about this bay..."
          value={notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      <BayServiceToggles
        availableServices={availableServices}
        activeServices={services}
        onToggleService={onToggleService}
      />
    </CardContent>
  )
}