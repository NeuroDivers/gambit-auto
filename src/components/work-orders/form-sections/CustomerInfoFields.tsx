
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Control } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { WorkOrderFormValues } from "../types"

type CustomerInfoFieldsProps = {
  control: Control<WorkOrderFormValues>
  disabled?: boolean
}

export function CustomerInfoFields({ control, disabled }: CustomerInfoFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="first_name">First Name</FormLabel>
              <FormControl>
                <Input id="first_name" placeholder="John" autoComplete="given-name" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="last_name">Last Name</FormLabel>
              <FormControl>
                <Input id="last_name" placeholder="Doe" autoComplete="family-name" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormControl>
                <Input id="email" type="email" placeholder="john@example.com" autoComplete="email" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="phone_number">Phone Number</FormLabel>
              <FormControl>
                <Input id="phone_number" placeholder="(555) 555-5555" autoComplete="tel" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="contact_preference"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="contact_preference_group">Preferred Contact Method</FormLabel>
            <FormControl>
              <RadioGroup
                id="contact_preference_group"
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
                name="contact_preference"
                disabled={disabled}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="contact_preference_email" />
                  <Label htmlFor="contact_preference_email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="contact_preference_phone" />
                  <Label htmlFor="contact_preference_phone">Phone</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="address">Address (Optional)</FormLabel>
            <FormControl>
              <Input id="address" placeholder="123 Main St" autoComplete="street-address" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
