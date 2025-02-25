
import { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { Textarea } from "@/components/ui/textarea"
import { BayAssignmentField } from "../form-fields/BayAssignmentField"
import { SidekickAssignmentField } from "../form-fields/SidekickAssignmentField"

interface FormSectionsProps {
  form: UseFormReturn<any>
  isSubmitting: boolean
  isEditing: boolean
}

export function FormSections({ form, isSubmitting, isEditing }: FormSectionsProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} type="tel" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="vehicle_make"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Make</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vehicle_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Model</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vehicle_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Year</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  disabled={isSubmitting}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vehicle_serial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle VIN</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="service_items"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Services</FormLabel>
            <FormControl>
              <ServiceSelectionField
                services={field.value || []}
                onChange={field.onChange}
                disabled={isSubmitting}
                showCommission={true}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <BayAssignmentField form={form} />
        <SidekickAssignmentField form={form} />
      </div>

      <FormField
        control={form.control}
        name="additional_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Textarea {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
