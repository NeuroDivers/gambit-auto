
import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerSearch } from "../work-orders/form-sections/CustomerSearch"
import { InvoiceItemsFields } from "../invoices/form-sections/InvoiceItemsFields"
import { Button } from "@/components/ui/button"
import { VehicleInfoFields } from "../work-orders/form-sections/VehicleInfoFields"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { ServiceItemType } from "@/types/service-item"

type EstimateFormProps = {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting: boolean
}

export function EstimateForm({ form, onSubmit, isSubmitting }: EstimateFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [subtotal, setSubtotal] = useState<number>(0)
  
  // Watch for service item changes to calculate totals
  const serviceItems = form.watch('services') || []
  
  // Calculate subtotal when service items change
  useEffect(() => {
    const total = serviceItems.reduce((sum: number, service: ServiceItemType) => {
      return sum + (service.quantity * service.unit_price)
    }, 0)
    
    setSubtotal(total)
    form.setValue("total", total)
  }, [serviceItems, form])
  
  // Watch for changes to customer selection
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'client_id' && value.client_id) {
        setSelectedCustomerId(value.client_id as string);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <CustomerSearch form={form} />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleInfoFields 
              form={form}
              isEditing={false}
              customerId={selectedCustomerId}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceItemsFields
              items={serviceItems}
              setItems={(items) => form.setValue('services', items)}
              allowPriceEdit={true}
              showCommission={true}
            />
            
            <div className="pt-4 border-t mt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg">Total:</span>
                <div className="text-xl font-bold">${subtotal.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes for this estimate"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end pt-6">
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Estimate"}
        </Button>
      </div>
    </form>
  )
}
