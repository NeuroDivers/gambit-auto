
import { useForm } from "react-hook-form"
import { ServiceSelectionField } from "@/components/shared/form-fields/ServiceSelectionField"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft } from "lucide-react"

type FormData = {
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  service_items: Array<{
    service_id: string
    service_name: string
    quantity: number
    unit_price: number
  }>
  notes: string
}

export default function CreateQuote() {
  const navigate = useNavigate()
  
  const form = useForm<FormData>({
    defaultValues: {
      customer_first_name: "",
      customer_last_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear(),
      vehicle_vin: "",
      service_items: [],
      notes: ""
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Calculate totals
      const subtotal = data.service_items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      )

      // Create quote
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          customer_first_name: data.customer_first_name,
          customer_last_name: data.customer_last_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_vin: data.vehicle_vin,
          notes: data.notes,
          subtotal,
          total: subtotal, // Add tax calculation if needed
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      // Add quote items
      if (quote) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(
            data.service_items.map(item => ({
              quote_id: quote.id,
              service_id: item.service_id,
              service_name: item.service_name,
              quantity: item.quantity,
              unit_price: item.unit_price
            }))
          )

        if (itemsError) throw itemsError
      }

      toast.success("Quote created successfully")
      navigate(`/admin/quotes/${quote?.id}`)
    } catch (error: any) {
      console.error('Error creating quote:', error)
      toast.error("Failed to create quote")
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageTitle 
          title="Create Quote"
          description="Create a new quote for a customer"
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer_last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicle_make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicle_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicle_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicle_vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceSelectionField
                services={form.watch('service_items')}
                onServicesChange={(services) => form.setValue('service_items', services)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional notes here..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Quote
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
