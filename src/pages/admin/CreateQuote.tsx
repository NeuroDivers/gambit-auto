
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useNavigate } from "react-router-dom"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft, Search } from "lucide-react"
import { Client } from "@/components/clients/types"
import { useState, useEffect } from "react"
import { CustomerInfoSection } from "@/components/quotes/form-sections/CustomerInfoSection"
import { VehicleInfoSection } from "@/components/quotes/form-sections/VehicleInfoSection"
import { ServicesSection } from "@/components/quotes/form-sections/ServicesSection"
import { NotesSection } from "@/components/quotes/form-sections/NotesSection"
import { ClientSearchDialog } from "@/components/quotes/form-sections/ClientSearchDialog"
import { useCreateQuoteForm } from "@/components/quotes/hooks/useCreateQuoteForm"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export default function CreateQuote() {
  const navigate = useNavigate()
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const { form, onSubmit } = useCreateQuoteForm()

  // Check for VIN scanning results when component mounts or regains focus
  useEffect(() => {
    const checkForScannedVin = () => {
      const scannedVin = sessionStorage.getItem('scanned-vin')
      if (scannedVin) {
        console.log('CreateQuote: Found scanned VIN in sessionStorage:', scannedVin)
        form.setValue('vehicle_vin', scannedVin, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
        sessionStorage.removeItem('scanned-vin')
        toast.success(`VIN imported: ${scannedVin}`)
      }
    }

    // Check immediately when component mounts
    checkForScannedVin()

    // Also check when window regains focus
    window.addEventListener('focus', checkForScannedVin)
    
    return () => {
      window.removeEventListener('focus', checkForScannedVin)
    }
  }, [form])

  const handleClientSelect = async (client: Client) => {
    form.setValue('customer_first_name', client.first_name)
    form.setValue('customer_last_name', client.last_name)
    form.setValue('customer_email', client.email)
    form.setValue('customer_phone', client.phone_number || '')
    form.setValue('customer_address', client.street_address || '')
    setSearchDialogOpen(false)

    // Fetch client's vehicles
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('client_id', client.id)
      .eq('is_primary', true)
      .maybeSingle()

    if (error) {
      console.error('Error fetching vehicle:', error)
      return
    }

    if (vehicles) {
      form.setValue('vehicle_make', vehicles.make)
      form.setValue('vehicle_model', vehicles.model)
      form.setValue('vehicle_year', vehicles.year)
      form.setValue('vehicle_vin', vehicles.vin || '')
      form.setValue('vehicle_body_class', vehicles.body_class || '')
      form.setValue('vehicle_doors', vehicles.doors || undefined)
      form.setValue('vehicle_trim', vehicles.trim || '')
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-6 p-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/estimates')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageTitle 
            title="Create Estimate"
            description="Create a new estimate for a customer"
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSearchDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Search className="mr-2 h-4 w-4" />
              Search Customers
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <CustomerInfoSection form={form} />
            <VehicleInfoSection form={form} />
            <ServicesSection form={form} />
            <NotesSection form={form} />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Create Estimate
            </Button>
          </div>
        </form>
      </Form>

      <ClientSearchDialog 
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        onClientSelect={handleClientSelect}
      />
    </div>
  )
}
