import { useForm } from "react-hook-form"
import { ServiceItemType } from "@/types/service-item"
import { EstimateFormValues, Estimate } from "@/components/quotes/types"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"

interface QuoteFormProps {
  estimate?: Estimate
  onSubmit: (data: EstimateFormValues) => void
  isSubmitting?: boolean
}

export function QuoteForm({ estimate, onSubmit, isSubmitting = false }: QuoteFormProps) {
  const [services, setServices] = useState<ServiceItemType[]>(
    estimate?.estimate_items || []
  )

  const form = useForm<EstimateFormValues>({
    defaultValues: {
      notes: estimate?.notes || "",
      status: estimate?.status || "draft",
      service_items: estimate?.estimate_items || [],
      customer_first_name: estimate?.customer_first_name || "",
      customer_last_name: estimate?.customer_last_name || "",
      customer_email: estimate?.customer_email || "",
      customer_phone: estimate?.customer_phone || "",
      customer_address: estimate?.customer_address || "",
      vehicle_make: estimate?.vehicle_make || "",
      vehicle_model: estimate?.vehicle_model || "",
      vehicle_year: estimate?.vehicle_year || new Date().getFullYear(),
      vehicle_vin: estimate?.vehicle_vin || ""
    }
  })

  const defaultServiceItem: ServiceItemType = {
    service_id: "",
    service_name: "",
    quantity: 1,
    unit_price: 0,
    description: "",
    commission_rate: null,
    commission_type: null
  }

  useEffect(() => {
    form.setValue("service_items", services)
  }, [services, form])

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      ...data,
      service_items: services
    })
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_first_name">First Name</Label>
              <Input
                id="customer_first_name"
                {...form.register("customer_first_name")}
              />
            </div>
            <div>
              <Label htmlFor="customer_last_name">Last Name</Label>
              <Input
                id="customer_last_name"
                {...form.register("customer_last_name")}
              />
            </div>
            <div>
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                type="email"
                {...form.register("customer_email")}
              />
            </div>
            <div>
              <Label htmlFor="customer_phone">Phone</Label>
              <Input
                id="customer_phone"
                type="tel"
                {...form.register("customer_phone")}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="customer_address">Address</Label>
              <Input
                id="customer_address"
                {...form.register("customer_address")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle_make">Make</Label>
              <Input
                id="vehicle_make"
                {...form.register("vehicle_make")}
              />
            </div>
            <div>
              <Label htmlFor="vehicle_model">Model</Label>
              <Input
                id="vehicle_model"
                {...form.register("vehicle_model")}
              />
            </div>
            <div>
              <Label htmlFor="vehicle_year">Year</Label>
              <Input
                id="vehicle_year"
                type="number"
                {...form.register("vehicle_year", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="vehicle_vin">VIN</Label>
              <Input
                id="vehicle_vin"
                {...form.register("vehicle_vin")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceSelectionField
            services={services}
            onChange={setServices}
            disabled={isSubmitting}
            showCommission
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...form.register("notes")}
            placeholder="Add any additional notes here..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {estimate ? "Update Estimate" : "Create Estimate"}
        </Button>
      </div>
    </form>
  )
}
