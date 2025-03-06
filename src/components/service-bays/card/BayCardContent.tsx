
import { CardContent } from "@/components/ui/card"
import { BayStatusToggle } from "../BayStatusToggle"
import { ProfileAssignment } from "../ProfileAssignment"
import { BayServiceToggles } from "../BayServiceToggles"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clipboard, Pencil, X, Check, User, CheckCircle, Clock, AlertTriangle, Cog } from "lucide-react"
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
  const { profiles } = useAssignableProfiles();
  
  const activeServices = services.filter(s => s.is_active);
  const assignedProfile = profiles?.find(p => p.id === assignedProfileId);

  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return (
          <Badge variant="outline" className="bg-green-100/80 text-green-700 border-green-200 font-medium flex items-center gap-1.5 px-3 py-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Available</span>
          </Badge>
        )
      case 'in_use':
        return (
          <Badge variant="outline" className="bg-purple-100/80 text-purple-700 border-purple-200 font-medium flex items-center gap-1.5 px-3 py-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>In Use</span>
          </Badge>
        )
      case 'maintenance':
        return (
          <Badge variant="outline" className="bg-amber-100/80 text-amber-700 border-amber-200 font-medium flex items-center gap-1.5 px-3 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Maintenance</span>
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <CardContent className="p-6 pt-5 flex-grow flex flex-col">
      {/* Preview mode */}
      {!isEditing ? (
        <div className="space-y-5 flex-grow flex flex-col">
          {/* Status and Assignment */}
          <div className="flex items-center justify-between">
            <div>
              {getStatusBadge()}
            </div>
            {assignedProfileId && assignedProfile && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-blue-100/80 text-blue-700 border-blue-200 flex items-center gap-1.5 px-3 py-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>{assignedProfile.first_name} {assignedProfile.last_name}</span>
                </Badge>
              </div>
            )}
          </div>
          
          {/* Notes preview */}
          <div className="text-sm text-muted-foreground flex-grow">
            {notes ? (
              <div className="bg-background p-4 rounded-lg border border-border/40 shadow-sm">
                <p className="line-clamp-3 leading-relaxed">{notes}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24 bg-muted/20 rounded-lg border border-border/40 text-muted-foreground/70">
                <Clipboard className="h-5 w-5 mb-2 opacity-50" />
                <p>No notes provided</p>
              </div>
            )}
          </div>
          
          {/* Services summary */}
          {activeServices.length > 0 && (
            <div className="mt-auto pt-2">
              <h4 className="font-semibold text-sm mb-2 text-foreground/80 flex items-center gap-2">
                <Cog className="h-4 w-4" />
                Active Services
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeServices.map(service => (
                  <Badge key={service.service_id} variant="outline" className="bg-primary/10 text-primary border-primary/20 py-1.5">
                    {service.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Edit button */}
          <Button 
            className="w-full mt-4 gap-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 shadow-sm"
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
            <Label className="text-foreground font-medium">Notes</Label>
            <Textarea
              placeholder="Add notes about this bay..."
              value={notes || ''}
              onChange={(e) => onNotesChange(e.target.value)}
              className="min-h-[100px] resize-none border-border/60 focus-visible:ring-primary/30"
            />
          </div>
          
          <div className="border rounded-lg p-4 bg-background shadow-sm">
            <Label className="mb-3 block text-foreground font-medium">Available Services</Label>
            <BayServiceToggles
              availableServices={availableServices}
              activeServices={services}
              onToggleService={onToggleService}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="w-full border-border/60"
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
