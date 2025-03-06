
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
    type: 'percentage' | 'fixed' | null
  }
  onChange: (value: { rate: number | null; type: 'percentage' | 'fixed' | null }) => void
  disabled?: boolean
  form?: UseFormReturn<any>
  namePrefix?: string
  label?: string
  hidden?: boolean
}

export function CommissionRateFields({
  serviceIndex,
  value,
  onChange,
  disabled,
  form,
  namePrefix,
  label = "Commission",
  hidden = false
}: CommissionRateFieldsProps) {
  if (hidden) return null;
  
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
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
            type: type as 'percentage' | 'fixed'
          })}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
