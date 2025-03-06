
import { CardContent } from "@/components/ui/card"
import { BayStatusToggle } from "../BayStatusToggle"
import { ProfileAssignment } from "../ProfileAssignment"
import { BayServiceToggles } from "../BayServiceToggles"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clipboard, Pencil, X, Check, User } from "lucide-react"
import { useState } from "react"
import { useAssignableProfiles } from "../hooks/useAssignableProfiles"

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
  isExpanded: boolean
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
  isExpanded,
}: BayCardContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { profiles } = useAssignableProfiles();
  
  const activeServices = services.filter(s => s.is_active);
  const assignedProfile = profiles?.find(p => p.id === assignedProfileId);

  // Collapsed view - show key information
  if (!isExpanded && !isEditing) {
    return (
      <CardContent className="p-6 pt-2 flex-grow flex flex-col">
        <div className="text-sm text-muted-foreground">
          {notes ? (
            <div className="line-clamp-2">{notes}</div>
          ) : (
            <div className="text-muted-foreground/60 italic">No notes provided</div>
          )}
        </div>
        
        {assignedProfileId && assignedProfile && (
          <div className="mt-4 text-sm flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Assigned to:</span>
            <span className="font-medium">{assignedProfile.first_name} {assignedProfile.last_name}</span>
          </div>
        )}
        
        {activeServices.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {activeServices.slice(0, 3).map(service => (
              <Badge key={service.service_id} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {service.name}
              </Badge>
            ))}
            {activeServices.length > 3 && (
              <Badge variant="outline">+{activeServices.length - 3} more</Badge>
            )}
          </div>
        )}
      </CardContent>
    );
  }

  // Expanded view - shows full content
  if (isExpanded && !isEditing) {
    return (
      <CardContent className="p-6 pt-2 flex-grow flex flex-col">
        <div className="text-sm text-muted-foreground mb-4">
          {notes ? (
            <div>{notes}</div>
          ) : (
            <div className="text-muted-foreground/60 italic">No notes provided</div>
          )}
        </div>
        
        {assignedProfileId && assignedProfile && (
          <div className="mb-4 text-sm flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Assigned to:</span>
            <span className="font-medium">{assignedProfile.first_name} {assignedProfile.last_name}</span>
          </div>
        )}
        
        {activeServices.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium mb-2">Active Services</h4>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              {activeServices.map(service => (
                <div key={service.service_id} className="flex justify-between items-center">
                  <span>{service.name}</span>
                  <Badge className="bg-purple-500">active</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          className="w-full mt-4 gap-2"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
          Edit Details
        </Button>
      </CardContent>
    );
  }

  // Edit mode
  return (
    <CardContent className="p-6 pt-2 space-y-5">
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
      
      <div className="border rounded-lg p-4 bg-card shadow-sm">
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
    </CardContent>
  );
}
