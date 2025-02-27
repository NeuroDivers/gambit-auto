
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useNavigate, useLocation } from "react-router-dom"
import { PageTitle } from "@/components/shared/PageTitle"
import { ArrowLeft, Search, Camera } from "lucide-react"
import { Client } from "@/components/clients/types"
import { useEffect, useState } from "react"
import { CustomerInfoSection } from "@/components/quotes/form-sections/CustomerInfoSection"
import { VehicleInfoSection } from "@/components/quotes/form-sections/VehicleInfoSection"
import { ServicesSection } from "@/components/quotes/form-sections/ServicesSection"
import { NotesSection } from "@/components/quotes/form-sections/NotesSection"
import { ClientSearchDialog } from "@/components/quotes/form-sections/ClientSearchDialog"
import { useCreateQuoteForm } from "@/components/quotes/hooks/useCreateQuoteForm"
import { supabase } from "@/integrations/supabase/client"

export default function CreateQuote() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const { form, onSubmit } = useCreateQuoteForm()

  // Check if we're returning from the VIN scanner page
  useEffect(() => {
    if (location.state?.scannedVin) {
      form.setValue('vehicle_vin', location.state.scannedVin)
      
      // Set vehicle info if available
      if (location.state.vehicleInfo) {
        const { make, model, year } = location.state.vehicleInfo
        if (make) form.setValue('vehicle_make', make)
        if (model) form.setValue('vehicle_model', model)
        if (year) form.setValue('vehicle_year', parseInt(year))
      }
    }
  }, [location.state, form])

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

  const handleScanVin = () => {
    navigate('/estimates/scan-vin', { state: { returnPath: '/estimates/create' } })
  }

  return (
    <div className="space-y-6 p-6 md:p-6 p-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/estimates')}
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
        <form onSubmit={onSubmit} className="space-y-6">
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
            <VehicleInfoSection form={form} scanVinAction={handleScanVin} />
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
