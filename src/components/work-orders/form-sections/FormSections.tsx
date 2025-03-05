
import { UseFormReturn } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkOrderFormValues } from "../types"
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { ServiceSelectionFields } from "./ServiceSelectionFields"
import { AdditionalNotesField } from "./AdditionalNotesField"

interface FormSectionsProps {
  form: UseFormReturn<WorkOrderFormValues>
  isSubmitting: boolean
  isEditing: boolean
  customerId?: string | null
}

export function FormSections({ form, isSubmitting, isEditing, customerId }: FormSectionsProps) {
  const { control, watch, setValue } = form
  
  return (
    <Tabs defaultValue="customerInfo">
      <TabsList className="mb-4">
        <TabsTrigger value="customerInfo">Customer Info</TabsTrigger>
        <TabsTrigger value="vehicleInfo">Vehicle Info</TabsTrigger>
        <TabsTrigger value="serviceInfo">Service Info</TabsTrigger>
        <TabsTrigger value="additionalInfo">Additional Info</TabsTrigger>
      </TabsList>
      <TabsContent value="customerInfo">
        <CustomerInfoFields control={control} />
      </TabsContent>
      <TabsContent value="vehicleInfo">
        <VehicleInfoFields control={control} watch={watch} setValue={setValue} customerId={customerId} />
      </TabsContent>
      <TabsContent value="serviceInfo">
        <ServiceSelectionFields form={form} />
      </TabsContent>
      <TabsContent value="additionalInfo">
        <AdditionalNotesField form={form} isEditing={isEditing} />
      </TabsContent>
    </Tabs>
  )
}
