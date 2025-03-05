
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
  const form = useForm()

  // Update the document title when the component mounts
  useEffect(() => {
    document.title = "Create Estimate | Auto Detailing CRM"
  }, [])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Create the estimate in the database
      const { data: estimate, error } = await supabase
        .from("estimates")
        .insert({
          customer_id: data.client_id, // Map client_id to customer_id
          vehicle_id: data.vehicle_id,
          status: "draft",
          total: data.total || 0,
          notes: data.notes || "",
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
              service_id: service.id,
              quantity: service.quantity,
              unit_price: service.price,
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
