
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues } from "../types"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { WorkOrderSelect } from "./WorkOrderSelect"
import { InvoiceItemsFields } from "./InvoiceItemsFields"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CustomerInfoFields } from "./CustomerInfoFields"

export type InvoiceFormFieldsProps = {
  form: UseFormReturn<InvoiceFormValues> 
  notes: string
  setNotes: (value: string) => void
  selectedWorkOrderId: string
  onWorkOrderSelect: (id: string) => void
  workOrders: any[]
  invoiceItems: any[]
  setInvoiceItems: (items: any[]) => void
  onCustomerSelect?: (customerId: string) => void
}

export function InvoiceFormFields({
  form,
  notes,
  setNotes,
  selectedWorkOrderId,
  onWorkOrderSelect,
  workOrders,
  invoiceItems,
  setInvoiceItems,
  onCustomerSelect
}: InvoiceFormFieldsProps) {
  return (
    <div className="space-y-4">
      <WorkOrderSelect
        workOrders={workOrders}
        selectedWorkOrderId={selectedWorkOrderId}
        onWorkOrderSelect={onWorkOrderSelect}
      />

      <CustomerInfoFields
        form={form}
        onCustomerSelect={onCustomerSelect}
      />

      <VehicleInfoFields
        vehicleMake={form.watch('vehicle_make')}
        setVehicleMake={(value) => form.setValue('vehicle_make', value)}
        vehicleModel={form.watch('vehicle_model')}
        setVehicleModel={(value) => form.setValue('vehicle_model', value)}
        vehicleYear={form.watch('vehicle_year')}
        setVehicleYear={(value) => form.setValue('vehicle_year', value)}
        vehicleVin={form.watch('vehicle_vin')}
        setVehicleVin={(value) => form.setValue('vehicle_vin', value)}
        vehicleBodyClass=""
        setVehicleBodyClass={() => {}}
        vehicleDoors={0}
        setVehicleDoors={() => {}}
        vehicleTrim=""
        setVehicleTrim={() => {}}
      />

      <InvoiceItemsFields
        items={invoiceItems}
        setItems={setInvoiceItems}
      />

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}
