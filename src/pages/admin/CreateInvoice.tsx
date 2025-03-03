import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { InvoiceFormValues, InvoiceItem } from "@/components/invoices/types"
import { Customer } from "@/components/customers/types"
import { Card, CardContent } from "@/components/ui/card"
import { CustomerInfoFields } from "@/components/invoices/form-sections/CustomerInfoFields"
import { VehicleInfoFields } from "@/components/invoices/form-sections/VehicleInfoFields"
import { InvoiceStatusField } from "@/components/invoices/form-sections/InvoiceStatusField"
import { InvoiceNotesField } from "@/components/invoices/form-sections/InvoiceNotesField"
import { InvoiceItemsFields } from "@/components/invoices/form-sections/InvoiceItemsFields"
import { FormField, FormItem, FormLabel, FormControl, Form } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { InvoiceTaxSummary } from "@/components/invoices/form-sections/InvoiceTaxSummary"

interface LocationState {
  preselectedCustomer?: Customer;
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const location = useLocation()
  const { preselectedCustomer } = location.state as LocationState || {}
  const [isPending, setIsPending] = useState(false)
  const [customers, setCustomers] = useState([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [vehicleBodyClass, setVehicleBodyClass] = useState("")
  const [vehicleDoors, setVehicleDoors] = useState(0)
  const [vehicleTrim, setVehicleTrim] = useState("")

  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      status: 'draft',
      customer_first_name: preselectedCustomer?.first_name || '',
      customer_last_name: preselectedCustomer?.last_name || '',
      customer_email: preselectedCustomer?.email || '',
      customer_phone: preselectedCustomer?.phone_number || '',
      customer_address: preselectedCustomer?.address || '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: new Date().getFullYear(),
      vehicle_vin: '',
      notes: '',
      invoice_items: [],
      due_date: null,
      subtotal: 0,
      gst_amount: 0,
      qst_amount: 0,
      total: 0
    }
  })

  const onSubmit = async (values: InvoiceFormValues) => {
    setIsPending(true)
    try {
      const subtotal = values.invoice_items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      )

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          customer_first_name: values.customer_first_name,
          customer_last_name: values.customer_last_name,
          customer_email: values.customer_email,
          customer_phone: values.customer_phone,
          customer_address: values.customer_address,
          vehicle_make: values.vehicle_make,
          vehicle_model: values.vehicle_model,
          vehicle_year: values.vehicle_year,
          vehicle_vin: values.vehicle_vin,
          notes: values.notes,
          due_date: values.due_date,
          subtotal,
          total: subtotal,
          status: 'draft',
          customer_id: preselectedCustomer?.id
        })
        .select()
        .single()

      if (error) throw error

      if (invoice && values.invoice_items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            values.invoice_items.map(item => ({
              invoice_id: invoice.id,
              service_id: item.service_id,
              service_name: item.service_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              description: item.description
            }))
          )

        if (itemsError) throw itemsError
      }

      toast.success("Invoice created successfully")
      navigate(`/admin/invoices/${invoice.id}/edit`)
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error("Failed to create invoice")
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (preselectedCustomer?.id) {
      const fetchDefaultVehicle = async () => {
        const { data: vehicles, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('customer_id', preselectedCustomer.id)
          .eq('is_primary', true)
          .maybeSingle()

        if (error) {
          console.error('Error fetching vehicle:', error)
          return
        }

        if (vehicles) {
          form.setValue('vehicle_make', vehicles.make)
          form.setValue('vehicle_model', vehicles.model)
          form.setValue('vehicle_year', vehicles.year)
          form.setValue('vehicle_vin', vehicles.vin || '')
        }
      }

      fetchDefaultVehicle()
    }
  }, [preselectedCustomer?.id, form])

  const handleTotalCalculated = (subtotal: number, gst: number, qst: number, total: number) => {
    form.setValue('subtotal', subtotal)
    form.setValue('gst_amount', gst)
    form.setValue('qst_amount', qst)
    form.setValue('total', total)
  }

  const handleItemsChange = (items: InvoiceItem[] | any[]) => {
    form.setValue('invoice_items', items as InvoiceItem[]);
  };

  const onCustomerSelect = (customerId: string) => {
    console.log("Customer selected:", customerId)
  }

  return (
    <div className="container mx-auto h-full flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/invoices")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageTitle 
          title="Create Invoice" 
          description="Create a new invoice for a customer"
        />
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <InvoiceStatusField form={form} defaultValue={form.watch('status')} />
                  
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal w-full",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? date.toISOString() : null)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <CustomerInfoFields 
                    customerFirstName={form.watch('customer_first_name')}
                    setCustomerFirstName={(value) => form.setValue('customer_first_name', value)}
                    customerLastName={form.watch('customer_last_name')}
                    setCustomerLastName={(value) => form.setValue('customer_last_name', value)}
                    customerEmail={form.watch('customer_email')}
                    setCustomerEmail={(value) => form.setValue('customer_email', value)}
                    customerPhone={form.watch('customer_phone')}
                    setCustomerPhone={(value) => form.setValue('customer_phone', value)}
                    customerAddress={form.watch('customer_address')}
                    setCustomerAddress={(value) => form.setValue('customer_address', value)}
                    customers={customers}
                    isLoadingCustomers={isLoadingCustomers}
                    onCustomerSelect={onCustomerSelect}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <VehicleInfoFields
                    vehicleMake={form.watch('vehicle_make')}
                    setVehicleMake={(value) => form.setValue('vehicle_make', value)}
                    vehicleModel={form.watch('vehicle_model')}
                    setVehicleModel={(value) => form.setValue('vehicle_model', value)}
                    vehicleYear={form.watch('vehicle_year')}
                    setVehicleYear={(value) => form.setValue('vehicle_year', value)}
                    vehicleVin={form.watch('vehicle_vin')}
                    setVehicleVin={(value) => form.setValue('vehicle_vin', value)}
                    vehicleBodyClass={vehicleBodyClass}
                    setVehicleBodyClass={setVehicleBodyClass}
                    vehicleDoors={vehicleDoors}
                    setVehicleDoors={setVehicleDoors}
                    vehicleTrim={vehicleTrim}
                    setVehicleTrim={setVehicleTrim}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Service Items</h3>
                  <InvoiceItemsFields
                    items={form.watch('invoice_items')}
                    setItems={handleItemsChange}
                    allowPriceEdit={true}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <InvoiceTaxSummary 
                    items={form.watch('invoice_items')} 
                    onTotalCalculated={handleTotalCalculated}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <InvoiceNotesField form={form} />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4 p-4 border-t bg-background sticky bottom-0">
            <Button variant="outline" type="button" onClick={() => navigate("/admin/invoices")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
