
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { 
  Form,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageTitle } from "@/components/shared/PageTitle"
import { CustomerInfoSection } from "@/components/quotes/form-sections/CustomerInfoSection"
import { VehicleInfoSection } from "@/components/quotes/form-sections/VehicleInfoSection"
import { ServicesSection } from "@/components/quotes/form-sections/ServicesSection"
import { NotesSection } from "@/components/quotes/form-sections/NotesSection"
import { useCreateQuoteForm } from "@/components/quotes/hooks/useCreateQuoteForm"
import { useQuoteSubmission } from "@/components/quotes/hooks/useQuoteSubmission"
import { toast } from "sonner"
import { useState } from "react"

export default function CreateQuote() {
  const navigate = useNavigate()
  
  // Initialize with the default form values
  const form = useForm({
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
      vehicle_body_class: "",
      vehicle_doors: undefined,
      vehicle_trim: "",
      service_items: [],
      notes: "",
      status: "draft"
    }
  })
  
  const { submitQuote } = useQuoteSubmission()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const result = await submitQuote(data)
      if (result) {
        toast.success("Estimate created successfully")
        navigate(`/estimates`)
      }
    } catch (error) {
      console.error("Error submitting quote:", error)
      toast.error("Failed to create estimate")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container py-6">
      <PageTitle title="Create Estimate" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CustomerInfoSection form={form} />
          
          <VehicleInfoSection form={form} />
          
          <ServicesSection 
            form={form} 
            services={form.watch('service_items')}
            onServicesChange={(services) => form.setValue('service_items', services)}
          />
          
          <NotesSection form={form} />
          
          <Separator />
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => navigate('/estimates')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Estimate'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
