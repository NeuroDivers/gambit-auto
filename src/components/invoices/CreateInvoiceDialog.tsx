import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CustomerInfoFields } from "./form-sections/CustomerInfoFields"
import { VehicleInfoFields } from "./form-sections/VehicleInfoFields"
import { WorkOrderSelect } from "./form-sections/WorkOrderSelect"

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
  const { toast } = useToast()
  
  const { data: workOrders } = useQuery({
    queryKey: ["work-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let workOrderId = selectedWorkOrderId
      
      if (!workOrderId) {
        const { data: workOrder, error: workOrderError } = await supabase
          .from("work_orders")
          .insert({
            first_name: customerName.split(" ")[0] || "",
            last_name: customerName.split(" ")[1] || "",
            email: customerEmail,
            phone_number: customerPhone,
            contact_preference: "email",
            vehicle_make: vehicleMake,
            vehicle_model: vehicleModel,
            vehicle_year: vehicleYear,
            vehicle_serial: vehicleVin,
            additional_notes: notes,
            status: "completed"
          })
          .select()
          .single()

        if (workOrderError) throw workOrderError
        workOrderId = workOrder.id
      }

      const { data: invoice, error: invoiceError } = await supabase
        .rpc('create_invoice_from_work_order', {
          work_order_id: workOrderId
        })

      if (invoiceError) throw invoiceError

      // Update invoice with customer and business information
      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_address: customerAddress,
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear,
          vehicle_vin: vehicleVin,
          company_name: businessProfile?.company_name || null,
          company_phone: businessProfile?.phone_number || null,
          company_email: businessProfile?.email || null,
          company_address: businessProfile?.address || null,
          gst_number: businessTaxes?.find(tax => tax.tax_type === 'GST')?.tax_number || null,
          qst_number: businessTaxes?.find(tax => tax.tax_type === 'QST')?.tax_number || null,
        })
        .eq("id", invoice)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Invoice created successfully",
      })

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <WorkOrderSelect
            workOrders={workOrders}
            selectedWorkOrderId={selectedWorkOrderId}
            onWorkOrderSelect={handleWorkOrderSelect}
          />

          <CustomerInfoFields
            customerName={customerName}
            setCustomerName={setCustomerName}
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
          <Button type="submit" className="w-full">
            Create Invoice
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}