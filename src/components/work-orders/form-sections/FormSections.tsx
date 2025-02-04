import { UseFormReturn } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonalInfoFields } from "@/components/shared/form-fields/PersonalInfoFields"
import { VehicleInfoFields } from "@/components/shared/form-fields/VehicleInfoFields"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { WorkOrderFormValues } from "../types"

type FormSectionsProps = {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
}

export function FormSections({ form, isSubmitting, isEditing }: FormSectionsProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonalInfoFields form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleInfoFields form={form} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceSelectionField form={form} />
        </CardContent>
      </Card>
    </>
  )
}