import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus } from "lucide-react"
import { ServiceItemType } from "./types"

type ServiceItemProps = {
  service: ServiceItemType
  onQuantityChange: (value: number) => void
  onUnitPriceChange: (value: number) => void
  onRemove: () => void
}

export function ServiceItem({ 
  service, 
  onQuantityChange, 
  onUnitPriceChange, 
  onRemove 
}: ServiceItemProps) {
  return (
    <div className="flex items-center gap-4 bg-[#221F26]/60 p-4 rounded-md">
      <div className="flex-1">
        <div className="font-medium text-white/90">{service.service_name}</div>
      </div>
      
      <div className="flex items-center gap-4">
        <Input
          type="number"
          value={service.quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value))}
          className="w-20"
          min={1}
        />
        <Input
          type="number"
          value={service.unit_price}
          onChange={(e) => onUnitPriceChange(parseFloat(e.target.value))}
          className="w-24"
          min={0}
          step={0.01}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}