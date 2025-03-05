
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "@/components/work-orders/form-sections/VehicleInfoFields"
import { TimeSelectionFields } from "./TimeSelectionFields"
import { BayAssignmentField } from "./BayAssignmentField"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { ServiceItemType } from "@/types/service-item"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { NotesFields } from "./NotesFields"

type FormSectionsProps = {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
  customerId: string | null
}

export function FormSections({ form, isSubmitting, isEditing, customerId }: FormSectionsProps) {
  const watchedServiceItems = form.watch('service_items') || []

  const handleServicesChange = (services: ServiceItemType[]) => {
    form.setValue('service_items', services)
  }
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerInfoFields 
            form={form}
            disabled={isSubmitting}
            isEditing={isEditing}
            customerId={customerId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleInfoFields 
            form={form}
            disabled={isSubmitting}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceSelectionField
            services={watchedServiceItems}
            onChange={handleServicesChange}
            disabled={isSubmitting}
            showAssignedStaff={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <TimeSelectionFields 
              form={form}
              disabled={isSubmitting}
            />
            <Separator />
            <BayAssignmentField 
              form={form}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesFields 
            form={form}
            disabled={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
