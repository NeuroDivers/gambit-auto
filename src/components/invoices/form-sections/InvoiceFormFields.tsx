
import { CustomerInfoFields } from "./CustomerInfoFields"
import { VehicleInfoFields } from "./VehicleInfoFields"
import { WorkOrderSelect } from "./WorkOrderSelect"
import { InvoiceItemsFields } from "./InvoiceItemsFields"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type InvoiceFormFieldsProps = {
  customerFirstName: string
  setCustomerFirstName: (value: string) => void
  customerLastName: string
  setCustomerLastName: (value: string) => void
  customerEmail: string
  setCustomerEmail: (value: string) => void
  customerPhone: string
  setCustomerPhone: (value: string) => void
  customerAddress: string
  setCustomerAddress: (value: string) => void
  vehicleMake: string
  setVehicleMake: (value: string) => void
  vehicleModel: string
  setVehicleModel: (value: string) => void
  vehicleYear: number
  setVehicleYear: (value: number) => void
  vehicleVin: string
  setVehicleVin: (value: string) => void
  notes: string
  setNotes: (value: string) => void
  selectedWorkOrderId: string
  onWorkOrderSelect: (id: string) => void
  workOrders: any[]
  invoiceItems: any[]
  setInvoiceItems: (items: any[]) => void
}

export function InvoiceFormFields({
  customerFirstName,
  setCustomerFirstName,
  customerLastName,
  setCustomerLastName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vehicleYear,
  setVehicleYear,
  vehicleVin,
  setVehicleVin,
  notes,
  setNotes,
  selectedWorkOrderId,
  onWorkOrderSelect,
  workOrders,
  invoiceItems,
  setInvoiceItems,
}: InvoiceFormFieldsProps) {
  return (
    <div className="space-y-4">
      <WorkOrderSelect
        workOrders={workOrders}
        selectedWorkOrderId={selectedWorkOrderId}
        onWorkOrderSelect={onWorkOrderSelect}
      />

      <CustomerInfoFields
        customerFirstName={customerFirstName}
        setCustomerFirstName={setCustomerFirstName}
        customerLastName={customerLastName}
        setCustomerLastName={setCustomerLastName}
        customerEmail={customerEmail}
        setCustomerEmail={setCustomerEmail}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        customerAddress={customerAddress}
        setCustomerAddress={setCustomerAddress}
      />

      <VehicleInfoFields
        vehicleMake={vehicleMake}
        setVehicleMake={setVehicleMake}
        vehicleModel={vehicleModel}
        setVehicleModel={setVehicleModel}
        vehicleYear={vehicleYear}
        setVehicleYear={setVehicleYear}
        vehicleVin={vehicleVin}
        setVehicleVin={setVehicleVin}
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
