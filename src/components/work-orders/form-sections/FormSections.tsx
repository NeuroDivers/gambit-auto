import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PersonalInfoFields } from "@/components/shared/form-fields/PersonalInfoFields"
import { VehicleInfoFields } from "@/components/shared/form-fields/VehicleInfoFields"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { UseFormReturn } from "react-hook-form"
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

      {!isEditing && <ServiceSelectionField form={form} />}

      <CardFooter className="flex justify-end space-x-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 
            (isEditing ? "Updating..." : "Creating...") : 
            (isEditing ? "Update Work Order" : "Create Work Order")
          }
        </Button>
      </CardFooter>
    </>
  )
}