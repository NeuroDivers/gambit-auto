
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { ServiceItemsField } from "../form-fields/ServiceItemsField"
import { BayAssignmentField } from "./BayAssignmentField"
import { NotesFields } from "./NotesFields"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

interface FormSectionsProps {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
  customerId: string | null
}

export function FormSections({ 
  form, 
  isSubmitting, 
  isEditing, 
  customerId 
}: FormSectionsProps) {
  return (
    <div className="space-y-6">
      <CustomerInfoFields form={form} isEditing={isEditing} customerId={customerId} />
      
      <Separator />
      
      <Card>
        <CardContent className="p-6">
          <ServiceItemsField 
            value={form.watch('service_items') || []}
            onChange={(services) => form.setValue('service_items', services, { shouldValidate: true })}
            showCommission={true}
          />
        </CardContent>
      </Card>
      
      <Separator />
      
      <Card>
        <CardContent className="p-6 space-y-6">
          <BayAssignmentField form={form} />
          <NotesFields form={form} />
        </CardContent>
      </Card>
    </div>
  )
}
