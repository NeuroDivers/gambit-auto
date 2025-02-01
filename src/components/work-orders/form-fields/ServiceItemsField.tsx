import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { ServiceItem } from "./service-items/ServiceItem"
import { ServiceList } from "./service-items/ServiceList"
import { ServiceItemType } from "../types"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"

type ServiceItemsFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>
}

export function ServiceItemsField({ form }: ServiceItemsFieldProps) {
  const items = form.watch('service_items') || []
  
  const handleServicesChange = (newServices: ServiceItemType[]) => {
    form.setValue('service_items', newServices)
  }

  const addItem = () => {
    handleServicesChange([
      ...items,
      {
        service_id: '',
        service_name: '',
        quantity: 1,
        unit_price: 0,
      },
    ])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg">Services</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>
      <ServiceList 
        workOrderServices={items} 
        onServicesChange={handleServicesChange}
      />
    </div>
  )
}