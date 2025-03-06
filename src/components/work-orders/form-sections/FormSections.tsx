
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { ServiceItemsField } from "../form-fields/ServiceItemsField"
import { BayAssignmentField } from "./BayAssignmentField"
import { NotesFields } from "./NotesFields"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { SchedulingFields } from "./SchedulingFields"
import { ServiceItemType } from "@/types/service-item"

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
  // Convert service items to match the expected format
  const convertServiceItems = (items: any[]) => {
    return items.map(item => ({
      ...item,
      // Ensure commission_type is standardized as 'flat'
      commission_type: item.commission_type === 'flat_rate' ? 'flat' : item.commission_type,
      sub_services: item.sub_services ? item.sub_services.map((sub: any) => ({
        ...sub,
        commission_type: sub.commission_type === 'flat_rate' ? 'flat' : sub.commission_type
      })) : undefined
    }));
  };

  // Convert back for when the component returns data
  const convertBackServiceItems = (items: any[]) => {
    return items.map(item => ({
      ...item,
      // No conversion needed as we're now using 'flat' throughout
      commission_type: item.commission_type,
      sub_services: item.sub_services ? item.sub_services.map((sub: any) => ({
        ...sub,
        commission_type: sub.commission_type
      })) : undefined
    }));
  };

  return (
    <div className="space-y-6">
      <CustomerInfoFields form={form} isEditing={isEditing} />
      
      <Separator />
      
      <Card>
        <CardContent className="p-6">
          <VehicleInfoFields form={form} />
        </CardContent>
      </Card>
      
      <Separator />
      
      <Card>
        <CardContent className="p-6">
          <SchedulingFields form={form} />
        </CardContent>
      </Card>
      
      <Separator />
      
      <Card>
        <CardContent className="p-6">
          <ServiceItemsField 
            value={convertServiceItems(form.watch('service_items') || [])}
            onChange={(services) => form.setValue('service_items', convertBackServiceItems(services), { shouldValidate: true })}
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
