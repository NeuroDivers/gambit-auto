import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { InvoiceFormFields } from "./form-sections/InvoiceFormFields"
import { useInvoiceFormSubmission } from "./form-sections/useInvoiceFormSubmission"

type CreateInvoiceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleYear, setVehicleYear] = useState<number>(new Date().getFullYear())
  const [vehicleVin, setVehicleVin] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>("")
  const [invoiceItems, setInvoiceItems] = useState<any[]>([])
  
  const { data: workOrders } = useQuery({
    queryKey: ["work-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*, work_order_services(service_id, quantity, unit_price, service_types(name))")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      return data
    },
  })

  const { data: businessProfile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profile")
        .select("*")
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })

  const { data: businessTaxes } = useQuery({
    queryKey: ["business-taxes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_taxes")
        .select("*")

      if (error) throw error
      return data
    },
  })

  const handleWorkOrderSelect = async (workOrderId: string) => {
    setSelectedWorkOrderId(workOrderId)
    const workOrder = workOrders?.find(wo => wo.id === workOrderId)
    
    if (workOrder) {
      setCustomerName(`${workOrder.first_name} ${workOrder.last_name}`)
      setCustomerEmail(workOrder.email)
      setCustomerPhone(workOrder.phone_number)
      setVehicleMake(workOrder.vehicle_make)
      setVehicleModel(workOrder.vehicle_model)
      setVehicleYear(workOrder.vehicle_year)
      setVehicleVin(workOrder.vehicle_serial)
      setNotes(workOrder.additional_notes || "")
      
      // Convert work order services to invoice items
      const items = workOrder.work_order_services.map((service: any) => ({
        service_name: service.service_types.name,
        description: service.service_types.name,
        quantity: service.quantity,
        unit_price: service.unit_price,
      }))
      setInvoiceItems(items)
    }
  }

  const { handleSubmit } = useInvoiceFormSubmission({
    onSuccess: () => {
      onOpenChange(false)
      setCustomerName("")
      setCustomerEmail("")
      setCustomerPhone("")
      setCustomerAddress("")
      setVehicleMake("")
      setVehicleModel("")
      setVehicleYear(new Date().getFullYear())
      setVehicleVin("")
      setNotes("")
      setSelectedWorkOrderId("")
      setInvoiceItems([])
    },
    selectedWorkOrderId,
    customerName,
    customerEmail,
    customerAddress,
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleVin,
    invoiceItems,
    businessProfile,
    businessTaxes
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice from scratch or convert an existing work order.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InvoiceFormFields
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}
            vehicleMake={vehicleMake}
            setVehicleMake={setVehicleMake}
            vehicleModel={vehicleModel}
            setVehicleModel={setVehicleModel}
            vehicleYear={vehicleYear}
            setVehicleYear={setVehicleYear}
            vehicleVin={vehicleVin}
            setVehicleVin={setVehicleVin}
            notes={notes}
            setNotes={setNotes}
            selectedWorkOrderId={selectedWorkOrderId}
            onWorkOrderSelect={handleWorkOrderSelect}
            workOrders={workOrders || []}
            invoiceItems={invoiceItems}
            setInvoiceItems={setInvoiceItems}
          />
          <Button type="submit" className="w-full">
            Create Invoice
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}