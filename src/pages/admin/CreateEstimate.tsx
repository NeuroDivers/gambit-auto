
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { EstimateForm } from "@/components/quotes/EstimateForm"

export default function CreateEstimate() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm({
    defaultValues: {
      client_id: '',
      vehicle_id: '',
      services: [],
      total: 0,
      notes: '',
      customer_first_name: '',
      customer_last_name: '',
      customer_email: '',
      customer_phone: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: '',
      vehicle_vin: ''
    }
  })

  // Update the document title when the component mounts
  useEffect(() => {
    document.title = "Create Estimate | Auto Detailing CRM"
  }, [])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      let customerId = data.client_id

      // If createNewCustomer is true, create a new customer entry
      if (data.createNewCustomer) {
        // Check if customer with same email already exists
        const { data: existingCustomer, error: lookupError } = await supabase
          .from("customers")
          .select("id, email")
          .eq("email", data.customer_email)
          .maybeSingle()
          
        if (lookupError) throw lookupError
        
        if (existingCustomer) {
          // Use existing customer ID
          customerId = existingCustomer.id
          toast.info(`Using existing customer with email ${data.customer_email}`)
        } else {
          // Create new customer
          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
              first_name: data.customer_first_name,
              last_name: data.customer_last_name,
              email: data.customer_email,
              phone_number: data.customer_phone
            })
            .select()
            .single()

          if (customerError) throw customerError
          customerId = newCustomer.id
          toast.success("New customer created successfully")
        }
      }

      // Create the estimate in the database
      const { data: estimate, error } = await supabase
        .from("estimates")
        .insert({
          customer_id: customerId,
          vehicle_id: data.vehicle_id,
          status: "draft",
          total: data.total || 0,
          notes: data.notes || "",
          customer_first_name: data.customer_first_name,
          customer_last_name: data.customer_last_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_vin: data.vehicle_vin,
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
            data.services.map((service) => ({
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

      <EstimateForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
