import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { BusinessFormValues } from "../types"

type BusinessHoursSectionProps = {
  form: UseFormReturn<BusinessFormValues>
}

export function BusinessHoursSection({ form }: BusinessHoursSectionProps) {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Business Hours</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {days.map((day) => (
          <FormField
            key={day}
            control={form.control}
            name={`business_hours.${day}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capitalize">{day}</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g., 9:00-17:00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
}