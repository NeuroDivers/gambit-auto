import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type BayStatusToggleProps = {
  status: 'available' | 'in_use' | 'maintenance'
  onStatusChange: (status: 'available' | 'in_use' | 'maintenance') => void
}

const getStatusStyles = (status: 'available' | 'in_use' | 'maintenance') => {
  switch (status) {
    case "available":
      return "text-green-400 bg-[rgb(34,197,94,0.2)] border-[rgb(34,197,94,0.3)]"
    case "in_use":
      return "text-blue-400 bg-[rgb(59,130,246,0.2)] border-[rgb(59,130,246,0.3)]"
    case "maintenance":
      return "text-[#ea384c] bg-[rgb(234,56,76,0.2)] border-[rgb(234,56,76,0.3)]"
    default:
      return ""
  }
}

export function BayStatusToggle({ status, onStatusChange }: BayStatusToggleProps) {
  return (
    <div>
      <Label className="mb-2 block">Bay Status</Label>
      <Select defaultValue={status} onValueChange={onStatusChange}>
        <SelectTrigger className={`w-[180px] ${getStatusStyles(status)}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem 
            value="available"
            className="text-green-400 hover:text-green-500 hover:bg-green-50"
          >
            Available
          </SelectItem>
          <SelectItem 
            value="in_use"
            className="text-blue-400 hover:text-blue-500 hover:bg-blue-50"
          >
            In Use
          </SelectItem>
          <SelectItem 
            value="maintenance"
            className="text-[#ea384c] hover:text-red-500 hover:bg-red-50"
          >
            Maintenance
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}