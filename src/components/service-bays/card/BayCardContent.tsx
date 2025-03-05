
import { CardContent } from "@/components/ui/card"
import { BayStatusToggle } from "../BayStatusToggle"
import { ProfileAssignment } from "../ProfileAssignment"
import { BayServiceToggles } from "../BayServiceToggles"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clipboard, Pencil, X, Check } from "lucide-react"
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
    <CardContent className="p-6 pt-4 flex-grow flex flex-col">
      {/* Preview mode */}
      {!isEditing ? (
        <div className="space-y-5 flex-grow flex flex-col">
          {/* Notes preview */}
          <div className="text-sm text-muted-foreground flex-grow">
            {notes ? (
              <div className="bg-muted/20 p-3 rounded-lg border border-border/40">
                <p className="line-clamp-3">{notes}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 bg-muted/20 rounded-lg border border-border/40 text-muted-foreground/70">
                <Clipboard className="h-4 w-4 mr-2" />
                <p>No notes provided</p>
              </div>
            )}
          </div>
          
          {/* Services summary */}
          {activeServices.length > 0 && (
            <div className="mt-auto">
              <h4 className="font-semibold text-sm mb-2">Active Services</h4>
              <div className="flex flex-wrap gap-2">
                {activeServices.map(service => (
                  <Badge key={service.service_id} variant="outline" className="bg-primary/5 text-primary-foreground border-primary/20">
                    {service.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Edit button */}
          <Button 
            className="w-full mt-4 gap-2 bg-primary hover:bg-primary/90"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit Details
          </Button>
        </div>
      ) : (
        /* Edit mode */
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
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
          
          <div className="border rounded-lg p-4 bg-background/50">
            <Label className="mb-3 block">Available Services</Label>
            <BayServiceToggles
              availableServices={availableServices}
              activeServices={services}
              onToggleService={onToggleService}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={() => setIsEditing(false)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Done
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  )
}
