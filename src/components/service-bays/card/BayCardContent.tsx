
import { CardContent } from "@/components/ui/card"
import { BayStatusToggle } from "../BayStatusToggle"
import { ProfileAssignment } from "../ProfileAssignment"
import { BayServiceToggles } from "../BayServiceToggles"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { useState } from "react"

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
  const [isEditing, setIsEditing] = useState(false);
  
  const activeServices = services.filter(s => s.is_active);

  return (
    <CardContent className="p-4 pt-2">
      <div className="space-y-4">
        {/* Description/Notes preview */}
        {!isEditing && (
          <p className="text-sm text-muted-foreground">
            {notes || "No notes provided for this service bay."}
          </p>
        )}
        
        {/* Services summary */}
        {activeServices.length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="font-medium">Active Services:</span>
            {activeServices.map(service => (
              <span key={service.service_id}>{service.name}</span>
            )).reduce((prev, curr, i) => 
              i === 0 ? [curr] : [...prev, <span key={`sep-${i}`}>,</span>, curr], [] as React.ReactNode[]
            )}
          </div>
        )}
        
        {/* Edit mode */}
        {isEditing ? (
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
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Active Services</Label>
              <BayServiceToggles
                availableServices={availableServices}
                activeServices={services}
                onToggleService={onToggleService}
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            className="gap-2 bg-purple-600 hover:bg-purple-700 mt-2 w-full"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit Details
          </Button>
        )}
      </div>
    </CardContent>
  )
}
