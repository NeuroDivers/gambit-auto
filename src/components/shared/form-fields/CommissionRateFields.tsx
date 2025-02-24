
import { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface CommissionRateFieldsProps {
  serviceIndex?: number
  value: {
    rate: number | null
    type: 'percentage' | 'flat' | null
  }
  onChange: (value: { rate: number | null; type: 'percentage' | 'flat' | null }) => void
  disabled?: boolean
  form?: UseFormReturn<any>
  namePrefix?: string
  label?: string
}

export function CommissionRateFields({
  serviceIndex,
  value,
  onChange,
  disabled,
  form,
  namePrefix,
  label = "Commission"
}: CommissionRateFieldsProps) {
  return (
    <div className="space-y-2">
      <Label>Commission</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={value.rate || ''}
          onChange={(e) => onChange({
            ...value,
            rate: e.target.value ? Number(e.target.value) : null
          })}
          disabled={disabled}
          placeholder="Rate"
        />
        <Select
          value={value.type || ''}
          onValueChange={(type) => onChange({
            ...value,
            type: type as 'percentage' | 'flat'
          })}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="flat">Flat</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
