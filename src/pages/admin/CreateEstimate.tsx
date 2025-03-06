
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { EstimateForm } from "@/components/quotes/EstimateForm"
import { Form } from "@/components/ui/form"
import { ServiceItemType } from "@/types/service-item"

export default function CreateEstimate() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm({
    defaultValues: {
      client_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      contact_preference: 'phone' as 'phone' | 'email',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: new Date().getFullYear(),
      vehicle_serial: '',
      vehicle_trim: '',
      vehicle_body_class: '',
      vehicle_doors: null as number | null,
      services: [] as ServiceItemType[],
      notes: '',
      total: 0,
      save_vehicle: false
    }
  })

  // Update the document title when the component mounts
  useEffect(() => {
    document.title = "Create Estimate | Auto Detailing CRM"
  }, [])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      let customerId = data.client_id

      // If no client_id but we have customer information, create a new customer
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
              contact_preference: data.contact_preference
            })
            .select()
            .single()

          if (customerError) throw customerError
          customerId = newCustomer.id
          toast.success("New customer created successfully")
        }
      }

      // Save vehicle if needed
      let vehicleId = null;
      if (data.save_vehicle && customerId && data.vehicle_make && data.vehicle_model) {
        const { data: vehicle, error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            customer_id: customerId,
            make: data.vehicle_make,
            model: data.vehicle_model,
            year: data.vehicle_year,
            vin: data.vehicle_serial || null,
            trim: data.vehicle_trim || null,
            body_class: data.vehicle_body_class || null,
            doors: data.vehicle_doors || null
          })
          .select()
          .single();

        if (vehicleError) {
          console.error("Error saving vehicle:", vehicleError);
          // Continue without saving vehicle
        } else {
          vehicleId = vehicle.id;
        }
      }

      // Create the estimate in the database
      const { data: estimate, error } = await supabase
        .from("estimates")
        .insert({
          customer_id: customerId,
          vehicle_id: vehicleId,
          status: "draft",
          total: data.total || 0,
          notes: data.notes || "",
          customer_first_name: data.first_name,
          customer_last_name: data.last_name,
          customer_email: data.email,
          customer_phone: data.phone_number,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_vin: data.vehicle_serial,
          vehicle_trim: data.vehicle_trim,
          vehicle_body_class: data.vehicle_body_class,
          vehicle_doors: data.vehicle_doors,
          estimate_number: `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        })
        .select()
        .single()

      if (error) throw error

      // Create estimate items
      if (estimate && data.services && data.services.length > 0) {
        const { error: itemsError } = await supabase
          .from("estimate_items")
          .insert(
            data.services.map((service: ServiceItemType) => ({
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/estimates")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageTitle
          title="Create Estimate"
          description="Create a new estimate for a customer"
        />
      </div>

      <Form {...form}>
        <EstimateForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </Form>
    </div>
  )
}
