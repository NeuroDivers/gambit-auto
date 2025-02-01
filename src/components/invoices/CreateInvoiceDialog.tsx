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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  
  // Fetch work orders for the lookup
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
      // If we have a selected work order, use it directly
      let workOrderId = selectedWorkOrderId
      
      // If no work order selected, create a new one
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

      // Create invoice from the work order using the database function
      const { data: invoice, error: invoiceError } = await supabase
        .rpc('create_invoice_from_work_order', {
          work_order_id: workOrderId
        })

      if (invoiceError) throw invoiceError

      // Update the invoice with additional customer information
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
          <div className="space-y-4">
            <div>
              <Label>Work Order (Optional)</Label>
              <Select
                value={selectedWorkOrderId}
                onValueChange={handleWorkOrderSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a work order to pre-fill form..." />
                </SelectTrigger>
                <SelectContent>
                  {workOrders?.map((wo) => (
                    <SelectItem key={wo.id} value={wo.id}>
                      {wo.first_name} {wo.last_name} - {wo.vehicle_make} {wo.vehicle_model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name..."
                required
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter customer email..."
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter customer phone..."
                required
              />
            </div>
            <div>
              <Label htmlFor="customerAddress">Customer Address</Label>
              <Textarea
                id="customerAddress"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Enter customer address..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleMake">Vehicle Make</Label>
                <Input
                  id="vehicleMake"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  placeholder="Enter vehicle make..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleModel">Vehicle Model</Label>
                <Input
                  id="vehicleModel"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Enter vehicle model..."
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleYear">Vehicle Year</Label>
                <Input
                  id="vehicleYear"
                  type="number"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(parseInt(e.target.value))}
                  placeholder="Enter vehicle year..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleVin">Vehicle VIN</Label>
                <Input
                  id="vehicleVin"
                  value={vehicleVin}
                  onChange={(e) => setVehicleVin(e.target.value)}
                  placeholder="Enter vehicle VIN..."
                  required
                />
              </div>
            </div>
          </div>

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