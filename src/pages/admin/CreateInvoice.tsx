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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CustomerInfoFields } from "@/components/invoices/form-sections/CustomerInfoFields"
import { VehicleInfoFields } from "@/components/invoices/form-sections/VehicleInfoFields"
import { InvoiceStatusField } from "@/components/invoices/form-sections/InvoiceStatusField"
import { InvoiceNotesField } from "@/components/invoices/form-sections/InvoiceNotesField"
import { InvoiceServiceItems } from "@/components/invoices/sections/InvoiceServiceItems"
import { FormField, FormItem, FormLabel, FormControl, Form } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { InvoiceTaxSummary } from "@/components/invoices/form-sections/InvoiceTaxSummary"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface LocationState {
  preselectedCustomer?: Customer;
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const location = useLocation()
  const { preselectedCustomer } = location.state as LocationState || {}
  const [isPending, setIsPending] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(preselectedCustomer?.id || null)
  const [saveVehicleToCustomer, setSaveVehicleToCustomer] = useState(false)
  const [vehicleBodyClass, setVehicleBodyClass] = useState("")
  const [vehicleDoors, setVehicleDoors] = useState(0)
  const [vehicleTrim, setVehicleTrim] = useState("")
  
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear())
  const [vehicleVin, setVehicleVin] = useState("")

  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      status: 'draft',
      customer_first_name: preselectedCustomer?.customer_first_name || '',
      customer_last_name: preselectedCustomer?.customer_last_name || '',
      customer_email: preselectedCustomer?.customer_email || '',
      customer_phone: preselectedCustomer?.customer_phone || "",
      customer_address: preselectedCustomer?.customer_address || '',
      customer_street_address: preselectedCustomer?.customer_street_address || '',
      customer_unit_number: preselectedCustomer?.customer_unit_number || '',
      customer_city: preselectedCustomer?.customer_city || '',
      customer_state_province: preselectedCustomer?.customer_state_province || '',
      customer_postal_code: preselectedCustomer?.customer_postal_code || '',
      customer_country: preselectedCustomer?.customer_country || '',
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
          customer_id: selectedCustomerId,
          customer_first_name: values.customer_first_name,
          customer_last_name: values.customer_last_name,
          customer_email: values.customer_email,
          customer_phone: values.customer_phone,
          customer_address: values.customer_address,
          customer_street_address: values.customer_street_address,
          customer_unit_number: values.customer_unit_number,
          customer_city: values.customer_city,
          customer_state_province: values.customer_state_province,
          customer_postal_code: values.customer_postal_code,
          customer_country: values.customer_country,
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear,
          vehicle_vin: vehicleVin,
          vehicle_body_class: vehicleBodyClass,
          vehicle_doors: vehicleDoors,
          vehicle_trim: vehicleTrim,
          notes: values.notes,
          due_date: values.due_date,
          subtotal,
          total: subtotal,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      if (saveVehicleToCustomer && selectedCustomerId && vehicleMake && vehicleModel && vehicleYear) {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            customer_id: selectedCustomerId,
            make: vehicleMake,
            model: vehicleModel,
            year: vehicleYear,
            vin: vehicleVin,
            body_class: vehicleBodyClass,
            doors: vehicleDoors,
            trim: vehicleTrim,
            is_primary: false,
          })

        if (vehicleError) {
          console.error('Error saving vehicle:', vehicleError)
          // Continue execution even if vehicle save fails
        }
      }

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
              description: item.description,
              commission_rate: item.commission_rate,
              commission_type: item.commission_type,
              assigned_profile_id: item.assigned_profile_id
            }))
          )

        if (itemsError) throw itemsError
      }

      toast.success("Invoice created successfully")
      navigate(`/invoices/${invoice.id}/edit`)
    } catch (error: any) {
      console.error('Error creating invoice:', error)
      toast.error("Failed to create invoice: " + error.message)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (preselectedCustomer?.id) {
      setSelectedCustomerId(preselectedCustomer.id)
      
      const fetchCustomerVehicles = async () => {
        const { data: vehicles, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('customer_id', preselectedCustomer.id)
          .order('is_primary', { ascending: false })

        if (error) {
          console.error('Error fetching vehicles:', error)
          return
        }

        if (vehicles && vehicles.length > 0) {
          const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0];
          
          setVehicleMake(primaryVehicle.make || '')
          setVehicleModel(primaryVehicle.model || '')
          setVehicleYear(primaryVehicle.year || new Date().getFullYear())
          setVehicleVin(primaryVehicle.vin || '')
          setVehicleBodyClass(primaryVehicle.body_class || '')
          setVehicleDoors(primaryVehicle.doors || 0)
          setVehicleTrim(primaryVehicle.trim || '')
          console.log("Loaded vehicle:", primaryVehicle)
        }
      }

      fetchCustomerVehicles()
    }
  }, [preselectedCustomer?.id])

  const handleTotalCalculated = (subtotal: number, gst: number, qst: number, total: number) => {
    form.setValue('subtotal', subtotal)
    form.setValue('gst_amount', gst)
    form.setValue('qst_amount', qst)
    form.setValue('total', total)
  }

  const handleItemsChange = (items: InvoiceItem[] | any[]) => {
    form.setValue('invoice_items', items as InvoiceItem[]);
  };

  const onCustomerSelect = async (customerId: string) => {
    setSelectedCustomerId(customerId)
    
    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_primary', { ascending: false })

      if (error) {
        console.error('Error fetching customer vehicles:', error)
        return
      }

      if (vehicles && vehicles.length > 0) {
        const primaryVehicle = vehicles.find(v => v.is_primary) || vehicles[0];
        
        setVehicleMake(primaryVehicle.make || '')
        setVehicleModel(primaryVehicle.model || '')
        setVehicleYear(primaryVehicle.year || new Date().getFullYear())
        setVehicleVin(primaryVehicle.vin || '')
        setVehicleBodyClass(primaryVehicle.body_class || '')
        setVehicleDoors(primaryVehicle.doors || 0)
        setVehicleTrim(primaryVehicle.trim || '')
        
        toast.success(`Vehicle loaded: ${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}`)
      } else {
        setVehicleMake('')
        setVehicleModel('')
        setVehicleYear(new Date().getFullYear())
        setVehicleVin('')
        setVehicleBodyClass('')
        setVehicleDoors(0)
        setVehicleTrim('')
      }
    } catch (error) {
      console.error("Error loading customer vehicles:", error)
    }
  }

  return (
    <div className="container mx-auto h-full flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/invoices")}
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
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <InvoiceStatusField 
                    value={form.watch('status')}
                    onChange={(value) => form.setValue('status', value)}
                  />
                  
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
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
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
                    customerStreetAddress={form.watch('customer_street_address')}
                    setCustomerStreetAddress={(value) => form.setValue('customer_street_address', value)}
                    customerUnitNumber={form.watch('customer_unit_number')}
                    setCustomerUnitNumber={(value) => form.setValue('customer_unit_number', value)}
                    customerCity={form.watch('customer_city')}
                    setCustomerCity={(value) => form.setValue('customer_city', value)}
                    customerStateProvince={form.watch('customer_state_province')}
                    setCustomerStateProvince={(value) => form.setValue('customer_state_province', value)}
                    customerPostalCode={form.watch('customer_postal_code')}
                    setCustomerPostalCode={(value) => form.setValue('customer_postal_code', value)}
                    customerCountry={form.watch('customer_country')}
                    setCustomerCountry={(value) => form.setValue('customer_country', value)}
                    onCustomerSelect={onCustomerSelect}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <VehicleInfoFields
                    make={vehicleMake}
                    setMake={setVehicleMake}
                    model={vehicleModel}
                    setModel={setVehicleModel}
                    year={vehicleYear}
                    setYear={(value) => setVehicleYear(typeof value === 'string' ? parseInt(value) : value)}
                    vin={vehicleVin}
                    setVin={setVehicleVin}
                    bodyClass={vehicleBodyClass}
                    setBodyClass={setVehicleBodyClass}
                    doors={vehicleDoors}
                    setDoors={(value) => setVehicleDoors(typeof value === 'string' ? parseInt(value) : value)}
                    trim={vehicleTrim}
                    setTrim={setVehicleTrim}
                    customerId={selectedCustomerId}
                  />
                  
                  {selectedCustomerId && (
                    <div className="flex items-center space-x-2 mt-4">
                      <Switch
                        id="saveVehicle"
                        checked={saveVehicleToCustomer}
                        onCheckedChange={setSaveVehicleToCustomer}
                      />
                      <Label
                        htmlFor="saveVehicle"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Save vehicle to customer profile
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Items</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <InvoiceServiceItems
                    items={form.watch('invoice_items')}
                    setItems={handleItemsChange}
                    allowPriceEdit={true}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <InvoiceTaxSummary 
                    items={form.watch('invoice_items')} 
                    onTotalCalculated={handleTotalCalculated}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <InvoiceNotesField 
                    value={form.watch('notes')}
                    onChange={(value) => form.setValue('notes', value)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4 p-4 border-t bg-background sticky bottom-0">
            <Button variant="outline" type="button" onClick={() => navigate("/invoices")}>
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
