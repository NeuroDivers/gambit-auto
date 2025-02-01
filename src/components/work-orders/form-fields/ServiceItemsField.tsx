import { FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ServiceList } from "./service-items/ServiceList"
import { UseFormReturn } from "react-hook-form"
import { ServiceItemType, WorkOrderFormValues } from "../types"

type ServiceItemsFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

export function ServiceItemsField({ form }: ServiceItemsFieldProps) {
  const services = form.watch("service_items") || []

  const handleServicesChange = (newServices: ServiceItemType[]) => {
    form.setValue("service_items", newServices)
  }

  const handleAddService = () => {
    const currentServices = form.getValues("service_items") || []
    form.setValue("service_items", [
      ...currentServices,
      {
        service_id: '',
        service_name: '',
        quantity: 1,
        unit_price: 0
      }
    ])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel className="text-lg">Services</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddService}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>
      <ServiceList
        workOrderServices={services}
        onServicesChange={handleServicesChange}
      />
    </div>
  )
}