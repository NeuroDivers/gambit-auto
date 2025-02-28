
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

export default function CreateQuote() {
  const navigate = useNavigate()
  const { defaultValues } = useCreateQuoteForm()
  
  const form = useForm({
    defaultValues,
  })
  
  const { submitQuote, isSubmitting } = useQuoteSubmission()
  
  const onSubmit = async (data: any) => {
    try {
      const result = await submitQuote(data)
      if (result && result.id) {
        navigate(`/estimates/${result.id}`)
      }
    } catch (error) {
      console.error("Error submitting quote:", error)
    }
  }
  
  return (
    <div className="container py-6">
      <PageTitle heading="Create Estimate" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CustomerInfoSection form={form} />
          
          <VehicleInfoSection form={form} />
          
          <ServicesSection form={form} />
          
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
