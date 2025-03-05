
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface CommissionFieldsProps {
  commissionRate: number
  commissionType: 'percentage' | 'fixed' | null
  onCommissionChange: (rate: number, type: 'percentage' | 'fixed' | null) => void
}

export function CommissionFields({ 
  commissionRate, 
  commissionType, 
  onCommissionChange 
}: CommissionFieldsProps) {
  const [hasCommission, setHasCommission] = useState(!!commissionType)
  
  const handleToggleCommission = (checked: boolean) => {
    setHasCommission(checked)
    if (!checked) {
      onCommissionChange(0, null)
    } else {
      onCommissionChange(commissionRate || 0, commissionType || 'percentage')
    }
  }

  const handleTypeChange = (type: 'percentage' | 'fixed') => {
    onCommissionChange(commissionRate, type)
  }

  const handleRateChange = (rate: number) => {
    onCommissionChange(rate, commissionType || 'percentage')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="hasCommission" className="text-sm font-medium">
          Apply Commission
        </Label>
        <Switch 
          id="hasCommission" 
          checked={hasCommission}
          onCheckedChange={handleToggleCommission}
        />
      </div>
      
      {hasCommission && (
        <div className="grid grid-cols-2 gap-2">
          <Select 
            value={commissionType || 'percentage'} 
            onValueChange={(value: 'percentage' | 'fixed') => handleTypeChange(value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="number"
            value={commissionRate || 0}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            className="h-9"
            min={0}
            step={commissionType === 'percentage' ? 0.1 : 1}
          />
        </div>
      )}
    </div>
  )
}
