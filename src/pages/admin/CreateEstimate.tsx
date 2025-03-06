
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Form } from "@/components/ui/form"
import { CustomerSearch } from "@/components/work-orders/form-sections/CustomerSearch"
import { CustomerInfoFields } from "@/components/work-orders/form-sections/CustomerInfoFields"
import { VehicleInfoFields } from "@/components/work-orders/form-sections/VehicleInfoFields"
import { ServiceItemsField } from "@/components/work-orders/form-fields/ServiceItemsField"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { EstimateFormAdapter } from "@/components/estimates/EstimateFormAdapter"
import { EstimateFormValues } from "@/components/estimates/types/estimate-form"

export default function CreateEstimate() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState(0)
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  
  const form = useForm<EstimateFormValues>({
    defaultValues: {
      client_id: '',
      vehicle_id: '',
      services: [],
      total: 0,
      notes: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      street_address: '',
      unit_number: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: '',
      vehicle_serial: '',
      vehicle_color: '',
      vehicle_trim: '',
      vehicle_body_class: '',
      vehicle_doors: '',
      vehicle_license_plate: '',
      // Additional fields to match WorkOrderFormValues
      contact_preference: "phone",
      start_time: null,
      estimated_duration: null,
      end_time: null,
      assigned_bay_id: null,
      service_items: [],
      is_primary_vehicle: false,
      save_vehicle: false
    }
  })

  // Update the document title when the component mounts
  useEffect(() => {
    document.title = "Create Estimate | Auto Detailing CRM"
  }, [])

  // Watch for changes to customer selection
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'client_id' && value.client_id) {
        setSelectedCustomerId(value.client_id as string);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Calculate subtotal when services change
  useEffect(() => {
    const services = form.getValues('services') || [];
    
    const total = services.reduce((sum, service) => {
      // Calculate main service total
      const serviceTotal = (service.quantity || 1) * (service.unit_price || 0);
      
      // Calculate sub-services total if any
      const subServicesTotal = service.sub_services ? 
        service.sub_services.reduce((subSum, subService) => {
          return subSum + ((subService.quantity || 1) * (subService.unit_price || 0));
        }, 0) : 0;
      
      return sum + serviceTotal + subServicesTotal;
    }, 0);
    
    setSubtotal(total);
    form.setValue('total', total);
  }, [form.watch('services')]);

  const onSubmit = async (data: EstimateFormValues) => {
    setIsSubmitting(true)
    try {
      let customerId = data.client_id

      // If we don't have a client_id but we have customer info, create a new customer
      if (!customerId && data.first_name && data.last_name && data.email) {
        // Check if customer with same email already exists
        const { data: existingCustomer, error: lookupError } = await supabase
          .from("customers")
          .select("id, email")
          .eq("email", data.email)
          .maybeSingle()
          
        if (lookupError) throw lookupError
        
        if (existingCustomer) {
          // Use existing customer ID
          customerId = existingCustomer.id
          toast.info(`Using existing customer with email ${data.email}`)
        } else {
          // Create new customer
          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              phone_number: data.phone_number,
              street_address: data.street_address,
              unit_number: data.unit_number,
              city: data.city,
              state_province: data.state_province,
              postal_code: data.postal_code,
              country: data.country
            })
            .select()
            .single()

          if (customerError) throw customerError
          customerId = newCustomer.id
          toast.success("New customer created successfully")
        }
      }

      // Flatten services to format expected by the DB
      const services = data.services || [];
      const flattenedServices = services.flatMap(service => {
        const mainService = {
          service_id: service.service_id,
          service_name: service.service_name,
          description: service.description || "",
          quantity: service.quantity || 1,
          unit_price: service.unit_price || 0
        };
        
        const subServices = service.sub_services?.map(subService => ({
          service_id: subService.service_id,
          service_name: subService.service_name,
          description: subService.description || "",
          quantity: subService.quantity || 1,
          unit_price: subService.unit_price || 0,
          parent_id: service.service_id
        })) || [];
        
        return [mainService, ...subServices];
      });

      // Create the estimate in the database
      const { data: estimate, error } = await supabase
        .from("estimates")
        .insert({
          customer_id: data.client_id,
          status: "draft",
          total: data.total || 0,
          notes: data.notes || "",
          customer_first_name: data.first_name,
          customer_last_name: data.last_name,
          customer_email: data.email,
          customer_phone: data.phone_number,
          customer_street_address: data.street_address,
          customer_unit_number: data.unit_number,
          customer_city: data.city,
          customer_state_province: data.state_province,
          customer_postal_code: data.postal_code,
          customer_country: data.country,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_vin: data.vehicle_serial,
          vehicle_body_class: data.vehicle_body_class,
          vehicle_trim: data.vehicle_trim,
          vehicle_doors: data.vehicle_doors,
          estimate_number: `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        })
        .select()
        .single()

      if (error) throw error

      // Create estimate items
      if (estimate && flattenedServices.length > 0) {
        const { error: itemsError } = await supabase
          .from("estimate_items")
          .insert(
            flattenedServices.map(service => ({
              estimate_id: estimate.id,
              service_id: service.service_id,
              quantity: service.quantity,
              unit_price: service.unit_price,
              service_name: service.service_name,
              description: service.description || "",
            }))
          )

        if (itemsError) throw itemsError
      }

      toast.success("Estimate created successfully")
      navigate(`/estimates/${estimate.id}`)
    } catch (error) {
      console.error("Error creating estimate:", error)
      toast.error("Failed to create estimate")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-3">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/estimates")}
            className="flex-shrink-0"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageTitle 
            title="Create Estimate" 
            description="Create a new estimate for a customer."
          />
        </div>
      </div>
      
      <div className="flex-1 px-6 pb-6">
        <div className="max-w-7xl mx-auto py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <EstimateFormAdapter form={form}>
                <CustomerSearch form={form} />
              </EstimateFormAdapter>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EstimateFormAdapter form={form}>
                      <CustomerInfoFields form={form} isEditing={false} />
                    </EstimateFormAdapter>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EstimateFormAdapter form={form}>
                      <VehicleInfoFields form={form} />
                    </EstimateFormAdapter>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <ServiceItemsField 
                    value={form.watch('services') || []} 
                    onChange={(services) => form.setValue('services', services)}
                    allowPriceEdit={true}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes or information for this estimate"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total:</span>
                      <div className="text-xl font-bold">${subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="min-w-[150px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Estimate"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
