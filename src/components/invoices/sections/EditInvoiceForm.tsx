
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues } from "../types"
import { InvoiceStatusField } from "../form-sections/InvoiceStatusField"
import { InvoiceNotesField } from "../form-sections/InvoiceNotesField"
import { CustomerInfoFields } from "../form-sections/CustomerInfoFields"
import { VehicleInfoFields } from "../form-sections/VehicleInfoFields"
import { InvoiceServiceItems } from "./InvoiceServiceItems"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

type EditInvoiceFormProps = {
  form: UseFormReturn<InvoiceFormValues>
  onSubmit: (values: InvoiceFormValues) => void
  isPending: boolean
  invoiceId: string | undefined
  clients?: any[]
  isLoadingClients?: boolean
  onClientSelect?: (clientId: string) => void
}

export function EditInvoiceForm({ 
  form, 
  onSubmit, 
  isPending, 
  invoiceId,
  clients = [],
  isLoadingClients = false,
  onClientSelect
}: EditInvoiceFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InvoiceStatusField form={form} />
            
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
                            "pl-3 text-left font-normal w-[240px]",
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
          <CardContent>
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
              clients={clients}
              isLoadingClients={isLoadingClients}
              onClientSelect={onClientSelect}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleInfoFields 
              vehicleMake={form.watch('vehicle_make')}
              setVehicleMake={(value) => form.setValue('vehicle_make', value)}
              vehicleModel={form.watch('vehicle_model')}
              setVehicleModel={(value) => form.setValue('vehicle_model', value)}
              vehicleYear={form.watch('vehicle_year')}
              setVehicleYear={(value) => form.setValue('vehicle_year', value)}
              vehicleVin={form.watch('vehicle_vin')}
              setVehicleVin={(value) => form.setValue('vehicle_vin', value)}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceServiceItems form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceNotesField form={form} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 sticky bottom-0 bg-background py-4 border-t">
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
