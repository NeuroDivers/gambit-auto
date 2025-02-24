
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"

type CommissionRateFieldsProps = {
  form: UseFormReturn<any>
  namePrefix?: string
  label?: string
  disabled?: boolean
}

export function CommissionRateFields({ 
  form, 
  namePrefix = "", 
  label = "Commission",
  disabled = false 
}: CommissionRateFieldsProps) {
  const rateName = `${namePrefix}commission_rate`
  const typeName = `${namePrefix}commission_type`

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={rateName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  placeholder="Enter rate"
                  disabled={disabled}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={typeName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select 
                value={field.value || 'percentage'} 
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat Rate</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
