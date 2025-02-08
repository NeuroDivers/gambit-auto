
import { CardContent } from "@/components/ui/card"
import { BayStatusToggle } from "../BayStatusToggle"
import { ProfileAssignment } from "../ProfileAssignment"
import { BayServiceToggles } from "../BayServiceToggles"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type BayCardContentProps = {
  bayId: string
  status: 'available' | 'in_use' | 'maintenance'
  assignedProfileId: string | null
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
  assignedProfileId,
  notes,
  services,
  availableServices,
  onStatusChange,
  onNotesChange,
  onToggleService,
}: BayCardContentProps) {
  return (
    <CardContent className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <BayStatusToggle 
            status={status} 
            onStatusChange={onStatusChange} 
          />
          <ProfileAssignment 
            bayId={bayId}
            currentProfileId={assignedProfileId}
          />
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            placeholder="Add notes about this bay..."
            value={notes || ''}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>
      </div>
      <div className="pt-4 border-t">
        <BayServiceToggles
          availableServices={availableServices}
          activeServices={services}
          onToggleService={onToggleService}
        />
      </div>
    </CardContent>
  )
}
