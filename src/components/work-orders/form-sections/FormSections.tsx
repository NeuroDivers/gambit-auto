import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { ServiceItemsField } from "../form-fields/ServiceItemsField"
import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormSectionsProps {
  form: UseFormReturn<any>
  isSubmitting: boolean
  isEditing: boolean
}

export function FormSections({ 
  form, 
  isSubmitting, 
  isEditing 
}: FormSectionsProps) {
  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      
      const { data, error } = await supabase
        .rpc('is_admin', { user_id: user.id })
      
      if (error) throw error
      return data || false
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input id="first_name" placeholder="John" {...form.register("first_name")} />
            {form.formState.errors.first_name && (
              <p className="text-red-500 text-sm">{form.formState.errors.first_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input id="last_name" placeholder="Doe" {...form.register("last_name")} />
            {form.formState.errors.last_name && (
              <p className="text-red-500 text-sm">{form.formState.errors.last_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john.doe@example.com" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input id="phone_number" placeholder="555-123-4567" {...form.register("phone_number")} />
            {form.formState.errors.phone_number && (
              <p className="text-red-500 text-sm">{form.formState.errors.phone_number.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="contact_preference">Contact Preference</Label>
            <Select
              onValueChange={form.setValue.bind(null, "contact_preference")}
              defaultValue={form.getValues("contact_preference")}
            >
              <SelectTrigger id="contact_preference">
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.contact_preference && (
              <p className="text-red-500 text-sm">{form.formState.errors.contact_preference.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="123 Main St" {...form.register("address")} />
            {form.formState.errors.address && (
              <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="vehicle_make">Vehicle Make</Label>
            <Input id="vehicle_make" placeholder="Toyota" {...form.register("vehicle_make")} />
            {form.formState.errors.vehicle_make && (
              <p className="text-red-500 text-sm">{form.formState.errors.vehicle_make.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="vehicle_model">Vehicle Model</Label>
            <Input id="vehicle_model" placeholder="Camry" {...form.register("vehicle_model")} />
            {form.formState.errors.vehicle_model && (
              <p className="text-red-500 text-sm">{form.formState.errors.vehicle_model.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="vehicle_year">Vehicle Year</Label>
            <Input
              id="vehicle_year"
              type="number"
              placeholder="2023"
              {...form.register("vehicle_year", { valueAsNumber: true })}
            />
            {form.formState.errors.vehicle_year && (
              <p className="text-red-500 text-sm">{form.formState.errors.vehicle_year.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="vehicle_serial">Vehicle Serial Number</Label>
            <Input id="vehicle_serial" placeholder="VIN or Serial Number" {...form.register("vehicle_serial")} />
            {form.formState.errors.vehicle_serial && (
              <p className="text-red-500 text-sm">{form.formState.errors.vehicle_serial.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceItemsField
            services={form.watch('service_items')}
            onServicesChange={(services) => form.setValue('service_items', services)}
            disabled={isSubmitting}
            showCommission={isAdmin}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="additional_notes">Any additional notes for the work order?</Label>
          <Textarea
            id="additional_notes"
            placeholder="Additional notes..."
            {...form.register("additional_notes")}
          />
        </CardContent>
      </Card>
    </div>
  )
}
