
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { TimeSelectionFields } from "./TimeSelectionFields"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { BayAssignmentField } from "../form-fields/BayAssignmentField"
import { SidekickAssignmentField } from "../form-fields/SidekickAssignmentField"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SeparatorHorizontal } from "lucide-react"

type FormSectionsProps = {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
}

export function FormSections({ form, isSubmitting, isEditing }: FormSectionsProps) {
  const bayId = form.watch("assigned_bay_id")

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Customer Information</span>
            <SeparatorHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerInfoFields form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Vehicle Information</span>
            <SeparatorHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleInfoFields form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Time Selection</span>
            <SeparatorHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeSelectionFields form={form} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Bay Assignment</span>
              <SeparatorHorizontal className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BayAssignmentField form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>User Assignment</span>
              <SeparatorHorizontal className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SidekickAssignmentField form={form} bayId={bayId} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Services</span>
            <SeparatorHorizontal className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceSelectionField 
            services={form.watch("service_items") || []}
            onServicesChange={(services) => form.setValue("service_items", services)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
