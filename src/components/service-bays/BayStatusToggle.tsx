import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Label } from "@/components/ui/label"

type BayStatusToggleProps = {
  status: 'available' | 'in_use' | 'maintenance'
  onStatusChange: (status: 'available' | 'in_use' | 'maintenance') => void
}

export function BayStatusToggle({ status, onStatusChange }: BayStatusToggleProps) {
  return (
    <div>
      <Label className="mb-2 block">Bay Status</Label>
      <ToggleGroup type="single" value={status} onValueChange={onStatusChange}>
        <ToggleGroupItem value="available">Available</ToggleGroupItem>
        <ToggleGroupItem value="in_use">In Use</ToggleGroupItem>
        <ToggleGroupItem value="maintenance">Maintenance</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}