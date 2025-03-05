
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type BayStatusToggleProps = {
  status: 'available' | 'in_use' | 'maintenance'
  onStatusChange: (status: 'available' | 'in_use' | 'maintenance') => void
}

export function BayStatusToggle({ status, onStatusChange }: BayStatusToggleProps) {
  return (
    <div className="space-y-2">
      <Label>Bay Status</Label>
      <div className="flex gap-2 flex-wrap">
        <Badge 
          variant={status === 'available' ? 'success' : 'outline'} 
          className={`cursor-pointer px-3 py-1 ${status === 'available' ? '' : 'hover:bg-green-50 hover:text-green-700'}`}
          onClick={() => onStatusChange('available')}
        >
          Available
        </Badge>
        <Badge 
          variant={status === 'in_use' ? 'secondary' : 'outline'} 
          className={`cursor-pointer px-3 py-1 ${status === 'in_use' ? '' : 'hover:bg-purple-50 hover:text-purple-700'}`}
          onClick={() => onStatusChange('in_use')}
        >
          In Use
        </Badge>
        <Badge 
          variant={status === 'maintenance' ? 'pending' : 'outline'} 
          className={`cursor-pointer px-3 py-1 ${status === 'maintenance' ? '' : 'hover:bg-amber-50 hover:text-amber-700'}`}
          onClick={() => onStatusChange('maintenance')}
        >
          Maintenance
        </Badge>
      </div>
    </div>
  )
}
